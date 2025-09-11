output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = aws_cloudfront_distribution.website.id
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.website.domain_name
}

output "cloudfront_distribution_arn" {
  description = "CloudFront distribution ARN"
  value       = aws_cloudfront_distribution.website.arn
}

output "s3_bucket_name" {
  description = "Name of the S3 bucket"
  value       = aws_s3_bucket.website.id
}

output "s3_bucket_arn" {
  description = "ARN of the S3 bucket"
  value       = aws_s3_bucket.website.arn
}

output "s3_bucket_regional_domain_name" {
  description = "Regional domain name of the S3 bucket"
  value       = aws_s3_bucket.website.bucket_regional_domain_name
}

# Apex domain redirect outputs
output "apex_cloudfront_distribution_id" {
  description = "Apex domain CloudFront distribution ID"
  value       = aws_cloudfront_distribution.apex_redirect.id
}

output "apex_cloudfront_domain_name" {
  description = "Apex domain CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.apex_redirect.domain_name
}

output "apex_cloudfront_distribution_arn" {
  description = "Apex domain CloudFront distribution ARN"
  value       = aws_cloudfront_distribution.apex_redirect.arn
}