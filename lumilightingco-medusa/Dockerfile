FROM node:20-alpine

WORKDIR /server

RUN npm install pnpm@10.11.1 -g

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json .npmrc ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/storefront/package.json ./apps/storefront/
COPY apps/admin-dashboard/package.json ./apps/admin-dashboard/

RUN pnpm install --no-frozen-lockfile

COPY . .

ENV NODE_ENV=production

ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG CLERK_SECRET_KEY
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY \
    CLERK_SECRET_KEY=$CLERK_SECRET_KEY

ENV NODE_OPTIONS="--max-old-space-size=4096"

RUN pnpm --filter @dtc/backend build
RUN pnpm --filter admin-dashboard build

EXPOSE 9000 5173 8000 3001

ENTRYPOINT ["./start.sh"]