export IMAGE_TAG=$DOCKER_USERNAME/prediction-api
docker build -t $IMAGE_TAG .
docker login -u "$DOCKER_USERNAME" -p "$DOCKER_PASSWORD"
docker push $IMAGE_TAG