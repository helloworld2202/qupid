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
COPY packages/ui/package.json ./packages/ui/
COPY packages/config/package.json ./packages/config/
COPY apps/api/package.json ./apps/api/

# 의존성 설치
RUN pnpm install --frozen-lockfile

# 소스 코드 복사
COPY packages ./packages
COPY apps/api ./apps/api

# tsconfig 파일들 복사
COPY tsconfig.json ./

# 빌드 - 패키지 먼저, 그 다음 API
RUN pnpm --filter @qupid/core build
RUN pnpm --filter @qupid/ui build
RUN pnpm --filter @qupid/config build
RUN pnpm --filter @qupid/api build

# Production stage
FROM node:20-alpine

RUN corepack enable
RUN corepack prepare pnpm@10.15.0 --activate

WORKDIR /app

# 모노레포 구조 복사
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/pnpm-lock.yaml ./

# 빌드된 패키지들 복사
COPY --from=builder /app/packages/core/dist ./packages/core/dist
COPY --from=builder /app/packages/core/package.json ./packages/core/
COPY --from=builder /app/packages/ui/dist ./packages/ui/dist
COPY --from=builder /app/packages/ui/package.json ./packages/ui/
COPY --from=builder /app/packages/config/dist ./packages/config/dist
COPY --from=builder /app/packages/config/package.json ./packages/config/

# API 빌드 파일 복사
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/

# node_modules 복사
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/core/node_modules ./packages/core/node_modules
COPY --from=builder /app/packages/ui/node_modules ./packages/ui/node_modules
COPY --from=builder /app/packages/config/node_modules ./packages/config/node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules

# 환경 변수 설정
ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

CMD ["node", "apps/api/dist/server.js"]