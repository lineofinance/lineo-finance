# Deployment Guide

This guide explains how to deploy the Lineo Finance website to AWS using Terraform.

## Prerequisites

- AWS CLI installed and configured
- Terraform >= 1.0 installed
- Node.js and npm installed
- AWS credentials with appropriate permissions

## Infrastructure Setup (First Time Only)

### 1. Initialize Terraform

```bash
cd terraform
terraform init
```

### 2. Configure Environment

For **test environment** (test.lineo.finance):
```bash
# Default configuration uses test subdomain
terraform plan
```

For **production environment** (www.lineo.finance):
```bash
# Create terraform.tfvars with:
echo 'website_subdomain = "www"' > terraform.tfvars
echo 'environment = "prod"' >> terraform.tfvars
terraform plan
```

### 3. Create Infrastructure

```bash
terraform apply
```

This creates:
- S3 bucket for website files (private)
- CloudFront distribution with SSL
- Route53 DNS record
- API Gateway and Lambda functions (placeholders)
- SES email configuration

### 4. Verify Email Addresses

After infrastructure creation:
1. Check `support@lineo.finance` inbox for AWS verification email
2. Click the verification link
3. Verify status: `aws ses list-verified-email-addresses --region eu-central-1`

## Website Deployment

### Method 1: Using Deployment Script (Recommended)

```bash
# Build and deploy
./deploy-terraform.sh

# Skip build if already built
./deploy-terraform.sh --skip-build

# Skip CloudFront invalidation
./deploy-terraform.sh --no-invalidate
```

The script automatically:
1. Gets deployment targets from Terraform outputs
2. Builds the website (11ty)
3. Syncs files to S3 with proper cache headers
4. Invalidates CloudFront cache

### Method 2: Manual Deployment

```bash
# Build the website
npm run build

# Get deployment targets
cd terraform
BUCKET=$(terraform output -raw s3_bucket_name)
DISTRIBUTION=$(terraform output -raw cloudfront_distribution_id)
cd ..

# Sync to S3
aws s3 sync dist/ s3://$BUCKET/ --delete

# Invalidate CloudFront
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION \
  --paths "/*"
```

### Method 3: GitHub Actions (CI/CD)

1. **Setup GitHub Secrets:**
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`

2. **Push to main branch** or trigger manually:
   - Automatic deployment on push to main/master
   - Manual trigger via GitHub Actions UI

## Deployment Information

### Getting Infrastructure Details

```bash
cd terraform

# Get all outputs
terraform output

# Get specific values
terraform output -raw website_url
terraform output -raw s3_bucket_name
terraform output -raw cloudfront_distribution_id
```

### Important Files

| File | Purpose |
|------|---------|
| `deploy-terraform.sh` | Main deployment script |
| `terraform/` | Infrastructure as Code |
| `.github/workflows/deploy.yml` | CI/CD pipeline |
| `dist/` | Built website files |

## Switching Between Environments

### Test → Production

1. Update `terraform/terraform.tfvars`:
```hcl
website_subdomain = "www"
environment = "prod"
```

2. Apply changes:
```bash
cd terraform
terraform apply
```

3. Deploy website:
```bash
cd ..
./deploy-terraform.sh
```

### Production → Test

1. Update `terraform/terraform.tfvars`:
```hcl
website_subdomain = "test"
environment = "test"
```

2. Apply and deploy (same as above)

## Cache Management

### CloudFront Cache Strategy

| File Type | Cache Duration | Headers |
|-----------|---------------|---------|
| HTML | No cache | `no-cache, no-store, must-revalidate` |
| CSS/JS | 1 day | `public, max-age=86400` |
| Images | 30 days | `public, max-age=2592000` |
| Fonts | 30 days | `public, max-age=2592000` |
| Other | 1 hour | `public, max-age=3600` |

### Force Cache Refresh

```bash
# Invalidate all files
aws cloudfront create-invalidation \
  --distribution-id $(cd terraform && terraform output -raw cloudfront_distribution_id) \
  --paths "/*"

# Invalidate specific paths
aws cloudfront create-invalidation \
  --distribution-id $(cd terraform && terraform output -raw cloudfront_distribution_id) \
  --paths "/index.html" "/css/*"
```

## Monitoring

### View CloudFront Metrics
```bash
# Get distribution status
aws cloudfront get-distribution \
  --id $(cd terraform && terraform output -raw cloudfront_distribution_id) \
  --query 'Distribution.Status'
```

### Check S3 Sync Status
```bash
# List recent uploads
aws s3api list-objects-v2 \
  --bucket $(cd terraform && terraform output -raw s3_bucket_name) \
  --query 'sort_by(Contents, &LastModified)[-5:].Key'
```

## Troubleshooting

### Issue: 403 Forbidden
- Check CloudFront distribution status
- Verify S3 bucket policy allows CloudFront OAC
- Wait for distribution to fully deploy (15-20 minutes)

### Issue: Old content showing
- CloudFront cache not invalidated
- Run: `./deploy-terraform.sh` (includes invalidation)
- Check browser cache (try incognito mode)

### Issue: Terraform state issues
- Ensure S3 backend is accessible
- Check AWS credentials
- Run `terraform init -reconfigure` if needed

### Issue: Email not working
- Verify email addresses in SES
- Check SES sandbox status
- Review Lambda function logs in CloudWatch

## Security Notes

- S3 bucket is private (not publicly accessible)
- CloudFront uses Origin Access Control (OAC)
- All traffic forced to HTTPS
- API Gateway has CORS configured
- Lambda functions have minimal IAM permissions