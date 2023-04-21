#!/bin/bash

echo "building image 'jamievangeysel/quickfin-api' and pushing to docker registry"
docker build -t jamievangeysel/quickfin-api ./ && docker push jamievangeysel/quickfin-api
echo "Last runtime: $(date)"

docker image prune --filter label=stage=build --force
echo "removed build stage image"