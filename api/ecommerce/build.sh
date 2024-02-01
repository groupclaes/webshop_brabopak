#!/bin/bash
docker_tag="latest"
docker_reg="groupclaes"
PACKAGE_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g' \
  | tr -d '[[:space:]]')
PACKAGE_NAME=$(cat package.json \
  | grep name \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g' \
  | tr -d '[[:space:]]')

echo "building docker images ${docker_reg}/${PACKAGE_NAME}:${docker_tag} and ${docker_reg}/${PACKAGE_NAME}:${PACKAGE_VERSION}"

docker build --platform linux/amd64 --progress=plain --no-cache -t "${docker_reg}/${PACKAGE_NAME}:${docker_tag}" -t "${docker_reg}/${PACKAGE_NAME}:${PACKAGE_VERSION}" -f Dockerfile . &&
docker push "${docker_reg}/${PACKAGE_NAME}:${docker_tag}" &&
docker push "${docker_reg}/${PACKAGE_NAME}:${PACKAGE_VERSION}"