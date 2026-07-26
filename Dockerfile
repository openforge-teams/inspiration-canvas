# ==========================================
# Stage 1: Build
# ==========================================
FROM node:22-alpine AS builder

RUN corepack enable
WORKDIR /app

# 先复制依赖声明文件，利用 Docker 缓存层
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/shared/package.json packages/shared/
COPY apps/web/package.json apps/web/
COPY apps/server/package.json apps/server/

# 安装依赖（允许构建脚本执行 esbuild 等原生二进制）
RUN pnpm install 2>/dev/null

# 复制源代码和配置
COPY tsconfig.base.json ./
COPY packages/shared/ packages/shared/
COPY apps/web/ apps/web/
COPY apps/server/ apps/server/

# 构建
RUN pnpm build:web && pnpm build:server

# ==========================================
# Stage 2: Production
# ==========================================
FROM node:22-alpine

WORKDIR /app

# 安装 nginx
RUN apk add --no-cache nginx

# 复制后端产物和运行时依赖
COPY --from=builder /app/apps/server/dist/ ./server/
COPY --from=builder /app/node_modules/ ./node_modules/
COPY --from=builder /app/apps/server/node_modules/ ./server/node_modules/

# 复制前端构建产物
COPY --from=builder /app/apps/web/dist/ ./web/dist/

# nginx 配置
COPY docker/nginx.conf /etc/nginx/http.d/default.conf

# 启动脚本
COPY docker/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

ENV PORT=3001
ENV NODE_ENV=production

CMD ["/docker-entrypoint.sh"]
