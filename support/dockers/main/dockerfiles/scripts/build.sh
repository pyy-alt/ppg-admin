#!/bin/bash

echo "************************************************"
echo "Building for RELEASE"
echo "************************************************"

cd /root/web

# cleanup / setup
rm -rf node_modules/.cache
npm install
export NODE_OPTIONS=--openssl-legacy-provider

# build
npm run build
