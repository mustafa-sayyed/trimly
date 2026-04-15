FROM node:22-alpine AS build

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN corepack enable

RUN pnpm install

COPY . .

RUN pnpm prisma generate --schema=/app/prisma/schema.prisma
RUN pnpm build

FROM node:22-alpine AS production

WORKDIR /app

COPY --from=build /app/dist /app/dist
COPY --from=build /app/package.json /app/pnpm-lock.yaml ./

RUN corepack enable
RUN pnpm install --prod

USER node

CMD [ "pnpm", "start" ]


