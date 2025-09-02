variable "domain_name" {
  description = "Domain name for SES"
  type        = string
}

variable "notification_email_from" {
  description = "From email address for notifications"
  type        = string
}

variable "zone_id" {
  description = "Route53 zone ID"
  type        = string
}

variable "common_tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
}