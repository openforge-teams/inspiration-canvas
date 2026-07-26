#!/bin/sh
set -e

# 启动 Node.js 后端
node /app/server/index.js &

# 启动 nginx（前台运行）
nginx -g 'daemon off;'