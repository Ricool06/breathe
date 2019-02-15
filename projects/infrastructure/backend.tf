terraform {
  backend "s3" {
    bucket         = "breathe-106887332414-eu-west-1"
    key            = "terraform.tfstate"
    region         = "eu-west-1"
    dynamodb_table = "breathe-106887332414-eu-west-1"
  }
}