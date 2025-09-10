#!/bin/bash

# Setup GitHub Secrets from Terraform Outputs
# Usage: ./scripts/setup-github-secrets.sh [github-repo-owner/repo-name]
#
# Prerequisites:
# 1. Install GitHub CLI: brew install gh
# 2. Login to GitHub: gh auth login
# 3. Apply terraform: cd terraform && terraform apply
# 4. Have AWS credentials configured

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
TERRAFORM_DIR="./terraform"
GITHUB_REPO="${1:-$(gh repo view --json nameWithOwner --jq .nameWithOwner 2>/dev/null)}"

echo -e "${BLUE}🔧 Setting up GitHub Secrets from Terraform outputs...${NC}"

# Check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}📋 Checking prerequisites...${NC}"
    
    # Check if GitHub CLI is installed
    if ! command -v gh &> /dev/null; then
        echo -e "${RED}❌ GitHub CLI not found. Install with: brew install gh${NC}"
        exit 1
    fi
    
    # Check if authenticated with GitHub
    if ! gh auth status &> /dev/null; then
        echo -e "${RED}❌ Not authenticated with GitHub. Run: gh auth login${NC}"
        exit 1
    fi
    
    # Check if terraform directory exists
    if [[ ! -d "$TERRAFORM_DIR" ]]; then
        echo -e "${RED}❌ Terraform directory not found: $TERRAFORM_DIR${NC}"
        exit 1
    fi
    
    # Check if terraform state exists
    if [[ ! -f "$TERRAFORM_DIR/terraform.tfstate" && ! -f "$TERRAFORM_DIR/.terraform/terraform.tfstate" ]]; then
        echo -e "${RED}❌ Terraform state not found. Run: cd terraform && terraform apply${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ All prerequisites met${NC}"
}

# Get terraform outputs
get_terraform_outputs() {
    echo -e "${YELLOW}🔍 Getting Terraform outputs...${NC}"
    
    cd "$TERRAFORM_DIR"
    
    # Get outputs in JSON format
    TERRAFORM_OUTPUTS=$(terraform output -json)
    
    # Extract individual values
    export S3_BUCKET_NAME=$(echo "$TERRAFORM_OUTPUTS" | jq -r '.s3_bucket_name.value // empty')
    export CLOUDFRONT_DISTRIBUTION_ID=$(echo "$TERRAFORM_OUTPUTS" | jq -r '.cloudfront_distribution_id.value // empty')
    export WEBSITE_URL=$(echo "$TERRAFORM_OUTPUTS" | jq -r '.website_url.value // empty')
    export API_GATEWAY_URL=$(echo "$TERRAFORM_OUTPUTS" | jq -r '.api_gateway_url.value // empty')
    export GITHUB_ACTIONS_ROLE_ARN=$(echo "$TERRAFORM_OUTPUTS" | jq -r '.github_actions_role_arn.value // empty')
    
    cd - > /dev/null
    
    echo -e "${GREEN}✅ Terraform outputs retrieved${NC}"
}

# Set GitHub secrets
set_github_secrets() {
    echo -e "${YELLOW}🔐 Setting GitHub secrets for repo: $GITHUB_REPO${NC}"
    
    # Required secrets for deployment
    SECRETS=(
        "S3_BUCKET_NAME:$S3_BUCKET_NAME"
        "CLOUDFRONT_DISTRIBUTION_ID:$CLOUDFRONT_DISTRIBUTION_ID"
        "WEBSITE_URL:$WEBSITE_URL"
        "AWS_REGION:eu-central-1"
        "AWS_ROLE_ARN:$GITHUB_ACTIONS_ROLE_ARN"
    )
    
    # Optional secrets
    if [[ -n "$API_GATEWAY_URL" ]]; then
        SECRETS+=("API_GATEWAY_URL:$API_GATEWAY_URL")
    fi
    
    for secret in "${SECRETS[@]}"; do
        IFS=':' read -r name value <<< "$secret"
        
        if [[ -n "$value" ]]; then
            echo -e "  🔒 Setting $name..."
            echo "$value" | gh secret set "$name" --repo "$GITHUB_REPO"
        else
            echo -e "${YELLOW}  ⚠️  Skipping $name (empty value)${NC}"
        fi
    done
}

# Setup AWS OIDC role (instructions)
setup_aws_oidc_instructions() {
    echo -e "${BLUE}📝 AWS OIDC Setup Instructions:${NC}"
    echo ""
    echo -e "${YELLOW}1. Create IAM OIDC Identity Provider:${NC}"
    echo "   - URL: https://token.actions.githubusercontent.com"
    echo "   - Audience: sts.amazonaws.com"
    echo ""
    echo -e "${YELLOW}2. Create IAM Role with trust policy:${NC}"
    echo '   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Principal": {
           "Federated": "arn:aws:iam::ACCOUNT-ID:oidc-provider/token.actions.githubusercontent.com"
         },
         "Action": "sts:AssumeRoleWithWebIdentity",
         "Condition": {
           "StringEquals": {
             "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
           },
           "StringLike": {
             "token.actions.githubusercontent.com:sub": "repo:'"$GITHUB_REPO"':*"
           }
         }
       }
     ]
   }'
   echo ""
   echo -e "${YELLOW}3. Attach policies to the role:${NC}"
   echo "   - S3FullAccess (or custom S3 policy)"
   echo "   - CloudFrontFullAccess (or custom CloudFront policy)"
   echo ""
   echo -e "${YELLOW}4. Set the AWS_ROLE_ARN secret:${NC}"
   echo "   gh secret set AWS_ROLE_ARN --body 'arn:aws:iam::ACCOUNT-ID:role/ROLE-NAME'"
   echo ""
}

# Display summary
display_summary() {
    echo -e "${GREEN}🎉 GitHub Secrets setup complete!${NC}"
    echo ""
    echo -e "${BLUE}📋 Summary:${NC}"
    echo "  Repository: $GITHUB_REPO"
    echo "  S3 Bucket: $S3_BUCKET_NAME"
    echo "  CloudFront ID: $CLOUDFRONT_DISTRIBUTION_ID"
    echo "  Website URL: $WEBSITE_URL"
    echo ""
    echo -e "${YELLOW}⚠️  Don't forget to set up AWS OIDC authentication (see instructions above)${NC}"
    echo ""
    echo -e "${GREEN}🚀 Ready to deploy! Create a tag like v1.0.0 to trigger deployment.${NC}"
}

# Main execution
main() {
    if [[ -z "$GITHUB_REPO" ]]; then
        echo -e "${RED}❌ Could not determine GitHub repository. Please provide it as an argument:${NC}"
        echo "  ./scripts/setup-github-secrets.sh owner/repo-name"
        exit 1
    fi
    
    check_prerequisites
    get_terraform_outputs
    set_github_secrets
    setup_aws_oidc_instructions
    display_summary
}

# Run main function
main "$@"