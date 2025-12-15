#!/bin/bash

echo "************************************************"
echo "Previewing PRODUCTION Build"
echo "************************************************"

cd /root/web

# cleanup / setup
rm -rf node_modules/.cache
npm install
export NODE_OPTIONS=--openssl-legacy-provider

# build first
npm run build

# then preview the production build
npm run preview -- --host  --port 5173
# 
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT

