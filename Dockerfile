FROM oven/bun:1-debian AS base
WORKDIR /app

FROM base AS deps
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

FROM base
COPY --from=deps /app/node_modules node_modules
COPY . .

ENV NODE_ENV=production
EXPOSE 4000

CMD ["bun", "run", "src/index.ts"]
