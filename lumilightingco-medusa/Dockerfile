FROM node:20-alpine

WORKDIR /server

RUN npm install pnpm@10.11.1 -g

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json .npmrc ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/storefront/package.json ./apps/storefront/
COPY apps/admin-dashboard/package.json ./apps/admin-dashboard/

RUN pnpm install --no-frozen-lockfile

COPY . .

RUN pnpm --filter @dtc/backend build

EXPOSE 9000 5173 8000

ENTRYPOINT ["./start.sh"]