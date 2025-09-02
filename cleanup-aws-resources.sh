#!/bin/bash

# Cleanup script for manually created AWS resources
# This removes the test.lineo.finance setup created via deploy.sh

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration from deploy.sh
BUCKET_NAME="lineo-finance-test"
REGION="eu-central-1"
CLOUDFRONT_DISTRIBUTION_ID="E2D4W6NZA0QP0T"
CLOUDFRONT_DOMAIN="dabpa3yws2cob.cloudfront.net"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[CLEANUP]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

echo "============================================"
echo "AWS Resources Cleanup for test.lineo.finance"
echo "============================================"
echo ""
echo "This will delete:"
echo "  - CloudFront distribution: $CLOUDFRONT_DISTRIBUTION_ID"
echo "  - S3 bucket: $BUCKET_NAME"
echo "  - Route53 CNAME record: test.lineo.finance"
echo ""
read -p "Are you sure you want to delete these resources? (yes/no): " confirmation

if [ "$confirmation" != "yes" ]; then
    print_warning "Cleanup cancelled"
    exit 0
fi

# Step 1: Disable CloudFront distribution first
print_status "Disabling CloudFront distribution..."
aws cloudfront get-distribution-config --id "$CLOUDFRONT_DISTRIBUTION_ID" > /tmp/dist-config.json 2>/dev/null || {
    print_warning "CloudFront distribution $CLOUDFRONT_DISTRIBUTION_ID not found or already deleted"
    CLOUDFRONT_DELETED=true
}

if [ -z "$CLOUDFRONT_DELETED" ]; then
    # Extract ETag and config
    ETAG=$(jq -r '.ETag' /tmp/dist-config.json)
    jq '.DistributionConfig.Enabled = false' /tmp/dist-config.json > /tmp/dist-config-disabled.json
    
    # Disable the distribution
    aws cloudfront update-distribution \
        --id "$CLOUDFRONT_DISTRIBUTION_ID" \
        --if-match "$ETAG" \
        --distribution-config file:///tmp/dist-config-disabled.json \
        > /dev/null 2>&1 || true
    
    print_status "CloudFront distribution disabled. Waiting for it to deploy..."
    print_warning "This may take 5-15 minutes..."
    
    # Wait for distribution to be deployed
    aws cloudfront wait distribution-deployed --id "$CLOUDFRONT_DISTRIBUTION_ID" 2>/dev/null || true
    
    # Delete the distribution
    print_status "Deleting CloudFront distribution..."
    
    # Get updated config and ETag after disabling
    aws cloudfront get-distribution-config --id "$CLOUDFRONT_DISTRIBUTION_ID" > /tmp/dist-config-final.json 2>/dev/null || true
    FINAL_ETAG=$(jq -r '.ETag' /tmp/dist-config-final.json)
    
    aws cloudfront delete-distribution \
        --id "$CLOUDFRONT_DISTRIBUTION_ID" \
        --if-match "$FINAL_ETAG" \
        2>/dev/null || print_warning "Could not delete CloudFront distribution (may already be deleted)"
    
    print_status "CloudFront distribution deletion initiated"
    
    # Clean up temp files
    rm -f /tmp/dist-config.json /tmp/dist-config-disabled.json /tmp/dist-config-final.json
fi

# Step 2: Delete Route53 CNAME record
print_status "Deleting Route53 CNAME record for test.lineo.finance..."

# Get hosted zone ID
HOSTED_ZONE_ID=$(aws route53 list-hosted-zones --query "HostedZones[?Name=='lineo.finance.'].Id" --output text | cut -d'/' -f3)

if [ -n "$HOSTED_ZONE_ID" ]; then
    # Create change batch to delete record
    cat > /tmp/delete-record.json << EOF
{
    "Changes": [
        {
            "Action": "DELETE",
            "ResourceRecordSet": {
                "Name": "test.lineo.finance.",
                "Type": "CNAME",
                "TTL": 300,
                "ResourceRecords": [
                    {
                        "Value": "$CLOUDFRONT_DOMAIN"
                    }
                ]
            }
        }
    ]
}
EOF
    
    aws route53 change-resource-record-sets \
        --hosted-zone-id "$HOSTED_ZONE_ID" \
        --change-batch file:///tmp/delete-record.json \
        > /dev/null 2>&1 || print_warning "Route53 record may already be deleted or different"
    
    rm -f /tmp/delete-record.json
    print_status "Route53 CNAME record deleted"
else
    print_warning "Could not find hosted zone for lineo.finance"
fi

# Step 3: Empty and delete S3 bucket
print_status "Checking S3 bucket..."
if aws s3api head-bucket --bucket "$BUCKET_NAME" 2>/dev/null; then
    print_status "Emptying S3 bucket $BUCKET_NAME..."
    aws s3 rm s3://"$BUCKET_NAME" --recursive 2>/dev/null || true
    
    print_status "Deleting S3 bucket..."
    aws s3api delete-bucket --bucket "$BUCKET_NAME" --region "$REGION" 2>/dev/null || true
    print_status "S3 bucket deleted"
else
    print_warning "S3 bucket $BUCKET_NAME not found or already deleted"
fi

# Step 4: Clean up local files
print_status "Cleaning up local configuration files..."
rm -f .cloudfront-distribution-id
rm -f .cloudfront-url
print_status "Local files cleaned up"

echo ""
print_status "Cleanup complete!"
echo ""
echo "============================================"
echo "All test.lineo.finance resources have been removed."
echo "You can now deploy using Terraform."
echo "============================================"