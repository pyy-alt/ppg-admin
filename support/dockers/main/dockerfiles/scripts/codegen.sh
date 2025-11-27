#!/bin/bash

echo "************************************************"
echo "OAS Client Codegen"
echo "************************************************"

cd /root/web
npm install

npx oas-client codegen
