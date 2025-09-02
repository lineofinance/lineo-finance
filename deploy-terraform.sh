#!/bin/bash

# Lineo Finance Terraform-based Deployment Script
# This script builds the site and deploys it to AWS S3/CloudFront managed by Terraform

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed. Please install it first."
    echo "Visit: https://aws.amazon.com/cli/"
    exit 1
fi

# Check if Terraform is installed
if ! command -v terraform &> /dev/null; then
    print_error "Terraform is not installed. Please install it first."
    echo "Visit: https://www.terraform.io/downloads"
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    print_error "AWS credentials not configured. Please run 'aws configure' first."
    exit 1
fi

# Parse command line arguments
SKIP_BUILD=false
SKIP_TERRAFORM=false
INVALIDATE_CACHE=true

while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --skip-terraform)
            SKIP_TERRAFORM=true
            shift
            ;;
        --no-invalidate)
            INVALIDATE_CACHE=false
            shift
            ;;
        --help)
            echo "Usage: ./deploy-terraform.sh [options]"
            echo ""
            echo "Options:"
            echo "  --skip-build       Skip the build step (use existing dist folder)"
            echo "  --skip-terraform   Skip Terraform check (assume infrastructure exists)"
            echo "  --no-invalidate    Skip CloudFront cache invalidation"
            echo "  --help             Show this help message"
            echo ""
            echo "First time setup:"
            echo "  1. cd terraform && terraform init"
            echo "  2. terraform apply"
            echo "  3. cd .. && ./deploy-terraform.sh"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Step 1: Check Terraform infrastructure
if [ "$SKIP_TERRAFORM" = false ]; then
    print_status "Checking Terraform infrastructure..."
    cd terraform
    
    # Check if Terraform is initialized
    if [ ! -d ".terraform" ]; then
        print_error "Terraform not initialized. Please run 'terraform init' first."
        exit 1
    fi
    
    # Get Terraform outputs
    print_status "Getting deployment information from Terraform..."
    BUCKET_NAME=$(terraform output -raw s3_bucket_name 2>/dev/null || echo "")
    DISTRIBUTION_ID=$(terraform output -raw cloudfront_distribution_id 2>/dev/null || echo "")
    WEBSITE_URL=$(terraform output -raw website_url 2>/dev/null || echo "")
    API_GATEWAY_URL=$(terraform output -raw api_gateway_url 2>/dev/null || echo "")
    
    if [ -z "$BUCKET_NAME" ] || [ -z "$DISTRIBUTION_ID" ]; then
        print_error "Could not get Terraform outputs. Please run 'terraform apply' first."
        echo ""
        echo "To set up infrastructure:"
        echo "  cd terraform"
        echo "  terraform init"
        echo "  terraform plan"
        echo "  terraform apply"
        exit 1
    fi
    
    print_info "Deployment targets:"
    print_info "  S3 Bucket: $BUCKET_NAME"
    print_info "  CloudFront ID: $DISTRIBUTION_ID"
    print_info "  Website URL: $WEBSITE_URL"
    print_info "  API Gateway: $API_GATEWAY_URL"
    
    cd ..
else
    print_warning "Skipping Terraform check (--skip-terraform flag)"
    # Try to get values from terraform state if available
    if [ -f "terraform/terraform.tfstate" ]; then
        cd terraform
        BUCKET_NAME=$(terraform output -raw s3_bucket_name 2>/dev/null || echo "")
        DISTRIBUTION_ID=$(terraform output -raw cloudfront_distribution_id 2>/dev/null || echo "")
        WEBSITE_URL=$(terraform output -raw website_url 2>/dev/null || echo "")
        API_GATEWAY_URL=$(terraform output -raw api_gateway_url 2>/dev/null || echo "")
        cd ..
    fi
    
    if [ -z "$BUCKET_NAME" ] || [ -z "$DISTRIBUTION_ID" ]; then
        print_error "Cannot determine deployment targets. Remove --skip-terraform flag."
        exit 1
    fi
fi

# Step 2: Generate API config file
if [ -n "$API_GATEWAY_URL" ]; then
    print_status "Generating API configuration file..."
    sed "s|{{API_GATEWAY_URL}}|$API_GATEWAY_URL|g" src/js/config.js.template > src/js/config.js
    print_info "API configuration updated with: $API_GATEWAY_URL"
else
    print_warning "No API Gateway URL found. Forms will not work properly."
fi

