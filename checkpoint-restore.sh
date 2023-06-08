#!/bin/bash

container_name=$1
backup_file=$2

# Check if both arguments are provided
if [ -z "$container_name" ] || [ -z "$backup_file" ]; then
    echo "Usage: $0 <container_name> <backup_file>"
    exit 1
fi

podman container checkpoint "$container_name" -e "$backup_file.tar.gz"
podman container restore -i "$backup_file.tar.gz"
