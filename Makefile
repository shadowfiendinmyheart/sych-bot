IMAGE_NAME ?= tg-sych-bot
IMAGE_NAME_DEV ?= ${IMAGE_NAME}-dev
IMAGE_NAME_PRODUCTION ?= ${IMAGE_NAME}-production
CONTAINER_NAME ?= sych-bot-container
VOLUME_CONTAINER_PATH ?= /app/public
VOLUME_DIRECTORY ?= data
VOLUME_HOST_PATH ?= $(PWD)/${VOLUME_DIRECTORY}

init:
	mkdir data
build-prod:
	docker build -t ${IMAGE_NAME_PRODUCTION} . --build-arg ENV=production
run-prod:
	docker run --name ${CONTAINER_NAME} -v ${VOLUME_HOST_PATH}:${VOLUME_CONTAINER_PATH} -d --rm ${IMAGE_NAME_PRODUCTION}
build-dev:
	docker build -t ${IMAGE_NAME_DEV} . --build-arg ENV=development
run-dev:
	docker run --name ${CONTAINER_NAME} -v $(PWD):/app -v ${VOLUME_HOST_PATH}:${VOLUME_CONTAINER_PATH} -d --rm ${IMAGE_NAME_DEV}
stop:
	docker stop ${CONTAINER_NAME}
delete:
	docker container rm ${CONTAINER_NAME}
logs:
	docker logs --follow ${CONTAINER_NAME}
bash:
	docker exec -it ${CONTAINER_NAME} bash
