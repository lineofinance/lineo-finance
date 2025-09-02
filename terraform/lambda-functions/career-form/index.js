// Using AWS SDK v3 for Node.js 18 runtime
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const sesClient = new SESClient({ region: process.env.AWS_REGION || 'eu-central-1' });
const s3Client = new S3Client({ region: process.env.AWS_REGION || 'eu-central-1' });

// CORS headers for response
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // In production, replace with your domain
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'OPTIONS,POST'
};

// Max file size (10MB in base64 is roughly 13.3MB)
const MAX_FILE_SIZE_BASE64 = 14 * 1024 * 1024; // 14MB to be safe

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2).substring(0, 1000)); // Log first 1000 chars
  
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'OK' })
    };
  }
  
  try {
    // Parse the form data
    const body = JSON.parse(event.body);
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'message', 'position'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ 
            error: `Pflichtfeld fehlt: ${field}` 
          })
        };
      }
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: 'Ungültiges E-Mail-Format' 
        })
      };
    }
    
    // Get configuration from environment
    const recipients = JSON.parse(process.env.EMAIL_RECIPIENTS || '[]');
    const fromEmail = process.env.EMAIL_FROM;
    const uploadsBucket = process.env.UPLOADS_BUCKET;
    const domainName = process.env.DOMAIN_NAME;
    
    if (!recipients.length || !fromEmail || !uploadsBucket) {
      console.error('Configuration missing:', { recipients, fromEmail, uploadsBucket });
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: 'Server-Konfigurationsfehler' 
        })
      };
    }
    
    let cvUrl = null;
    let cvFileName = null;
    
    // Handle PDF upload if provided
    if (body.cv && body.cvFileName) {
      try {
        // Validate file size
        if (body.cv.length > MAX_FILE_SIZE_BASE64) {
          return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ 
              error: 'Datei ist zu groß. Maximale Größe: 10MB' 
            })
          };
        }
        
        // Validate file type
        if (!body.cvFileName.toLowerCase().endsWith('.pdf')) {
          return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ 
              error: 'Nur PDF-Dateien sind erlaubt' 
            })
          };
        }
        
        // Generate unique filename
        const timestamp = Date.now();
        const sanitizedName = body.name.replace(/[^a-zA-Z0-9]/g, '_');
        const sanitizedPosition = body.position.replace(/[^a-zA-Z0-9]/g, '_');
        cvFileName = `applications/${timestamp}_${sanitizedName}_${sanitizedPosition}.pdf`;
        
        // Decode base64 and upload to S3
        const buffer = Buffer.from(body.cv, 'base64');
        
        // Validate it's actually a PDF (check magic bytes)
        if (!buffer.slice(0, 4).equals(Buffer.from([0x25, 0x50, 0x44, 0x46]))) {
          return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ 
              error: 'Ungültige PDF-Datei' 
            })
          };
        }
        
        // Upload to S3 using SDK v3
        const putCommand = new PutObjectCommand({
          Bucket: uploadsBucket,
          Key: cvFileName,
          Body: buffer,
          ContentType: 'application/pdf',
          Metadata: {
            'applicant-name': body.name,
            'applicant-email': body.email,
            'position': body.position,
            'upload-date': new Date().toISOString()
          },
          ServerSideEncryption: 'AES256'
        });
        await s3Client.send(putCommand);
        
        // Generate presigned URL (valid for 7 days) using SDK v3
        const getCommand = new GetObjectCommand({
          Bucket: uploadsBucket,
          Key: cvFileName
        });
        cvUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 7 * 24 * 60 * 60 });
        
        console.log('PDF uploaded successfully:', cvFileName);
        
      } catch (uploadError) {
        console.error('PDF upload error:', uploadError);
        return {
          statusCode: 500,
          headers: corsHeaders,
          body: JSON.stringify({ 
            error: 'Fehler beim Hochladen der PDF-Datei' 
          })
        };
      }
    }
    
    // Prepare email parameters
    const emailParams = {
      Source: fromEmail,
      Destination: {
        ToAddresses: recipients
      },
      Message: {
        Subject: {
          Data: `Neue Bewerbung: ${body.position} - ${body.name}`,
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: generateHtmlEmail(body, cvUrl, cvFileName),
            Charset: 'UTF-8'
          },
          Text: {
            Data: generateTextEmail(body, cvUrl, cvFileName),
            Charset: 'UTF-8'
          }
        }
      },
      ReplyToAddresses: [body.email]
    };
    
    // Send email via SES
    // Send email via SES using SDK v3
    const command = new SendEmailCommand(emailParams);
    await sesClient.send(command);
    
    console.log('Email sent successfully to:', recipients.join(', '));
    
    // Return success response
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        message: 'Vielen Dank für Ihre Bewerbung! Wir werden uns zeitnah bei Ihnen melden.'
      })
    };
    
  } catch (error) {
    console.error('Error processing form:', error);
    
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
      })
    };
  }
};

