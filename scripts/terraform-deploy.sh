#!/bin/bash

# Terraform Deployment Script
# Usage: ./scripts/terraform-deploy.sh [plan|apply|destroy]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

TERRAFORM_DIR="./terraform"
ACTION="${1:-plan}"

echo -e "${BLUE}🚀 Running Terraform $ACTION...${NC}"

# Check if terraform directory exists
if [[ ! -d "$TERRAFORM_DIR" ]]; then
    echo -e "${RED}❌ Terraform directory not found: $TERRAFORM_DIR${NC}"
    exit 1
fi

cd "$TERRAFORM_DIR"

# Initialize terraform if needed
if [[ ! -d ".terraform" ]]; then
    echo -e "${YELLOW}🔧 Initializing Terraform...${NC}"
    terraform init
fi

# Execute the requested action
case "$ACTION" in
    "plan")
        echo -e "${YELLOW}📋 Planning Terraform changes...${NC}"
        terraform plan
        ;;
    "apply")
        echo -e "${YELLOW}🚀 Applying Terraform changes...${NC}"
        terraform apply
        
        echo -e "${GREEN}✅ Terraform apply complete!${NC}"
        echo ""
        echo -e "${BLUE}📊 Infrastructure Outputs:${NC}"
        terraform output
        echo ""
        echo -e "${YELLOW}💡 Next steps:${NC}"
        echo "1. Run ./scripts/setup-github-secrets.sh to configure GitHub Actions"
        echo "2. Set up AWS OIDC authentication (see script output)"
        echo "3. Create a git tag (e.g., v1.0.0) to trigger deployment"
        ;;
    "destroy")
        echo -e "${RED}⚠️  WARNING: This will destroy all infrastructure!${NC}"
        read -p "Are you sure? (type 'yes' to confirm): " confirm
        if [[ "$confirm" == "yes" ]]; then
            terraform destroy
            echo -e "${GREEN}✅ Infrastructure destroyed${NC}"
        else
            echo -e "${YELLOW}❌ Destruction cancelled${NC}"
        fi
        ;;
    *)
        echo -e "${RED}❌ Invalid action: $ACTION${NC}"
        echo "Usage: $0 [plan|apply|destroy]"
        exit 1
        ;;
esac

cd - > /dev/null