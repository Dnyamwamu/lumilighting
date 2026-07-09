#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "=========================================="
echo "🚀 Starting LUMI Production Deployment"
echo "=========================================="

# 1. Pull the latest code from Git
echo "📥 Pulling latest code from GitHub..."
git pull origin main

# 2. Build production containers sequentially to prevent CPU/RAM exhaustion
echo "🏗️ Building storefront container..."
docker compose -f docker-compose.prod.yml build storefront

echo "🏗️ Building Medusa backend containers..."
docker compose -f docker-compose.prod.yml build medusa-api
docker compose -f docker-compose.prod.yml build medusa-worker

# 3. Start/Update containers
echo "🚀 Starting updated production containers..."
docker compose -f docker-compose.prod.yml up -d --remove-orphans

# 4. Run database migrations inside the Medusa container
# This ensures new schema changes are applied automatically without manual intervention.
echo "🔄 Running database migrations..."
docker compose -f docker-compose.prod.yml exec -T medusa-api pnpm --filter @dtc/backend exec medusa db:migrate

echo "=========================================="
echo "✅ LUMI Deployment completed successfully!"
echo "=========================================="
