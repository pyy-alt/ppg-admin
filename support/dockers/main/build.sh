#!/bin/bash
set -e

# set paths
temp=$( readlink -f -- "$0" )
scriptPath=$( dirname $temp )
rootPath=$( readlink -f -- "$( dirname $temp )/../../..")
# set tag
TAG=$( cat $scriptPath/TAG )

# cleanup
set +e ; $scriptPath/clean.sh ; set -e

# build the image
docker build -t $TAG $scriptPath
