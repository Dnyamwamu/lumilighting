#!/bin/sh

if [ $# -gt 0 ]; then
  echo "Executing custom command: $@"
  exec "$@"
fi

cd /server/apps/backend

echo "Waiting for database (postgres:5432) to be ready..."
while ! nc -z postgres 5432; do
  sleep 1
done
echo "Database is ready!"

echo "Running database migrations..."
pnpm medusa db:migrate

# echo "Seeding database..."
# pnpm seed || echo "Seeding failed, continuing..."

echo "Starting Medusa development server..."
pnpm dev