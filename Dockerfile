# 基礎階段
FROM node:18-alpine AS base

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

# 構建應用
ARG NEXT_PUBLIC_API_URL=https://api.isafe.org.tw
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ARG API=http://frontend:8080
ENV API=${API}
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
