output "website_url" {
  description = "URL of the website"
  value       = "https://${local.full_domain}"
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = module.static_website.cloudfront_distribution_id
}

output "s3_bucket_name" {
  description = "Name of the S3 bucket hosting the website"
  value       = module.static_website.s3_bucket_name
}

output "api_gateway_url" {
  description = "API Gateway URL for form submissions"
  value       = module.form_processing.api_gateway_url
}

output "contact_lambda_function_name" {
  description = "Name of the contact form Lambda function"
  value       = module.form_processing.contact_lambda_function_name
}

output "career_lambda_function_name" {
  description = "Name of the career form Lambda function"
  value       = module.form_processing.career_lambda_function_name
}

output "uploads_bucket_name" {
  description = "Name of the S3 bucket for career form uploads"
  value       = module.storage.uploads_bucket_name
}

output "github_actions_role_arn" {
  description = "ARN of the IAM role for GitHub Actions"
  value       = aws_iam_role.github_actions.arn
}