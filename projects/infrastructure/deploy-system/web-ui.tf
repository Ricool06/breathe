locals {
  web_ui_bucket_name = "${local.project_name}-${terraform.workspace}-web-ui"
  web_ui_bucket_key = "web-ui.zip"
}

resource "aws_s3_bucket" "web_ui" {
  bucket = "${local.web_ui_bucket_name}"

  tags {
    Environment = "${terraform.workspace}"
  }
}

resource "aws_s3_bucket_object" "web_ui" {
  bucket = "${local.web_ui_bucket_name}"
  key = "${local.web_ui_bucket_key}"
  source = "../web_ui/${local.web_ui_bucket_key}"
}

resource "aws_lambda_function" "web_ui" {
  function_name = "${local.project_name}-${terraform.workspace}-web-ui"

  s3_bucket = "${local.web_ui_bucket_name}"
  s3_key    = "${local.web_ui_bucket_key}"

  handler = "lambda.universal"
  runtime = "nodejs6.10"

  role = "${aws_iam_role.web_ui_lambda_exec.arn}"
}

resource "aws_iam_role" "web_ui_lambda_exec" {
  name = "${local.project_name}-${terraform.workspace}-web-ui"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": [
          "lambda.amazonaws.com"
        ]
      },
      "Action": [
        "sts:AssumeRole"
      ],
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_api_gateway_rest_api" "web_ui" {
  name               = "${local.project_name}-${terraform.workspace}-web-ui"
  description        = "Web UI for ${local.project_name}"
  binary_media_types = ["*/*"]
}

resource "aws_api_gateway_resource" "web_ui_proxy" {
  rest_api_id = "${aws_api_gateway_rest_api.web_ui.id}"
  parent_id   = "${aws_api_gateway_rest_api.web_ui.root_resource_id}"
  path_part   = "{proxy+}"
}

resource "aws_api_gateway_method" "web_ui_proxy" {
  rest_api_id   = "${aws_api_gateway_rest_api.web_ui.id}"
  resource_id   = "${aws_api_gateway_resource.web_ui_proxy.id}"
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "web_ui_lambda" {
  rest_api_id = "${aws_api_gateway_rest_api.web_ui.id}"
  resource_id = "${aws_api_gateway_method.web_ui_proxy.resource_id}"
  http_method = "${aws_api_gateway_method.web_ui_proxy.http_method}"

  # This can only be POST, it is not the only method a user can use to access the site
  # This is for invoking the lambda from API gateway
  integration_http_method = "POST"

  type = "AWS_PROXY"
  uri  = "${aws_lambda_function.web_ui.invoke_arn}"
}

# API root config
resource "aws_api_gateway_method" "proxy_root" {
  rest_api_id   = "${aws_api_gateway_rest_api.web_ui.id}"
  resource_id   = "${aws_api_gateway_rest_api.web_ui.root_resource_id}"
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "web_ui_lambda_root" {
  rest_api_id = "${aws_api_gateway_rest_api.web_ui.id}"
  resource_id = "${aws_api_gateway_method.proxy_root.resource_id}"
  http_method = "${aws_api_gateway_method.proxy_root.http_method}"

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "${aws_lambda_function.web_ui.invoke_arn}"
}

resource "aws_lambda_permission" "web_ui_api_gateway_lambda_permission" {
  statement_id  = "AllowInvokeFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.web_ui.function_name}"
  principal     = "apigateway.amazonaws.com"

  # The /*/*/* part allows invocation from any stage, method and resource path
  # within API Gateway REST API.
  source_arn = "${aws_api_gateway_rest_api.web_ui.execution_arn}/*/*/*"
}

resource "aws_api_gateway_deployment" "web_ui" {
  depends_on = [
    "aws_api_gateway_integration.web_ui_lambda",
    "aws_api_gateway_integration.web_ui_lambda_root",
    "aws_lambda_permission.web_ui_api_gateway_lambda_permission",
  ]

  rest_api_id = "${aws_api_gateway_rest_api.web_ui.id}"
  stage_name  = "${terraform.workspace}"
}