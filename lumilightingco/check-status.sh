#!/bin/bash
cd /Users/dnyamwamu/projects/Clients/lumilightingco/lumilightingco-medusa
echo "=== Container Status ==="
docker compose ps
echo "=== Medusa Server Logs ==="
docker compose logs medusa --tail 30
