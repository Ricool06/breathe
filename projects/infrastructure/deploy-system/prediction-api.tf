resource "aws_iam_role" "prediction_api" {
  name = "prediction_api_role"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "ecs.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}


resource "aws_ecs_cluster" "prediction_api" {
  name = "prediction_api_cluster"
}

resource "aws_ecs_task_definition" "prediction_api" {
  family = "prediction_api_service"
  container_definitions = "${file("deploy-system/predictionapi.json")}"
}


resource "aws_ecs_service" "prediction_api" {
  name = "prediction_api"
  cluster = "${aws_ecs_cluster.prediction_api.id}"
  task_definition = "${aws_ecs_task_definition.prediction_api.arn}"
  desired_count = 1
  
}
