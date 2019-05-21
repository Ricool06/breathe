variable "aws_region" {
  default = "eu-west-1"
}

data "aws_region" "current" {}

data "aws_caller_identity" "current" {}

data "aws_availability_zones" "available" {}


provider "aws" {
  region  = "${var.aws_region}"
}
