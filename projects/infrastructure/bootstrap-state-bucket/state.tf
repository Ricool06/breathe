locals {
  state_bucket_and_table_name = "${local.project_name}-${data.aws_caller_identity.current.account_id}-${data.aws_region.current.name}"
}

resource "aws_dynamodb_table" "state_lock_table" {
  name = "${local.state_bucket_and_table_name}"
  read_capacity = "20"
  write_capacity = "20"
  hash_key = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }
}

resource "aws_s3_bucket" "state_bucket" {
  bucket = "${local.state_bucket_and_table_name}"
  region = "${data.aws_region.current.name}"

  versioning {
    enabled = true
  }

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }

  tags {
    Name = "terraform-state-bucket"
    Environment = "global"
    project = "${local.project_name}"
  }
}

output "BACKEND_BUCKET_NAME" {
  value = "${aws_s3_bucket.state_bucket.bucket}"
}

output "BACKEND_TABLE_NAME" {
  value = "${aws_dynamodb_table.state_lock_table.name}"
}