# Step 3: Build the site
if [ "$SKIP_BUILD" = false ]; then
    print_status "Building the site..."
    npm run build
    if [ $? -eq 0 ]; then
        print_status "Build completed successfully"
    else
        print_error "Build failed"
        exit 1
    fi
else
    print_warning "Skipping build step (--skip-build flag)"
fi

# Check if dist folder exists
if [ ! -d "dist" ]; then
    print_error "dist folder not found. Please run the build first."
    exit 1
fi

# Step 4: Sync files to S3
print_status "Syncing files to S3 bucket: $BUCKET_NAME"

# Different cache strategies for different file types
print_info "Uploading HTML files (no cache)..."
aws s3 sync dist/ s3://"$BUCKET_NAME"/ \
    --exclude "*" \
    --include "*.html" \
    --include "*/index.html" \
    --cache-control "no-cache, no-store, must-revalidate" \
    --content-type "text/html; charset=utf-8" \
    --delete

print_info "Uploading CSS files (1 day cache)..."
aws s3 sync dist/ s3://"$BUCKET_NAME"/ \
    --exclude "*" \
    --include "*.css" \
    --cache-control "public, max-age=86400" \
    --content-type "text/css; charset=utf-8"

print_info "Uploading JavaScript files (1 day cache)..."
aws s3 sync dist/ s3://"$BUCKET_NAME"/ \
    --exclude "*" \
    --include "*.js" \
    --cache-control "public, max-age=86400" \
    --content-type "application/javascript; charset=utf-8"

print_info "Uploading image files (30 days cache)..."
aws s3 sync dist/ s3://"$BUCKET_NAME"/ \
    --exclude "*" \
    --include "*.jpg" \
    --include "*.jpeg" \
    --include "*.png" \
    --include "*.gif" \
    --include "*.svg" \
    --include "*.webp" \
    --cache-control "public, max-age=2592000"

print_info "Uploading font files (30 days cache)..."
aws s3 sync dist/ s3://"$BUCKET_NAME"/ \
    --exclude "*" \
    --include "*.woff" \
    --include "*.woff2" \
    --include "*.ttf" \
    --include "*.eot" \
    --cache-control "public, max-age=2592000"

print_info "Uploading remaining files..."
aws s3 sync dist/ s3://"$BUCKET_NAME"/ \
    --exclude "*.html" \
    --exclude "*.css" \
    --exclude "*.js" \
    --exclude "*.jpg" \
    --exclude "*.jpeg" \
    --exclude "*.png" \
    --exclude "*.gif" \
    --exclude "*.svg" \
    --exclude "*.webp" \
    --exclude "*.woff" \
    --exclude "*.woff2" \
    --exclude "*.ttf" \
    --exclude "*.eot" \
    --exclude ".git/*" \
    --exclude ".gitignore" \
    --exclude "*.sh" \
    --exclude "node_modules/*" \
    --cache-control "public, max-age=3600" \
    --delete

print_status "Files synced to S3 successfully"

# Step 5: Invalidate CloudFront cache
if [ "$INVALIDATE_CACHE" = true ] && [ -n "$DISTRIBUTION_ID" ]; then
    print_status "Creating CloudFront invalidation..."
    INVALIDATION_ID=$(aws cloudfront create-invalidation \
        --distribution-id "$DISTRIBUTION_ID" \
        --paths "/*" \
        --query 'Invalidation.Id' \
        --output text)
    print_status "Cache invalidation initiated (ID: $INVALIDATION_ID)"
    
    # Optionally wait for invalidation to complete
    # print_status "Waiting for invalidation to complete..."
    # aws cloudfront wait invalidation-completed \
    #     --distribution-id "$DISTRIBUTION_ID" \
    #     --id "$INVALIDATION_ID"
else
    if [ "$INVALIDATE_CACHE" = false ]; then
        print_warning "Skipping cache invalidation (--no-invalidate flag)"
    fi
fi

# Display deployment summary
echo ""
echo "============================================"
print_status "Deployment complete!"
echo "============================================"
echo ""
if [ -n "$WEBSITE_URL" ]; then
    echo "Your site is available at:"
    echo -e "${GREEN}$WEBSITE_URL${NC}"
else
    echo "Your site is available via CloudFront"
fi
echo ""
print_info "S3 Bucket: $BUCKET_NAME"
print_info "CloudFront Distribution: $DISTRIBUTION_ID"
if [ "$INVALIDATE_CACHE" = true ]; then
    print_info "Cache invalidation: In progress"
fi
echo "============================================"