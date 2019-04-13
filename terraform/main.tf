terraform {
  backend "s3" {
    bucket  = "cadet-terraform-state"
    key     = "cadet-frontend.tfstate"
    region  = "ap-southeast-1"
    encrypt = "true"
    acl     = "private"
  }
}

variable "bucket_name" {
  default = "stg-cadet-frontend"
}

provider "aws" {
  region = "ap-southeast-1"
}

resource "aws_s3_bucket" "stg-site" {
  bucket = "${var.bucket_name}"
  force_destroy = true
  website {
    index_document = "index.html"
    error_document = "index.html"
  }
  policy = <<EOF
{
  "Id": "bucket_policy_site",
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "bucket_policy_site_main",
      "Action": [
        "s3:GetObject"
      ],
      "Effect": "Allow",
      "Resource": "arn:aws:s3:::${var.bucket_name}/*",
      "Principal": "*"
    }
  ]
}
EOF
  provisioner "local-exec" {
    command = "npm run build && ./sync-build.sh"
  }
}
