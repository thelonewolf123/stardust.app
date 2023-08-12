#!/bin/bash

cd infra/docker
docker build -t docker.io/thelonewolf123/docker-proxy --platform=linux/amd64 .
docker push  docker.io/thelonewolf123/docker-proxy 
# sudo podman run -v /var/run/podman/podman.sock:/var/run/docker.sock -p 2376:2376 -e BEARER_TOKEN=na7AB8uwrlvekot3ad6l docker.io/thelonewolf123/docker-proxy