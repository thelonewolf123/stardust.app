#!/bin/bash

container_name=$1

# Check if both arguments are provided
if [ -z "$container_name" ] then
    echo "Usage: $0 <container_name> <backup_file>"
    exit 1
fi

podman container checkpoint "$container_name" -e "snapshot.tar.gz"
podman container restore -i "snapshot.tar.gz"
