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
docker compose --env-file ./lumilightingco/.env.production -f docker-compose.prod.yml build storefront

echo "🏗️ Building Medusa backend containers..."
docker compose --env-file ./lumilightingco/.env.production -f docker-compose.prod.yml build --no-cache --progress=plain medusa-api
docker compose --env-file ./lumilightingco/.env.production -f docker-compose.prod.yml build --no-cache --progress=plain medusa-worker
docker compose --env-file ./lumilightingco/.env.production -f docker-compose.prod.yml build --no-cache --progress=plain admin-dashboard

# 3. Start/Update containers
echo "🌐 Checking external network dependency..."
docker network inspect web_proxy >/dev/null 2>&1 || {
  echo "🌐 Creating external network 'web_proxy'..."
  docker network create web_proxy
}

echo "🚀 Starting updated production containers..."
docker compose --env-file ./lumilightingco/.env.production -f docker-compose.prod.yml up -d --remove-orphans

# 4. Post-Deployment Resource Cleanup
echo "🧹 Cleaning up unused build cache & dangling images..."
docker image prune -f
docker builder prune -f --until=24h

echo "📊 Current Docker Disk Usage:"
docker system df

echo "=========================================="
echo "✅ LUMI Deployment completed successfully!"
echo "=========================================="
