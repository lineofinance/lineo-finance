output "api_gateway_url" {
  description = "API Gateway URL"
  value       = "https://${aws_api_gateway_rest_api.forms.id}.execute-api.${data.aws_region.current.name}.amazonaws.com/${aws_api_gateway_deployment.forms.stage_name}"
}

data "aws_region" "current" {}

output "api_gateway_id" {
  description = "API Gateway ID"
  value       = aws_api_gateway_rest_api.forms.id
}

output "contact_lambda_function_name" {
  description = "Contact form Lambda function name"
  value       = aws_lambda_function.contact_form.function_name
}

output "contact_lambda_function_arn" {
  description = "Contact form Lambda function ARN"
  value       = aws_lambda_function.contact_form.arn
}

output "career_lambda_function_name" {
  description = "Career form Lambda function name"
  value       = aws_lambda_function.career_form.function_name
}

output "career_lambda_function_arn" {
  description = "Career form Lambda function ARN"
  value       = aws_lambda_function.career_form.arn
}