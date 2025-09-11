#!/bin/bash

# Deploy apex domain redirect infrastructure
# This script applies the Terraform changes to set up apex domain redirect

set -e

echo "🚀 Deploying apex domain redirect infrastructure..."

# Check if we're in the terraform directory
if [ ! -f "terraform.tfvars" ]; then
    echo "❌ Error: terraform.tfvars not found. Run this script from the terraform directory."
    exit 1
fi

# Initialize Terraform
echo "📦 Initializing Terraform..."
terraform init

# Validate configuration
echo "✅ Validating Terraform configuration..."
terraform validate

# Plan the changes
echo "📋 Planning Terraform changes..."
terraform plan -out=apex-redirect.tfplan

# Apply the changes
echo "🚀 Applying Terraform changes..."
terraform apply apex-redirect.tfplan

# Clean up plan file
rm -f apex-redirect.tfplan

echo "✅ Apex domain redirect infrastructure deployed successfully!"
echo ""
echo "📊 Infrastructure Summary:"
echo "- Apex domain: lineo.finance"
echo "- WWW domain: www.lineo.finance"
echo "- Redirect: lineo.finance → https://www.lineo.finance"
echo ""
echo "🧪 Test the redirect:"
echo "curl -I https://lineo.finance"
echo "Expected: HTTP 301 redirect to https://www.lineo.finance"
echo ""
echo "⏱️ Note: DNS propagation may take 5-15 minutes for changes to be visible globally."