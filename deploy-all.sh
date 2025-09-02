#!/bin/bash

# Complete deployment script for Lineo Finance website
# This script handles infrastructure and website deployment

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[DEPLOY]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

echo "============================================"
echo "Lineo Finance Complete Deployment"
echo "============================================"
echo ""

# Step 1: Build Lambda functions
print_status "Building Lambda functions..."
cd terraform/lambda-functions
if [ ! -f contact-form.zip ] || [ ! -f career-form.zip ]; then
    ./build.sh
    print_status "Lambda functions built"
else
    print_info "Lambda functions already built"
fi
cd ../..

# Step 2: Initialize Terraform (if needed)
print_status "Checking Terraform..."
cd terraform
if [ ! -d ".terraform" ]; then
    print_status "Initializing Terraform..."
    terraform init
fi

# Step 3: Show plan
print_status "Showing Terraform plan..."
terraform plan -out=tfplan

echo ""
read -p "Do you want to apply this infrastructure? (yes/no): " confirmation

if [ "$confirmation" != "yes" ]; then
    print_warning "Deployment cancelled"
    rm tfplan
    exit 0
fi

# Step 4: Apply Terraform
print_status "Applying Terraform configuration..."
terraform apply tfplan
rm tfplan

# Get outputs
print_status "Getting infrastructure details..."
WEBSITE_URL=$(terraform output -raw website_url)
API_URL=$(terraform output -raw api_gateway_url)
BUCKET_NAME=$(terraform output -raw s3_bucket_name)

print_info "Infrastructure created:"
print_info "  Website URL: $WEBSITE_URL"
print_info "  API Gateway: $API_URL"
print_info "  S3 Bucket: $BUCKET_NAME"

cd ..

# Step 5: Email verification reminder
echo ""
print_warning "IMPORTANT: Email Verification Required!"
echo "1. Check inbox for support@lineo.finance"
echo "2. Click the AWS verification link"
echo "3. Verify with: aws ses list-verified-email-addresses --region eu-central-1"
echo ""
read -p "Press Enter when email is verified (or skip for now)..."

# Step 6: Deploy website
echo ""
print_status "Deploying website files..."
./deploy-terraform.sh

# Step 7: Final summary
echo ""
echo "============================================"
print_status "Deployment Complete!"
echo "============================================"
echo ""
echo "🌐 Website: $WEBSITE_URL"
echo "🔌 API: $API_URL"
echo "📧 Email: support@lineo.finance (must be verified)"
echo ""
echo "Test the forms:"
echo "  - Contact: $WEBSITE_URL/pages/kontakt"
echo "  - Career: $WEBSITE_URL/pages/karriere"
echo ""
echo "Monitor logs:"
echo "  aws logs tail /aws/lambda/lineo-website-contact-form --follow"
echo "  aws logs tail /aws/lambda/lineo-website-career-form --follow"
echo ""
print_info "CloudFront may take 15-20 minutes to fully propagate"
echo "============================================"