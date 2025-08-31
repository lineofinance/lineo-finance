#!/bin/bash

# Lineo Finance CloudFront Deployment Script
# This script builds the site and deploys it to AWS S3/CloudFront

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BUCKET_NAME="lineo-finance-test"
REGION="eu-central-1"
CLOUDFRONT_DISTRIBUTION_ID=""  # Will be set after first deployment

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

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed. Please install it first."
    echo "Visit: https://aws.amazon.com/cli/"
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    print_error "AWS credentials not configured. Please run 'aws configure' first."
    exit 1
fi

# Parse command line arguments
SKIP_BUILD=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --help)
            echo "Usage: ./deploy.sh [options]"
            echo ""
            echo "Options:"
            echo "  --skip-build     Skip the build step (use existing dist folder)"
            echo "  --help           Show this help message"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Step 1: Build the site
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

# Step 2: Check if S3 bucket exists, create if not
print_status "Checking S3 bucket..."
if aws s3api head-bucket --bucket "$BUCKET_NAME" 2>/dev/null; then
    print_status "S3 bucket $BUCKET_NAME already exists"
else
    print_status "Creating S3 bucket $BUCKET_NAME..."
    aws s3api create-bucket \
        --bucket "$BUCKET_NAME" \
        --region "$REGION" \
        --create-bucket-configuration LocationConstraint="$REGION"
    
    # Enable static website hosting
    print_status "Configuring bucket for static website hosting..."
    aws s3api put-bucket-website \
        --bucket "$BUCKET_NAME" \
        --website-configuration '{
            "IndexDocument": {"Suffix": "index.html"},
            "ErrorDocument": {"Key": "404.html"}
        }'
    
    # Get AWS Account ID for bucket policy
    AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query 'Account' --output text)
    
    # Bucket policy will be set after CloudFront distribution is created
    print_status "Bucket created, policy will be configured after CloudFront setup..."
fi

# Step 3: Sync files to S3
print_status "Syncing files to S3..."
aws s3 sync dist/ s3://"$BUCKET_NAME"/ \
    --delete \
    --cache-control "public, max-age=3600" \
    --exclude ".git/*" \
    --exclude ".gitignore" \
    --exclude "*.sh" \
    --exclude "node_modules/*"

print_status "Files synced to S3 successfully"

# Step 4: Check if CloudFront distribution exists
DISTRIBUTION_FILE=".cloudfront-distribution-id"
if [ -f "$DISTRIBUTION_FILE" ]; then
    CLOUDFRONT_DISTRIBUTION_ID=$(cat "$DISTRIBUTION_FILE")
    print_status "Using existing CloudFront distribution: $CLOUDFRONT_DISTRIBUTION_ID"
