# Terraform Deployment Checklist

## Pre-Deployment

- [x] Lambda functions built (`terraform/lambda-functions/*.zip`)
- [x] Terraform configuration validated
- [ ] AWS credentials configured
- [ ] Email address `support@lineo.finance` ready for verification

## Deployment Steps

1. **Initialize Terraform** (if not already done):
```bash
cd terraform
terraform init
```

2. **Review the plan**:
```bash
terraform plan
```
Expected: 40 resources to create

3. **Apply infrastructure**:
```bash
terraform apply
```

4. **Verify email address**:
- Check `support@lineo.finance` inbox
- Click AWS SES verification link
- Verify with: `aws ses list-verified-email-addresses --region eu-central-1`

5. **Deploy website**:
```bash
cd ..
./deploy-terraform.sh
```

## Post-Deployment Verification

### Infrastructure Outputs
After `terraform apply`, note these values:
- `website_url`: https://test.lineo.finance
- `s3_bucket_name`: lineo-website-test
- `cloudfront_distribution_id`: E...
- `api_gateway_url`: https://....execute-api.eu-central-1.amazonaws.com/test

### Test Forms

1. **Test contact form**:
   - Navigate to https://test.lineo.finance/pages/kontakt
   - Submit a test message
   - Check `support@lineo.finance` for email

2. **Test career form**:
   - Navigate to https://test.lineo.finance/pages/karriere
   - Submit application with PDF
   - Check email and S3 bucket for upload

### Monitor

- **Lambda Logs**: 
  ```bash
  aws logs tail /aws/lambda/lineo-website-contact-form --follow
  aws logs tail /aws/lambda/lineo-website-career-form --follow
  ```

- **API Gateway**: Check in AWS Console for successful invocations

## Known Issues & Notes

1. **Warnings**: Two deprecation warnings are expected and safe to ignore:
   - `stage_name` in API Gateway deployment
   - `invoke_url` attribute (we use constructed URL instead)

2. **SES Sandbox**: Initially limited to verified emails only
   - To send to any email: Request production access in AWS Console

3. **CloudFront**: Takes 15-20 minutes to fully deploy

4. **First Deploy**: May take 10-15 minutes for all resources

## Rollback

If issues occur:
```bash
terraform destroy
```

## Production Deployment

When ready for production (www.lineo.finance):

1. Update `terraform.tfvars`:
```hcl
website_subdomain = "www"
environment = "prod"
```

2. Re-run terraform apply and deployment script