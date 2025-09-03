variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "eu-central-1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "test"
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "lineo-website"
}

variable "domain_name" {
  description = "Domain name for the website"
  type        = string
  default     = "lineo.finance"
}

variable "website_subdomain" {
  description = "Subdomain for the website (use 'test' for testing, 'www' for production)"
  type        = string
  default     = "www"
}

variable "contact_email_recipients" {
  description = "Email addresses to receive contact form submissions"
  type        = list(string)
  default     = ["support@lineo.finance"]
}

variable "career_email_recipients" {
  description = "Email addresses to receive career form submissions"
  type        = list(string)
  default     = ["support@lineo.finance"]
}

variable "verified_emails_for_testing" {
  description = "Additional verified emails for sandbox testing"
  type        = list(string)
  default     = ["sebastian.stuecker@lineo.finance", "catrin.stuecker@lineo.finance"]
}

variable "notification_email_from" {
  description = "From email address for form notifications"
  type        = string
  default     = "support@lineo.finance"
}

variable "max_pdf_size_mb" {
  description = "Maximum PDF file size in MB for career uploads"
  type        = number
  default     = 10
}

locals {
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
    Repository  = "website/lineo-finance"
  }
  
  # Construct full domain
  full_domain = var.website_subdomain != "" ? "${var.website_subdomain}.${var.domain_name}" : var.domain_name
}