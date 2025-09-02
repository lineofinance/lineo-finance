# Forms Setup Guide

This guide explains how the contact and career forms work with AWS Lambda and SES.

## Architecture Overview

```
User fills form → JavaScript → API Gateway → Lambda Function → SES → Email to support@lineo.finance
                                                ↓
                                    S3 (PDF storage for career forms)
```

## Components

### 1. Lambda Functions

Located in `terraform/lambda-functions/`:

- **contact-form/**: Handles contact form submissions
- **career-form/**: Handles career applications with PDF uploads

### 2. Frontend JavaScript

- **src/js/forms.js**: Form submission handlers
- **src/js/config.js**: API endpoint configuration (generated during deployment)

### 3. Infrastructure (Terraform)

- API Gateway with CORS configuration
- Lambda functions with SES permissions
- S3 bucket for PDF uploads
- SES email templates

## Setup Instructions

### Step 1: Build Lambda Functions

```bash
cd terraform/lambda-functions
./build.sh
```

This creates:
- `contact-form.zip`
- `career-form.zip`

### Step 2: Deploy Infrastructure

```bash
cd terraform
terraform init
terraform apply
```

This creates:
- API Gateway endpoints: `/contact` and `/career`
- Lambda functions with proper IAM roles
- S3 bucket for PDF uploads
- SES configuration

### Step 3: Verify Email Addresses

After infrastructure deployment:

1. Check inbox for `support@lineo.finance`
2. Click AWS verification link
3. Verify status:
```bash
aws ses list-verified-email-addresses --region eu-central-1
```

### Step 4: Deploy Website

```bash
./deploy-terraform.sh
```

This automatically:
1. Gets API Gateway URL from Terraform
2. Generates `config.js` with the API URL
3. Builds and deploys the website

## Form Features

### Contact Form
- **Fields**: Name, Email, Phone (optional), Subject (optional), Message
- **Validation**: Client-side and server-side
- **Email**: Sent to `support@lineo.finance`
- **Response**: Success/error message displayed

### Career Form
- **Fields**: Position, Name, Email, Phone, Availability, Salary, Message, CV Upload
- **File Upload**: PDF only, max 10MB
- **Storage**: PDFs stored in S3 with 90-day lifecycle
- **Email**: Includes presigned S3 URL (7-day validity)

## Testing

### Local Testing

1. Update `src/js/config.js` with your API Gateway URL:
```javascript
window.LINEO_API_URL = 'https://your-api-id.execute-api.eu-central-1.amazonaws.com/test';
```

2. Run local server:
```bash
npm run serve
```

3. Test form submissions

### Test with curl

Contact form:
```bash
curl -X POST https://your-api-id.execute-api.eu-central-1.amazonaws.com/test/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "message": "Test message"
  }'
```

Career form (without file):
```bash
curl -X POST https://your-api-id.execute-api.eu-central-1.amazonaws.com/test/career \
  -H "Content-Type: application/json" \
  -d '{
    "position": "Developer",
    "name": "Test User",
    "email": "test@example.com",
    "message": "Test application"
  }'
```

## Email Templates

Emails are sent with professional HTML templates including:
- Company branding (gold color scheme)
- Structured data presentation
- Reply-to functionality
- Timestamp in German timezone

## Security

- **CORS**: Configured in API Gateway and Lambda
- **Validation**: Both client and server-side
- **File Type**: Only PDFs accepted
- **File Size**: Limited to 10MB
- **S3**: Private bucket with presigned URLs
- **Email**: SES with verified domains

## Monitoring

### CloudWatch Logs

View Lambda logs:
```bash
# Contact form logs
aws logs tail /aws/lambda/lineo-website-contact-form --follow

# Career form logs
aws logs tail /aws/lambda/lineo-website-career-form --follow
```

### SES Metrics

Check email delivery:
```bash
aws ses get-send-statistics --region eu-central-1
```

## Troubleshooting

### Form not submitting
1. Check browser console for errors
2. Verify API URL in `config.js`
3. Check CORS headers

### Emails not received
1. Check SES sandbox status
2. Verify email addresses
3. Check CloudWatch logs for Lambda errors
4. Check spam folder

### File upload issues
1. Verify file is PDF
2. Check file size < 10MB
3. Check S3 bucket permissions

### API Gateway errors
- **403**: Check CORS configuration
- **500**: Check Lambda logs
- **502**: Lambda timeout or error

## SES Sandbox Mode

While in sandbox:
- Can only send to verified emails
- Limited to 200 emails/day
- Must verify `support@lineo.finance`

To exit sandbox:
1. Go to AWS Console → SES
2. Request production access
3. Wait 24-48 hours for approval

## Production Checklist

- [ ] Exit SES sandbox
- [ ] Update CORS to specific domain (not *)
- [ ] Set up CloudWatch alarms
- [ ] Configure email bounce handling
- [ ] Set up backup email addresses
- [ ] Test with real email addresses
- [ ] Monitor S3 bucket size
- [ ] Set up log retention policies