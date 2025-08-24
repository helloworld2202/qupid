# Build stage
FROM node:20-alpine AS builder

# pnpm 설치
RUN corepack enable
RUN corepack prepare pnpm@10.15.0 --activate

WORKDIR /app

# 전체 프로젝트 복사 (모노레포 전체가 필요)
COPY . .

# 의존성 설치
RUN pnpm install --frozen-lockfile

# 전체 빌드 (올바른 순서로 자동 빌드)
RUN pnpm build

# Production stage
FROM node:20-alpine

RUN corepack enable
RUN corepack prepare pnpm@10.15.0 --activate

WORKDIR /app

# 전체 프로젝트 복사 (빌드된 상태)
COPY --from=builder /app .

# Production 의존성만 재설치
RUN pnpm install --prod --frozen-lockfile

# 환경 변수 설정
ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

CMD ["node", "apps/api/dist/server.js"]