function generateHtmlEmail(data, cvUrl, cvFileName) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Neue Bewerbung</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
          color: white;
          padding: 20px;
          border-radius: 8px 8px 0 0;
        }
        .content {
          background: #f9f9f9;
          padding: 30px;
          border-radius: 0 0 8px 8px;
        }
        .field {
          margin-bottom: 20px;
        }
        .label {
          font-weight: bold;
          color: #555;
          margin-bottom: 5px;
        }
        .value {
          background: white;
          padding: 10px;
          border-radius: 4px;
          border: 1px solid #ddd;
        }
        .message {
          background: white;
          padding: 15px;
          border-radius: 4px;
          border-left: 4px solid #FFD700;
          white-space: pre-wrap;
        }
        .cv-section {
          background: #e8f4fd;
          padding: 15px;
          border-radius: 4px;
          border-left: 4px solid #2196F3;
          margin-top: 20px;
        }
        .cv-link {
          display: inline-block;
          background: #2196F3;
          color: white;
          padding: 10px 20px;
          text-decoration: none;
          border-radius: 4px;
          margin-top: 10px;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          text-align: center;
          color: #666;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">👔 Neue Bewerbung eingegangen</h2>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">über lineo.finance/karriere</p>
        </div>
        
        <div class="content">
          <div class="field">
            <div class="label">Position:</div>
            <div class="value"><strong>${escapeHtml(data.position)}</strong></div>
          </div>
          
          <div class="field">
            <div class="label">Name:</div>
            <div class="value">${escapeHtml(data.name)}</div>
          </div>
          
          <div class="field">
            <div class="label">E-Mail:</div>
            <div class="value">
              <a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a>
            </div>
          </div>
          
          ${data.phone ? `
          <div class="field">
            <div class="label">Telefon:</div>
            <div class="value">${escapeHtml(data.phone)}</div>
          </div>
          ` : ''}
          
          ${data.availability ? `
          <div class="field">
            <div class="label">Verfügbarkeit:</div>
            <div class="value">${escapeHtml(data.availability)}</div>
          </div>
          ` : ''}
          
          ${data.salary ? `
          <div class="field">
            <div class="label">Gehaltsvorstellung:</div>
            <div class="value">${escapeHtml(data.salary)}</div>
          </div>
          ` : ''}
          
          <div class="field">
            <div class="label">Anschreiben:</div>
            <div class="message">${escapeHtml(data.message)}</div>
          </div>
          
          ${cvUrl ? `
          <div class="cv-section">
            <h3 style="margin-top: 0;">📄 Lebenslauf</h3>
            <p>Der Lebenslauf wurde als PDF hochgeladen und kann über den folgenden Link heruntergeladen werden:</p>
            <a href="${cvUrl}" class="cv-link">Lebenslauf herunterladen</a>
            <p style="font-size: 12px; color: #666; margin-top: 10px;">
              Link gültig für 7 Tage • Dateiname: ${cvFileName ? cvFileName.split('/').pop() : 'lebenslauf.pdf'}
            </p>
          </div>
          ` : `
          <div class="cv-section" style="background: #fff3cd; border-left-color: #ffc107;">
            <p style="margin: 0;">⚠️ Kein Lebenslauf hochgeladen</p>
          </div>
          `}
          
          <div class="footer">
            <p>Diese E-Mail wurde automatisch über das Karriereformular auf lineo.finance gesendet.</p>
            <p>Zeitstempel: ${new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })}</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateTextEmail(data, cvUrl, cvFileName) {
  return `
Neue Bewerbung über lineo.finance/karriere

════════════════════════════════════════════

POSITION: ${data.position}

Bewerber/in Informationen:
────────────────────────────────────────────
Name: ${data.name}
E-Mail: ${data.email}
${data.phone ? `Telefon: ${data.phone}` : ''}
${data.availability ? `Verfügbarkeit: ${data.availability}` : ''}
${data.salary ? `Gehaltsvorstellung: ${data.salary}` : ''}

Anschreiben:
────────────────────────────────────────────
${data.message}

Lebenslauf:
────────────────────────────────────────────
${cvUrl ? `PDF-Download (7 Tage gültig): ${cvUrl}` : 'Kein Lebenslauf hochgeladen'}

════════════════════════════════════════════

Diese E-Mail wurde automatisch über das Karriereformular auf lineo.finance gesendet.
Zeitstempel: ${new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })}
  `;
}

function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.toString().replace(/[&<>"']/g, m => map[m]);
}