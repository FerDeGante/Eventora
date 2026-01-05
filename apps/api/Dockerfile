# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=20

FROM node:${NODE_VERSION}-alpine AS deps
WORKDIR /app
ENV NODE_ENV=development
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm install

FROM node:${NODE_VERSION}-alpine AS builder
WORKDIR /app
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./
COPY --from=deps /app/package-lock.json ./
COPY --from=deps /app/apps ./apps
COPY prisma prisma
COPY docs docs
COPY audit audit
RUN npm run build:api

FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY prisma prisma
RUN npm prune --omit=dev
EXPOSE 4000
CMD ["npm","run","start:api"]
