#!/bin/bash


# set paths
temp=$( readlink -f -- "$0" )
scriptPath=$( dirname $temp )
rootPath=$( readlink -f -- "$( dirname $temp )/../../..")
# set tag
TAG=$( cat $scriptPath/TAG )

# remove any running containers (only if they exist)
CONTAINERS=$(docker ps -a -q --filter="ancestor=$TAG" 2>/dev/null)
if [ ! -z "$CONTAINERS" ]; then
    docker rm -f $CONTAINERS
fi

# remove the image itself (only if it exists)
if docker images -q $TAG 2>/dev/null | grep -q .; then
    docker rmi $TAG 2>/dev/null || true
fi
