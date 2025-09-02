output "ses_domain_identity_arn" {
  description = "ARN of the SES domain identity"
  value       = data.aws_ses_domain_identity.lineo.arn
}

output "ses_configuration_set_name" {
  description = "Name of the SES configuration set"
  value       = aws_ses_configuration_set.forms.name
}