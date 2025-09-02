const AWS = require('aws-sdk');
const ses = new AWS.SES({ region: process.env.AWS_REGION });

// CORS headers for response
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // In production, replace with your domain
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'OPTIONS,POST'
};

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event));
  
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
    const requiredFields = ['name', 'email', 'message'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ 
            error: `Missing required field: ${field}` 
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
          error: 'Invalid email format' 
        })
      };
    }
    
    // Get email recipients from environment
    const recipients = JSON.parse(process.env.EMAIL_RECIPIENTS || '[]');
    const fromEmail = process.env.EMAIL_FROM;
    const domainName = process.env.DOMAIN_NAME;
    
    if (!recipients.length || !fromEmail) {
      console.error('Email configuration missing');
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: 'Email configuration error' 
        })
      };
    }
    
    // Prepare email parameters
    const emailParams = {
      Source: fromEmail,
      Destination: {
        ToAddresses: recipients
      },
      Message: {
        Subject: {
          Data: `Neue Kontaktanfrage von ${body.name}`,
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: generateHtmlEmail(body),
            Charset: 'UTF-8'
          },
          Text: {
            Data: generateTextEmail(body),
            Charset: 'UTF-8'
          }
        }
      },
      ReplyToAddresses: [body.email]
    };
    
    // Send email via SES
    await ses.sendEmail(emailParams).promise();
    
    console.log('Email sent successfully to:', recipients.join(', '));
    
    // Return success response
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        message: 'Vielen Dank für Ihre Nachricht. Wir werden uns zeitnah bei Ihnen melden.'
      })
    };
    
  } catch (error) {
    console.error('Error processing form:', error);
    
    // Check if it's an SES error
    if (error.code === 'MessageRejected' || error.code === 'MailFromDomainNotVerified') {
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({
          error: 'Email service configuration error. Please try again later.'
        })
      };
    }
    
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
      })
    };
  }
};

function generateHtmlEmail(data) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Neue Kontaktanfrage</title>
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
          <h2 style="margin: 0;">📧 Neue Kontaktanfrage</h2>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">über lineo.finance</p>
        </div>
        
        <div class="content">
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
          
          ${data.subject ? `
          <div class="field">
            <div class="label">Betreff:</div>
            <div class="value">${escapeHtml(data.subject)}</div>
          </div>
          ` : ''}
          
          <div class="field">
            <div class="label">Nachricht:</div>
            <div class="message">${escapeHtml(data.message)}</div>
          </div>
          
          <div class="footer">
            <p>Diese E-Mail wurde automatisch über das Kontaktformular auf lineo.finance gesendet.</p>
            <p>Zeitstempel: ${new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })}</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateTextEmail(data) {
  return `
Neue Kontaktanfrage über lineo.finance

════════════════════════════════════════════

Name: ${data.name}
E-Mail: ${data.email}
${data.phone ? `Telefon: ${data.phone}` : ''}
${data.subject ? `Betreff: ${data.subject}` : ''}

Nachricht:
────────────────────────────────────────────
${data.message}
────────────────────────────────────────────

Diese E-Mail wurde automatisch über das Kontaktformular auf lineo.finance gesendet.
Zeitstempel: ${new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })}
  `;
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}