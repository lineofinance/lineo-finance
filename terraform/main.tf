# Static Website Module - S3, CloudFront, Route53
module "static_website" {
  source = "./modules/static-website"
  
  project_name      = var.project_name
  environment       = var.environment
  domain_name       = var.domain_name
  full_domain       = local.full_domain
  zone_id           = data.aws_route53_zone.lineo_finance.zone_id
  certificate_arn   = data.aws_acm_certificate.cloudfront_cert.arn
  common_tags       = local.common_tags
}

# Form Processing Module - Lambda, API Gateway, IAM
module "form_processing" {
  source = "./modules/form-processing"
  
  project_name             = var.project_name
  environment              = var.environment
  domain_name              = var.domain_name
  contact_email_recipients = var.contact_email_recipients
  career_email_recipients  = var.career_email_recipients
  notification_email_from  = var.notification_email_from
  uploads_bucket_id        = module.storage.uploads_bucket_id
  uploads_bucket_arn       = module.storage.uploads_bucket_arn
  certificate_arn          = data.aws_acm_certificate.regional_cert.arn
  common_tags              = local.common_tags
}

# Storage Module - S3 bucket for uploads
module "storage" {
  source = "./modules/storage"
  
  project_name    = var.project_name
  environment     = var.environment
  max_pdf_size_mb = var.max_pdf_size_mb
  common_tags     = local.common_tags
}

# Email Module - SES configuration
module "email" {
  source = "./modules/email"
  
  domain_name             = var.domain_name
  notification_email_from = var.notification_email_from
  zone_id                 = data.aws_route53_zone.lineo_finance.zone_id
  common_tags             = local.common_tags
}