#!/bin/bash

# Cleanup script for CloudFront distribution E2D4W6NZA0QP0T

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

DISTRIBUTION_ID="E2D4W6NZA0QP0T"

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
echo "CloudFront Distribution Cleanup"
echo "Distribution ID: $DISTRIBUTION_ID"
echo "============================================"

# Check current status
print_status "Checking distribution status..."
STATUS=$(aws cloudfront get-distribution --id "$DISTRIBUTION_ID" --query 'Distribution.Status' --output text 2>/dev/null || echo "NotFound")

if [ "$STATUS" == "NotFound" ]; then
    print_status "Distribution already deleted!"
    exit 0
fi

ENABLED=$(aws cloudfront get-distribution --id "$DISTRIBUTION_ID" --query 'Distribution.DistributionConfig.Enabled' --output text 2>/dev/null || echo "false")

print_info "Current status: $STATUS, Enabled: $ENABLED"

# If enabled, disable it first
if [ "$ENABLED" == "true" ]; then
    print_status "Distribution is enabled. Disabling..."
    
    # Get current config
    aws cloudfront get-distribution-config --id "$DISTRIBUTION_ID" > /tmp/dist-full.json
    ETAG=$(jq -r '.ETag' /tmp/dist-full.json)
    jq '.DistributionConfig.Enabled = false | .DistributionConfig' /tmp/dist-full.json > /tmp/dist-disabled.json
    
    # Disable the distribution
    aws cloudfront update-distribution \
        --id "$DISTRIBUTION_ID" \
        --if-match "$ETAG" \
        --distribution-config file:///tmp/dist-disabled.json \
        > /dev/null 2>&1
    
    print_status "Distribution disabled. Waiting for deployment..."
    print_warning "This can take 5-15 minutes..."
fi

# Wait for distribution to be deployed
if [ "$STATUS" == "InProgress" ] || [ "$ENABLED" == "true" ]; then
    print_status "Waiting for distribution to be fully deployed..."
    
    # Poll status every 30 seconds
    COUNTER=0
    MAX_WAIT=30  # 15 minutes max
    
    while [ $COUNTER -lt $MAX_WAIT ]; do
        STATUS=$(aws cloudfront get-distribution --id "$DISTRIBUTION_ID" --query 'Distribution.Status' --output text 2>/dev/null || echo "NotFound")
        
        if [ "$STATUS" == "Deployed" ]; then
            print_status "Distribution is deployed and ready for deletion"
            break
        elif [ "$STATUS" == "NotFound" ]; then
            print_status "Distribution already deleted!"
            exit 0
        fi
        
        echo -n "."
        sleep 30
        ((COUNTER++))
    done
    
    echo ""
    
    if [ $COUNTER -eq $MAX_WAIT ]; then
        print_error "Timeout waiting for distribution. Please try again later."
        exit 1
    fi
fi

# Delete the distribution
print_status "Deleting distribution..."

# Get fresh config and ETag
aws cloudfront get-distribution-config --id "$DISTRIBUTION_ID" > /tmp/dist-final.json 2>/dev/null
FINAL_ETAG=$(jq -r '.ETag' /tmp/dist-final.json)

aws cloudfront delete-distribution \
    --id "$DISTRIBUTION_ID" \
    --if-match "$FINAL_ETAG" \
    2>/dev/null && print_status "Distribution deleted successfully!" || print_warning "Distribution may already be deleted"

# Clean up temp files
rm -f /tmp/dist-*.json

echo ""
print_status "Cleanup complete!"
echo "You can now run 'terraform apply' to create your new infrastructure."