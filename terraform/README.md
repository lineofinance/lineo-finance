# Lineo Finance Website Infrastructure

This Terraform configuration manages the AWS infrastructure for the Lineo Finance static website, including form processing capabilities.

## Architecture Overview

- **Static Website**: S3 + CloudFront CDN
- **Form Processing**: API Gateway + Lambda functions
- **Email Service**: AWS SES for sending form notifications
- **Storage**: S3 bucket for career form PDF uploads

## Prerequisites

1. AWS CLI configured with appropriate credentials
2. Terraform >= 1.0
3. Existing Route53 hosted zone for `lineo.finance` (managed in main infrastructure)
4. ACM certificates in both `eu-central-1` and `us-east-1` (managed in main infrastructure)

## Module Structure

```
terraform/
├── backend.tf           # S3 backend configuration
├── providers.tf         # AWS provider configuration
├── variables.tf         # Input variables
├── data.tf             # Data sources for existing resources
├── main.tf             # Root module configuration
├── outputs.tf          # Output values
└── modules/
    ├── static-website/  # S3, CloudFront, Route53
    ├── form-processing/ # Lambda, API Gateway, IAM
    ├── storage/        # S3 bucket for uploads
    └── email/          # SES configuration
```

## Usage

### Initialize Terraform

```bash
cd terraform
terraform init
```

### Plan Changes

```bash
terraform plan
```

### Apply Infrastructure

```bash
terraform apply
```

### Deploy Website Files

After infrastructure is created, deploy website files:

```bash
# Build the website (if using 11ty)
cd ..
npm run build

# Sync files to S3
aws s3 sync dist/ s3://$(terraform output -raw s3_bucket_name) --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id $(terraform output -raw cloudfront_distribution_id) \
  --paths "/*"
```

## Configuration

Key variables in `variables.tf`:

- `aws_region`: AWS region (default: eu-central-1)
- `environment`: Environment name (default: prod)
- `domain_name`: Base domain (default: lineo.finance)
- `website_subdomain`: Subdomain for website (default: www)
- `contact_email_recipients`: List of emails for contact form
- `career_email_recipients`: List of emails for career form
- `max_pdf_size_mb`: Max PDF upload size (default: 10MB)

## State Management

Terraform state is stored in S3:
- Bucket: `finatusgmbh-terraformstate`
- Key: `lineo-website-terraform`
- Region: `eu-central-1`

This is separate from the main infrastructure state to allow independent management.

## Next Steps

1. **Lambda Function Implementation**: Create actual Lambda function code for form processing
2. **API Gateway Routes**: Complete API Gateway configuration with proper routes and CORS
3. **Testing**: Implement integration tests for form submissions
4. **Monitoring**: Add CloudWatch alarms and dashboards
5. **CI/CD**: Set up automated deployment pipeline

## Important Notes

- The Route53 hosted zone is managed in the main infrastructure repository
- ACM certificates are also managed in the main infrastructure
- SES domain identity for lineo.finance exists in main infrastructure (but seems to have wrong zone_id reference - needs fixing)
- The website currently points to a Lightsail WordPress instance (18.192.70.104) and needs to be updated to point to CloudFront once ready

## Security Considerations

- S3 buckets are private with CloudFront OAC for secure access
- Lambda functions have minimal IAM permissions
- API Gateway will implement rate limiting and CORS
- Uploaded PDFs are encrypted at rest and auto-deleted after 90 days
- All traffic forced to HTTPS via CloudFront