else
    print_status "Creating Origin Access Control..."
    
    # Check if OAC already exists
    OAC_ID=$(aws cloudfront list-origin-access-controls --query "OriginAccessControlList.Items[?Name=='lineo-finance-oac'].Id | [0]" --output text 2>/dev/null || echo "")
    
    if [ -z "$OAC_ID" ] || [ "$OAC_ID" = "None" ]; then
        # Create Origin Access Control
        OAC_ID=$(aws cloudfront create-origin-access-control \
            --origin-access-control-config "{
                \"Name\": \"lineo-finance-oac\",
                \"Description\": \"OAC for Lineo Finance S3 bucket\",
                \"SigningProtocol\": \"sigv4\",
                \"SigningBehavior\": \"always\",
                \"OriginAccessControlOriginType\": \"s3\"
            }" --query 'OriginAccessControl.Id' --output text)
        print_status "Created Origin Access Control: $OAC_ID"
    else
        print_status "Using existing Origin Access Control: $OAC_ID"
    fi
    
    print_status "Creating CloudFront distribution..."
    
    # Create CloudFront distribution configuration with OAC
    cat > /tmp/cloudfront-config.json << EOF
{
    "CallerReference": "lineo-finance-$(date +%s)",
    "Comment": "Lineo Finance Test Distribution",
    "DefaultRootObject": "index.html",
    "Origins": {
        "Quantity": 1,
        "Items": [
            {
                "Id": "S3-${BUCKET_NAME}",
                "DomainName": "${BUCKET_NAME}.s3.${REGION}.amazonaws.com",
                "S3OriginConfig": {
                    "OriginAccessIdentity": ""
                },
                "OriginAccessControlId": "$OAC_ID"
            }
        ]
    },
    "DefaultCacheBehavior": {
        "TargetOriginId": "S3-${BUCKET_NAME}",
        "ViewerProtocolPolicy": "redirect-to-https",
        "AllowedMethods": {
            "Quantity": 2,
            "Items": ["GET", "HEAD"],
            "CachedMethods": {
                "Quantity": 2,
                "Items": ["GET", "HEAD"]
            }
        },
        "Compress": true,
        "CachePolicyId": "658327ea-f89d-4fab-a63d-7e88639e58f6",
        "TrustedSigners": {
            "Enabled": false,
            "Quantity": 0
        }
    },
    "CustomErrorResponses": {
        "Quantity": 2,
        "Items": [
            {
                "ErrorCode": 403,
                "ResponsePagePath": "/404.html",
                "ResponseCode": "404",
                "ErrorCachingMinTTL": 300
            },
            {
                "ErrorCode": 404,
                "ResponsePagePath": "/404.html",
                "ResponseCode": "404",
                "ErrorCachingMinTTL": 300
            }
        ]
    },
    "Enabled": true,
    "PriceClass": "PriceClass_100",
    "ViewerCertificate": {
        "CloudFrontDefaultCertificate": true
    }
}
EOF

    # Create the distribution
    DISTRIBUTION_OUTPUT=$(aws cloudfront create-distribution --distribution-config file:///tmp/cloudfront-config.json)
    CLOUDFRONT_DISTRIBUTION_ID=$(echo "$DISTRIBUTION_OUTPUT" | python3 -c "import sys, json; print(json.load(sys.stdin)['Distribution']['Id'])")
    
    # Save distribution ID for future deployments
    echo "$CLOUDFRONT_DISTRIBUTION_ID" > "$DISTRIBUTION_FILE"
    
    rm /tmp/cloudfront-config.json
    
    print_status "CloudFront distribution created: $CLOUDFRONT_DISTRIBUTION_ID"
    
    # Now set the bucket policy with the correct CloudFront distribution ARN
    print_status "Configuring S3 bucket policy for CloudFront access..."
    AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query 'Account' --output text)
    cat > /tmp/bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowCloudFrontServicePrincipal",
            "Effect": "Allow",
            "Principal": {
                "Service": "cloudfront.amazonaws.com"
            },
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::${BUCKET_NAME}/*",
            "Condition": {
                "StringEquals": {
                    "AWS:SourceArn": "arn:aws:cloudfront::${AWS_ACCOUNT_ID}:distribution/${CLOUDFRONT_DISTRIBUTION_ID}"
                }
            }
        }
    ]
}
EOF
    aws s3api put-bucket-policy --bucket "$BUCKET_NAME" --policy file:///tmp/bucket-policy.json
    rm /tmp/bucket-policy.json
    
    # Get the CloudFront domain name
    CLOUDFRONT_DOMAIN=$(aws cloudfront get-distribution --id "$CLOUDFRONT_DISTRIBUTION_ID" --query 'Distribution.DomainName' --output text)
    
    print_status "CloudFront distribution is being deployed..."
    print_warning "This may take 5-10 minutes to fully propagate"
    echo ""
    echo "==========================================="
    echo "CloudFront URL: https://${CLOUDFRONT_DOMAIN}"
    echo "==========================================="
    echo ""
    
    # Save the URL for reference
    echo "https://${CLOUDFRONT_DOMAIN}" > .cloudfront-url
fi

# Step 5: Always invalidate CloudFront cache
if [ -n "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    print_status "Creating CloudFront invalidation..."
    INVALIDATION_ID=$(aws cloudfront create-invalidation \
        --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
        --paths "/*" \
        --query 'Invalidation.Id' \
        --output text)
    print_status "Cache invalidation initiated (ID: $INVALIDATION_ID)"
fi

# Display the CloudFront URL if it exists
if [ -f ".cloudfront-url" ]; then
    CLOUDFRONT_URL=$(cat .cloudfront-url)
    echo ""
    print_status "Deployment complete!"
    echo ""
    echo "==========================================="
    echo "Your site is available at:"
    echo "$CLOUDFRONT_URL"
    echo "==========================================="
    echo ""
    print_status "CloudFront cache has been invalidated."
else
    # Get the CloudFront domain for existing distribution
    if [ -n "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
        CLOUDFRONT_DOMAIN=$(aws cloudfront get-distribution --id "$CLOUDFRONT_DISTRIBUTION_ID" --query 'Distribution.DomainName' --output text)
        echo "https://${CLOUDFRONT_DOMAIN}" > .cloudfront-url
        echo ""
        print_status "Deployment complete!"
        echo ""
        echo "==========================================="
        echo "Your site is available at:"
        echo "https://${CLOUDFRONT_DOMAIN}"
        echo "==========================================="
    fi
fi