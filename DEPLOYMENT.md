# Deployment Guide

This project uses automated deployment via GitHub Actions triggered by semantic version tags.

## Overview

- **Trigger**: Git tags matching `v*.*.*` pattern (e.g., `v1.0.0`, `v1.2.3`)
- **Infrastructure**: AWS S3 + CloudFront managed by Terraform
- **Authentication**: AWS OIDC (no long-lived credentials)
- **Build**: Node.js with WebP optimization

## Initial Setup

### 1. Deploy Infrastructure

```bash
# Plan the infrastructure changes
./scripts/terraform-deploy.sh plan

# Apply the infrastructure (creates S3 bucket, CloudFront, etc.)
./scripts/terraform-deploy.sh apply
```

### 2. Configure GitHub Secrets

```bash
# Extract terraform outputs and set GitHub secrets
./scripts/setup-github-secrets.sh

# Or specify repo explicitly if auto-detection fails
./scripts/setup-github-secrets.sh your-username/repo-name
```

This script sets the following GitHub secrets:
- `S3_BUCKET_NAME` - S3 bucket for website hosting
- `CLOUDFRONT_DISTRIBUTION_ID` - CloudFront distribution ID
- `WEBSITE_URL` - Final website URL
- `AWS_REGION` - AWS region (eu-central-1)
- `API_GATEWAY_URL` - API Gateway for forms (if configured)

### 3. Setup AWS OIDC Authentication

Create an IAM role for GitHub Actions with the following trust policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::YOUR-ACCOUNT-ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:YOUR-USERNAME/YOUR-REPO:*"
        }
      }
    }
  ]
}
```

Attach the following policies:
- S3 access to your bucket
- CloudFront invalidation permissions

Set the role ARN as a GitHub secret:
```bash
gh secret set AWS_ROLE_ARN --body 'arn:aws:iam::YOUR-ACCOUNT-ID:role/YOUR-ROLE-NAME'
```

## Deployment Process

### Automatic Deployment (Recommended)

1. **Make changes** to your code
2. **Commit and push** to main branch
3. **Create a semantic version tag**:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
4. **GitHub Actions automatically**:
   - Installs dependencies
   - Builds the site (including WebP generation)
   - Deploys to S3
   - Invalidates CloudFront cache

### Manual Deployment (Legacy)

For local deployment, you can still use:
```bash
./deploy.sh
```

Note: This requires AWS CLI configured with appropriate credentials.

## Semantic Versioning

Follow semantic versioning for tags:
- `v1.0.0` - Major release (breaking changes)
- `v1.1.0` - Minor release (new features)
- `v1.0.1` - Patch release (bug fixes)

## Build Process

The deployment includes automatic optimizations:

1. **WebP Generation**: All PNG/JPG images are converted to WebP
2. **SCSS Compilation**: Sass files compiled to compressed CSS
3. **HTML Transform**: Images wrapped in `<picture>` elements for browser compatibility
4. **Asset Copying**: All assets copied to `dist/` directory

## Security

- No AWS credentials stored in repository
- OIDC authentication with least privilege
- Terraform state should use remote backend for production
- GitHub secrets are encrypted at rest

## Support

For deployment issues:
1. Check this documentation
2. Review GitHub Actions logs
3. Verify AWS permissions and infrastructure state
