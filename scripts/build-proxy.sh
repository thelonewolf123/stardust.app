#!/bin/bash

cd infra/docker
docker build -t docker.io/thelonewolf123/docker-proxy --platform=linux/amd64 .
docker push  docker.io/thelonewolf123/docker-proxy