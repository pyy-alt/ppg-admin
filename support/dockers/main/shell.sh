#!/bin/bash
set -e

# set paths
temp=$( readlink -f -- "$0" )
scriptPath=$( dirname $temp )
rootPath=$( readlink -f -- "$( dirname $temp )/../../..")
# set tag
TAG=$( cat $scriptPath/TAG )

# shell to running image
docker exec -it $( docker ps -qa --filter="ancestor=$TAG" ) /bin/bash
