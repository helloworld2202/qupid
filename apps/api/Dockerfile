# Build stage
FROM node:20-alpine AS builder

# pnpm 설치
RUN corepack enable
RUN corepack prepare pnpm@10.15.0 --activate

WORKDIR /app

# 의존성 파일 복사
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY package.json ./

# 패키지별 package.json 복사
COPY packages/core/package.json ./packages/core/
COPY packages/config/package.json ./packages/config/
COPY apps/api/package.json ./apps/api/

# 의존성 설치
RUN pnpm install --frozen-lockfile

# 소스 코드 복사
COPY packages ./packages
COPY apps/api ./apps/api

# 빌드
RUN pnpm --filter @qupid/api build

# Production stage
FROM node:20-alpine

RUN corepack enable
RUN corepack prepare pnpm@10.15.0 --activate

WORKDIR /app

# 빌드된 파일 복사
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages

# 환경 변수 설정
ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

CMD ["node", "dist/server.js"]