#!/bin/bash
set -e

# set paths
temp=$( readlink -f -- "$0" )
scriptPath=$( dirname $temp )
rootPath=$( readlink -f -- "$( dirname $temp )/..")

$scriptPath/dockers/main/build.sh
$scriptPath/dockers/main/run.sh /root/scripts/codegen.sh
