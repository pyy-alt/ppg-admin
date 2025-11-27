#!/bin/bash
set -e

# set paths
temp=$( readlink -f -- "$0" )
scriptPath=$( dirname $temp )
rootPath=$( readlink -f -- "$( dirname $temp )/../../..")
# set tag
TAG=$( cat $scriptPath/TAG )

USAGE="Usage: run.sh CMD"
PORT=$( cat $scriptPath/PORT )

if [ $# != 1 ] ; then
    echo $USAGE
    exit 1;
fi

CMD=$1

docker run -it --init \
    -v $rootPath:/root/web \
    -p $PORT:5173 \
    $TAG \
    $CMD
