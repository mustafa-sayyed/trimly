FROM node:22-alpine AS base

WORKDIR /app

RUN corepack enable

FROM base AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY worker/package.json worker/package.json
COPY packages/config/package.json packages/config/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/logging/package.json packages/logging/package.json
COPY packages/queue/package.json packages/queue/package.json

RUN pnpm install --frozen-lockfile

FROM deps AS build

COPY . .

RUN pnpm --filter @packages/config build
RUN pnpm --filter @packages/db build
RUN pnpm --filter @packages/logging build
RUN pnpm --filter @packages/queue build
RUN pnpm --filter @trimly/worker build

FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY server/package.json server/package.json
COPY packages/config/package.json packages/config/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/logging/package.json packages/logging/package.json
COPY packages/queue/package.json packages/queue/package.json

COPY --from=build /app/worker/dist ./worker/dist
COPY --from=build /app/packages/config/dist ./packages/config/dist
COPY --from=build /app/packages/db/dist ./packages/db/dist
COPY --from=build /app/packages/db/generated ./packages/db/generated
COPY --from=build /app/packages/logging/dist ./packages/logging/dist
COPY --from=build /app/packages/queue/dist ./packages/queue/dist

RUN pnpm install --frozen-lockfile --prod

USER node

CMD ["pnpm", "--filter", "@trimly/worker", "start"]