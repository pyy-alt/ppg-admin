#!/bin/bash
set -e

# set paths
temp=$( readlink -f -- "$0" )
scriptPath=$( dirname $temp )
rootPath=$( readlink -f -- "$( dirname $temp )/..")

$scriptPath/dockers/main/build.sh
$scriptPath/dockers/main/run.sh /root/scripts/preview.sh
# 
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT

