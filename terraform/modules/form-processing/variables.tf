variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "domain_name" {
  description = "Domain name"
  type        = string
}

variable "contact_email_recipients" {
  description = "Email addresses to receive contact form submissions"
  type        = list(string)
}

variable "career_email_recipients" {
  description = "Email addresses to receive career form submissions"
  type        = list(string)
}

variable "notification_email_from" {
  description = "From email address for notifications"
  type        = string
}

variable "uploads_bucket_id" {
  description = "S3 bucket ID for uploads"
  type        = string
}

variable "uploads_bucket_arn" {
  description = "S3 bucket ARN for uploads"
  type        = string
}

variable "certificate_arn" {
  description = "ACM certificate ARN for API Gateway"
  type        = string
}

variable "common_tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
}