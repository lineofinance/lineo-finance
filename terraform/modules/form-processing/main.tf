# IAM role for Lambda functions
resource "aws_iam_role" "lambda_role" {
  name = "${var.project_name}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = var.common_tags
}

# IAM policy for Lambda functions
resource "aws_iam_role_policy" "lambda_policy" {
  name = "${var.project_name}-lambda-policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "ses:SendEmail",
          "ses:SendRawEmail"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject"
        ]
        Resource = "${var.uploads_bucket_arn}/*"
      }
    ]
  })
}

# Lambda function for contact form
resource "aws_lambda_function" "contact_form" {
  filename         = "${path.module}/../../lambda-functions/contact-form.zip"
  function_name    = "${var.project_name}-contact-form"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  timeout         = 30
  source_code_hash = filebase64sha256("${path.module}/../../lambda-functions/contact-form.zip")

  environment {
    variables = {
      EMAIL_RECIPIENTS = jsonencode(var.contact_email_recipients)
      EMAIL_FROM       = var.notification_email_from
      DOMAIN_NAME      = var.domain_name
    }
  }

  tags = var.common_tags
}

# Lambda function for career form
resource "aws_lambda_function" "career_form" {
  filename         = "${path.module}/../../lambda-functions/career-form.zip"
  function_name    = "${var.project_name}-career-form"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  timeout         = 60
  source_code_hash = filebase64sha256("${path.module}/../../lambda-functions/career-form.zip")

  environment {
    variables = {
      EMAIL_RECIPIENTS = jsonencode(var.career_email_recipients)
      EMAIL_FROM       = var.notification_email_from
      DOMAIN_NAME      = var.domain_name
      UPLOADS_BUCKET   = var.uploads_bucket_id
    }
  }

  tags = var.common_tags
}

# API Gateway
resource "aws_api_gateway_rest_api" "forms" {
  name        = "${var.project_name}-forms-api"
  description = "API for form submissions"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = var.common_tags
}

# API Gateway - /contact resource
resource "aws_api_gateway_resource" "contact" {
  rest_api_id = aws_api_gateway_rest_api.forms.id
  parent_id   = aws_api_gateway_rest_api.forms.root_resource_id
  path_part   = "contact"
}

# API Gateway - /contact OPTIONS method (for CORS)
resource "aws_api_gateway_method" "contact_options" {
  rest_api_id   = aws_api_gateway_rest_api.forms.id
  resource_id   = aws_api_gateway_resource.contact.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "contact_options" {
  rest_api_id = aws_api_gateway_rest_api.forms.id
  resource_id = aws_api_gateway_resource.contact.id
  http_method = aws_api_gateway_method.contact_options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = jsonencode({ statusCode = 200 })
  }
}

resource "aws_api_gateway_method_response" "contact_options" {
  rest_api_id = aws_api_gateway_rest_api.forms.id
  resource_id = aws_api_gateway_resource.contact.id
  http_method = aws_api_gateway_method.contact_options.http_method
  status_code = "200"

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "contact_options" {
  rest_api_id = aws_api_gateway_rest_api.forms.id
  resource_id = aws_api_gateway_resource.contact.id
  http_method = aws_api_gateway_method.contact_options.http_method
  status_code = aws_api_gateway_method_response.contact_options.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'OPTIONS,POST'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}

# API Gateway - /contact POST method
resource "aws_api_gateway_method" "contact_post" {
  rest_api_id   = aws_api_gateway_rest_api.forms.id
  resource_id   = aws_api_gateway_resource.contact.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "contact_post" {
  rest_api_id = aws_api_gateway_rest_api.forms.id
  resource_id = aws_api_gateway_resource.contact.id
  http_method = aws_api_gateway_method.contact_post.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.contact_form.invoke_arn
}

# API Gateway - /career resource
resource "aws_api_gateway_resource" "career" {
  rest_api_id = aws_api_gateway_rest_api.forms.id
  parent_id   = aws_api_gateway_rest_api.forms.root_resource_id
  path_part   = "career"
}

# API Gateway - /career OPTIONS method (for CORS)
resource "aws_api_gateway_method" "career_options" {
  rest_api_id   = aws_api_gateway_rest_api.forms.id
  resource_id   = aws_api_gateway_resource.career.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "career_options" {
  rest_api_id = aws_api_gateway_rest_api.forms.id
  resource_id = aws_api_gateway_resource.career.id
  http_method = aws_api_gateway_method.career_options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = jsonencode({ statusCode = 200 })
  }
}

resource "aws_api_gateway_method_response" "career_options" {
  rest_api_id = aws_api_gateway_rest_api.forms.id
  resource_id = aws_api_gateway_resource.career.id
  http_method = aws_api_gateway_method.career_options.http_method
  status_code = "200"

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "career_options" {
  rest_api_id = aws_api_gateway_rest_api.forms.id
  resource_id = aws_api_gateway_resource.career.id
  http_method = aws_api_gateway_method.career_options.http_method
  status_code = aws_api_gateway_method_response.career_options.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'OPTIONS,POST'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}

# API Gateway - /career POST method
resource "aws_api_gateway_method" "career_post" {
  rest_api_id   = aws_api_gateway_rest_api.forms.id
  resource_id   = aws_api_gateway_resource.career.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "career_post" {
  rest_api_id = aws_api_gateway_rest_api.forms.id
  resource_id = aws_api_gateway_resource.career.id
  http_method = aws_api_gateway_method.career_post.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.career_form.invoke_arn
}

# Lambda permissions for API Gateway
resource "aws_lambda_permission" "contact_api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.contact_form.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.forms.execution_arn}/*/*"
}

resource "aws_lambda_permission" "career_api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.career_form.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.forms.execution_arn}/*/*"
}

# API Gateway deployment
resource "aws_api_gateway_deployment" "forms" {
  rest_api_id = aws_api_gateway_rest_api.forms.id
  stage_name  = var.environment

  depends_on = [
    aws_api_gateway_method.contact_post,
    aws_api_gateway_method.contact_options,
    aws_api_gateway_integration.contact_post,
    aws_api_gateway_integration.contact_options,
    aws_api_gateway_method.career_post,
    aws_api_gateway_method.career_options,
    aws_api_gateway_integration.career_post,
    aws_api_gateway_integration.career_options,
  ]

  lifecycle {
    create_before_destroy = true
  }
}