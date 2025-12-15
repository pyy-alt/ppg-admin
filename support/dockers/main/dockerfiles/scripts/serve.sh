#!/bin/bash

echo "************************************************"
echo "Serving in DEV Mode"
echo "************************************************"

cd /root/web
npm install

export NODE_OPTIONS=--openssl-legacy-provider


# --host 让 Vite 监听所有网络接口（0.0.0.0），而不仅仅是 localhost
# 这样宿主机才能通过 http://localhost:28102 访问
npm run dev -- --host
