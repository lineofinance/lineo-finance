terraform {
  backend "s3" {
    bucket = "finatusgmbh-terraformstate"
    key    = "lineo-website-terraform"
    region = "eu-central-1"
  }
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  required_version = ">= 1.0"
}