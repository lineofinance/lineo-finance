# Import existing Route53 zone from main infrastructure
data "aws_route53_zone" "lineo_finance" {
  name = var.domain_name
}

# ACM certificate for CloudFront (us-east-1) - covers both apex and wildcard
resource "aws_acm_certificate" "cloudfront_cert" {
  provider          = aws.us_east_1
  domain_name       = var.domain_name
  subject_alternative_names = ["*.${var.domain_name}"]
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "${var.project_name}-cloudfront-cert"
  }
}

# Route53 validation records for ACM certificate
resource "aws_route53_record" "cert_validation" {
  provider = aws.us_east_1
  for_each = {
    for dvo in aws_acm_certificate.cloudfront_cert.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.lineo_finance.zone_id
}

# Certificate validation
resource "aws_acm_certificate_validation" "cloudfront_cert" {
  provider                = aws.us_east_1
  certificate_arn         = aws_acm_certificate.cloudfront_cert.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]

  timeouts {
    create = "5m"
  }
}

# Import existing ACM certificate for regional services (eu-central-1)
data "aws_acm_certificate" "regional_cert" {
  domain   = "*.${var.domain_name}"
  statuses = ["ISSUED"]
}