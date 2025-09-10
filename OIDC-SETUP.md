# AWS OIDC Authentication Setup for GitHub Actions

This guide helps you set up secure AWS OIDC authentication for GitHub Actions deployment.

## Quick Setup (Automated with Terraform)

### 1. Configure Terraform Variables

Create your terraform variables file:
```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` and set your GitHub repository:
```hcl
# REQUIRED: Set your GitHub repository
github_repository = "your-username/lineo-finance"

# Optional: Other settings
website_subdomain = "test"  # or "www" for production
```

### 2. Deploy Infrastructure with OIDC

```bash
# Plan the deployment (including OIDC resources)
./scripts/terraform-deploy.sh plan

# Apply the infrastructure
./scripts/terraform-deploy.sh apply
```

This creates:
- ✅ GitHub OIDC Identity Provider
- ✅ IAM Role with proper trust policy
- ✅ IAM Policy with S3 and CloudFront permissions
- ✅ All other AWS resources (S3, CloudFront, etc.)

### 3. Set GitHub Secrets

```bash
# Automatically extract terraform outputs and set GitHub secrets
./scripts/setup-github-secrets.sh

# Or specify repo if auto-detection fails
./scripts/setup-github-secrets.sh your-username/lineo-finance
```

This automatically sets:
- ✅ `AWS_ROLE_ARN` - IAM role for GitHub Actions
- ✅ `S3_BUCKET_NAME` - S3 bucket name
- ✅ `CLOUDFRONT_DISTRIBUTION_ID` - CloudFront distribution
- ✅ `WEBSITE_URL` - Final website URL
- ✅ `AWS_REGION` - AWS region

### 4. Test the Deployment

Create a semantic version tag to trigger deployment:
```bash
git tag v1.0.0
git push origin v1.0.0
```

GitHub Actions will automatically:
1. Build the site with WebP optimization
2. Deploy to S3 using OIDC authentication
3. Invalidate CloudFront cache

## Manual Setup (If you prefer AWS Console)

If you prefer to set up OIDC manually through AWS Console:

### 1. Create OIDC Identity Provider

1. Go to **IAM Console** → **Identity providers** → **Add provider**
2. Choose **OpenID Connect**
3. Set:
   - **Provider URL**: `https://token.actions.githubusercontent.com`
   - **Audience**: `sts.amazonaws.com`
4. Click **Add provider**

### 2. Create IAM Role

1. Go to **IAM Console** → **Roles** → **Create role**
2. Choose **Web identity**
3. Select the GitHub OIDC provider you just created
4. Set **Audience**: `sts.amazonaws.com`
5. Add condition for your repository:
   - **Condition Key**: `token.actions.githubusercontent.com:sub`
   - **Condition Value**: `repo:your-username/lineo-finance:*`

### 3. Attach Permissions

Create and attach a policy with these permissions:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject", 
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-s3-bucket-name",
        "arn:aws:s3:::your-s3-bucket-name/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation",
        "cloudfront:GetInvalidation",
        "cloudfront:ListInvalidations"
      ],
      "Resource": "arn:aws:cloudfront::*:distribution/YOUR-DISTRIBUTION-ID"
    }
  ]
}
```

### 4. Set GitHub Secret

Set the role ARN as a GitHub secret:
```bash
gh secret set AWS_ROLE_ARN --body 'arn:aws:iam::YOUR-ACCOUNT-ID:role/YOUR-ROLE-NAME'
```

## Verification

### Check GitHub Secrets
```bash
gh secret list
```

Should show:
- `AWS_ROLE_ARN`
- `S3_BUCKET_NAME` 
- `CLOUDFRONT_DISTRIBUTION_ID`
- `WEBSITE_URL`
- `AWS_REGION`

### Test Deployment
```bash
# Create and push a tag
git tag v1.0.1
git push origin v1.0.1

# Check GitHub Actions
gh run list
```

## Troubleshooting

### GitHub Action Fails with "AssumeRoleWithWebIdentity"

**Problem**: GitHub Actions can't assume the IAM role.

**Solution**: Check:
1. Repository name in trust policy matches exactly
2. OIDC provider thumbprints are correct
3. Audience is set to `sts.amazonaws.com`

### GitHub Action Fails with S3 Permissions

**Problem**: Can't upload to S3 or invalidate CloudFront.

**Solution**: Check:
1. IAM policy has correct S3 bucket ARN
2. CloudFront distribution ID is correct in policy
3. Role has the policy attached

### Terraform Apply Fails

**Problem**: Terraform can't create OIDC resources.

**Solution**: Check:
1. AWS credentials have IAM permissions
2. `github_repository` variable is set correctly
3. No existing OIDC provider conflicts

### Role ARN Not Found

**Problem**: `setup-github-secrets.sh` can't find role ARN.

**Solution**: Check:
1. Terraform apply completed successfully
2. `terraform output` shows `github_actions_role_arn`
3. Run from project root directory

## Security Notes

- ✅ No long-lived AWS credentials stored anywhere
- ✅ Role can only be assumed by your specific repository
- ✅ Permissions are limited to deployment needs only  
- ✅ All authentication happens through GitHub's OIDC

## Next Steps

Once OIDC is set up:
1. Push tags like `v1.0.0` to trigger deployments
2. Monitor deployments in GitHub Actions tab
3. Check deployed site at your configured URL
4. Set up branch protection rules for production