# VPC
resource "aws_vpc" "prediction_api" {
  cidr_block = "10.0.0.0/16"
}

resource "aws_subnet" "prediction_api" {
  count = 2
  cidr_block = "${cidrsubnet(aws_vpc.prediction_api.cidr_block, 8, count.index)}"
  vpc_id = "${aws_vpc.prediction_api.id}"
  availability_zone = "${data.aws_availability_zones.available.names[count.index]}"
}

resource "aws_security_group" "prediction_api" {
  vpc_id = "${aws_vpc.prediction_api.id}"

  ingress {
    protocol = "-1"
    from_port = 0
    to_port = 0
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    protocol = "-1"
    from_port = 0
    to_port = 0
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Gateway
resource "aws_internet_gateway" "gw" {
  vpc_id = "${aws_vpc.prediction_api.id}"
}

resource "aws_route" "internet_access" {
  route_table_id         = "${aws_vpc.prediction_api.main_route_table_id}"
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = "${aws_internet_gateway.gw.id}"
}

resource "aws_eip" "gw" {
  count      = 2
  vpc        = true
  depends_on = ["aws_internet_gateway.gw"]
}

resource "aws_nat_gateway" "gw" {
  count         = 2
  subnet_id     = "${element(aws_subnet.prediction_api.*.id, count.index)}"
  allocation_id = "${element(aws_eip.gw.*.id, count.index)}"
}

# Load balancer
resource "aws_lb" "prediction_api" {
  name = "prediction-api"
  internal = false
  load_balancer_type = "application"
  subnets = ["${aws_subnet.prediction_api.*.id}"]
  security_groups = ["${aws_security_group.prediction_api.id}"]
}

resource "aws_lb_target_group" "prediction_api" {
  name = "prediction-api-lb-target-group"
  port = 5890
  protocol = "HTTP"
  vpc_id = "${aws_vpc.prediction_api.id}"
  depends_on = ["aws_lb.prediction_api"]
  target_type = "ip"

  health_check {
    matcher = "400-499"
  }
}

resource "aws_lb_listener" "prediction_api" {
  load_balancer_arn = "${aws_lb.prediction_api.id}"
  port              = "80"
  protocol          = "HTTP"

  default_action {
    target_group_arn = "${aws_lb_target_group.prediction_api.id}"
    type             = "forward"
  }
}

# ECS
resource "aws_ecs_cluster" "prediction_api" {
  name = "prediction_api_cluster"
}

data "aws_iam_role" "ecs_task_execution_role" {
  name = "ecsTaskExecutionRole"
}

resource "aws_cloudwatch_log_group" "prediction_api" {
  name = "awslogs-prediction-api"
}

resource "aws_ecs_task_definition" "prediction_api" {
  family = "prediction_api_service"
  network_mode = "awsvpc"
  execution_role_arn = "${data.aws_iam_role.ecs_task_execution_role.arn}"
  container_definitions = "${file("deploy-system/prediction-api.json")}"
  requires_compatibilities = ["FARGATE"]
  cpu = 1024
  memory = 2048
}


resource "aws_ecs_service" "prediction_api" {
  name = "prediction_api"
  cluster = "${aws_ecs_cluster.prediction_api.id}"
  task_definition = "${aws_ecs_task_definition.prediction_api.arn}"
  desired_count = 1
  depends_on = ["aws_lb_target_group.prediction_api"]
  launch_type = "FARGATE"

  load_balancer {
    target_group_arn = "${aws_lb_target_group.prediction_api.arn}"
    container_name = "prediction-api"
    container_port = 5890
  }

  network_configuration {
    subnets = ["${aws_subnet.prediction_api.*.id}"]
    assign_public_ip = true
    security_groups = ["${aws_security_group.prediction_api.id}"]
  }
}


# API Gateway
resource "aws_api_gateway_rest_api" "prediction_api" {
  name               = "${local.project_name}-${terraform.workspace}-prediction-api"
  description        = "Prediction API for ${local.project_name}"
  binary_media_types = ["*/*"]
}

resource "aws_api_gateway_resource" "prediction_api_proxy" {
  rest_api_id = "${aws_api_gateway_rest_api.prediction_api.id}"
  parent_id   = "${aws_api_gateway_rest_api.prediction_api.root_resource_id}"
  path_part   = "{proxy+}"
}

resource "aws_api_gateway_method" "prediction_api_proxy" {
  rest_api_id   = "${aws_api_gateway_rest_api.prediction_api.id}"
  resource_id   = "${aws_api_gateway_resource.prediction_api_proxy.id}"
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "prediction_api_proxy" {
    rest_api_id   = "${aws_api_gateway_rest_api.prediction_api.id}"
    resource_id   = "${aws_api_gateway_resource.prediction_api_proxy.id}"
    http_method   = "${aws_api_gateway_method.prediction_api_proxy.http_method}"
    status_code   = "200"
    # response_models {
    #     "application/json" = "Empty"
    # }
    response_parameters {
        # "method.response.header.Access-Control-Allow-Headers" = true,
        # "method.response.header.Access-Control-Allow-Methods" = true,
        "method.response.header.Access-Control-Allow-Origin" = true
    }
    depends_on = ["aws_api_gateway_method.prediction_api_proxy"]
}

resource "aws_api_gateway_integration" "prediction_api_lb" {
  rest_api_id = "${aws_api_gateway_rest_api.prediction_api.id}"
  resource_id = "${aws_api_gateway_method.prediction_api_proxy.resource_id}"
  http_method = "${aws_api_gateway_method.prediction_api_proxy.http_method}"

  # May need to change later based on if it works with ECS/VPC
  integration_http_method = "GET"

  type = "HTTP_PROXY"
  uri  = "http://${aws_lb.prediction_api.dns_name}/predict"
}

resource "aws_api_gateway_integration_response" "prediction_api" {
    rest_api_id   = "${aws_api_gateway_rest_api.prediction_api.id}"
    resource_id   = "${aws_api_gateway_resource.prediction_api_proxy.id}"
    http_method   = "${aws_api_gateway_method.prediction_api_proxy.http_method}"
    status_code   = "${aws_api_gateway_method_response.prediction_api_proxy.status_code}"
    response_parameters = {
        # "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
        # "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS,POST,PUT'",
        "method.response.header.Access-Control-Allow-Origin" = "'*'"
    }
    depends_on = ["aws_api_gateway_method_response.prediction_api_proxy"]
}

resource "aws_api_gateway_deployment" "prediction_api" {
  depends_on = [
    "aws_api_gateway_integration.prediction_api_lb",
  ]

  rest_api_id = "${aws_api_gateway_rest_api.prediction_api.id}"
  stage_name  = "${terraform.workspace}"
}
