resource "aws_ecs_task_definition" "prediction_api" {
  family = "prediction_api_service"
  container_definitions = "${file("deploy-system/predictionapi.json")}"
}


resource "aws_ecs_service" "prediction_api" {
  name = "prediction_api"
  task_definition = "${aws_ecs_task_definition.prediction_api.arn}"
  desired_count = 1
  
}
