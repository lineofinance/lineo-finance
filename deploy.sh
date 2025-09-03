#!/bin/bash

# Lineo Finance Deployment Script
# Usage: ./deploy.sh

set -e  # Exit on error

echo "🚀 Starting deployment to AWS..."

# 1. Build the site
echo "📦 Building site with 11ty..."
npm run build

# 2. Sync to S3
echo "☁️  Uploading to S3..."
aws s3 sync ./dist/ s3://lineo-website-test/ \
  --delete \
  --exclude ".git/*" \
  --exclude ".DS_Store" \
  --exclude "node_modules/*"

# 3. Invalidate CloudFront cache
echo "🔄 Invalidating CloudFront cache..."
INVALIDATION_ID=$(aws cloudfront create-invalidation \
  --distribution-id E29ZHLC4RMNZLN \
  --paths "/*" \
  --query 'Invalidation.Id' \
  --output text)

echo "✅ Deployment complete!"
echo "📝 CloudFront invalidation ID: $INVALIDATION_ID"
echo "🌐 Site will be updated at: https://www.lineo.finance"