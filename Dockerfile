# 基礎階段
FROM node:24-alpine AS base

# 依賴階段
FROM base AS deps
WORKDIR /app

# 安裝依賴所需的額外套件
RUN apk add --no-cache libc6-compat

# 複製依賴文件
COPY package.json yarn.lock ./

# 安裝依賴（移除 --frozen-lockfile 標誌）
RUN yarn install

# 構建階段
FROM base AS builder
WORKDIR /app

# 複製依賴
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 加入 BASE_PATH 環境變數（如 /iskpi）
ARG BASE_PATH
ENV BASE_PATH=${BASE_PATH}
ARG NEXT_PUBLIC_BASE_PATH
ENV NEXT_PUBLIC_BASE_PATH=${NEXT_PUBLIC_BASE_PATH}

# 構建應用
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

ENV API=http://kpibackend:8080


# 接下來要在 yarn build 之前確保 .env.production 存在
RUN echo "NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH" >> .env.production && \
    echo "BASE_PATH=$BASE_PATH" >> .env.production
RUN yarn build

# 運行階段
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production


# 複製必要文件
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# 複製環境變數處理腳本
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh


# 設置容器配置
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 設置入口點和啟動命令
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["yarn", "start"]
