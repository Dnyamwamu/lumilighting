#!/bin/sh

# If a custom shell command is provided that is not a Medusa startup command, run it directly.
if [ $# -gt 0 ] && [ "$1" != "start" ] && [ "$1" != "--worker" ] && [ "$1" != "pnpm" ]; then
  echo "Executing custom command: $@"
  exec "$@"
fi

cd /server/apps/backend

# Extract DB host and port from DATABASE_URL if present, otherwise default to postgres:5432
DB_HOST="postgres"
DB_PORT="5432"

if [ -n "$DATABASE_URL" ]; then
  # Strip protocol portion (e.g. postgres://)
  DB_URL_NO_PROTO=${DATABASE_URL#*//}
  # Strip credentials up to the last @ if present
  case "$DB_URL_NO_PROTO" in
    *@*) DB_URL_NO_PROTO=${DB_URL_NO_PROTO##*@} ;;
  esac
  # Extract host and port
  DB_HOST_PORT=${DB_URL_NO_PROTO%%/*}
  # Extract host
  DB_HOST_TEMP=${DB_HOST_PORT%:*}
  if [ -n "$DB_HOST_TEMP" ] && [ "$DB_HOST_TEMP" != "$DATABASE_URL" ]; then
    DB_HOST=$DB_HOST_TEMP
    # Extract port if present
    DB_PORT_TEMP=${DB_HOST_PORT#*:}
    if [ "$DB_PORT_TEMP" != "$DB_HOST_PORT" ] && [ -n "$DB_PORT_TEMP" ]; then
      DB_PORT=$DB_PORT_TEMP
    fi
  fi
fi

echo "Waiting for database ($DB_HOST:$DB_PORT) to be ready..."
while ! nc -z "$DB_HOST" "$DB_PORT"; do
  sleep 1
done
echo "Database is ready!"

# Detect if this is a worker node
IS_WORKER=false
for arg in "$@"; do
  if [ "$arg" = "--worker" ]; then
    IS_WORKER=true
  fi
done

if [ "$IS_WORKER" = "true" ]; then
  echo "Worker node detected. Skipping database migrations."
else
  echo "Running database migrations..."
  pnpm medusa db:migrate
fi

if [ "$NODE_ENV" = "production" ]; then
  if [ "$IS_WORKER" = "true" ]; then
    echo "Starting Medusa production worker..."
    exec pnpm start --worker
  else
    echo "Starting Medusa production server..."
    exec pnpm start
  fi
else
  echo "Starting Medusa development server..."
  exec pnpm dev
fi