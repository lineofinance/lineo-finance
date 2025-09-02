# Import existing Route53 zone from main infrastructure
data "aws_route53_zone" "lineo_finance" {
  name = var.domain_name
}

# Import existing ACM certificate for CloudFront (us-east-1)
data "aws_acm_certificate" "cloudfront_cert" {
  provider = aws.us_east_1
  domain   = "*.${var.domain_name}"
  statuses = ["ISSUED"]
}

# Import existing ACM certificate for regional services (eu-central-1)
data "aws_acm_certificate" "regional_cert" {
  domain   = "*.${var.domain_name}"
  statuses = ["ISSUED"]
}