# LUMI Lighting — Production Deployment & Setup Guidelines

This document provides comprehensive guidelines for deploying the **LUMI Lighting** e-commerce ecosystem to production. It covers the setup, configuration, security, and optimization of the Next.js storefront, Medusa v2 backend, Admin Analytics Dashboard, database, caching, search indices, and payment gateways.

---

## 🏗️ Production Architecture Overview

In production, the local development components (like the Ngrok sidecar) are replaced with secure, managed cloud services:

```mermaid
graph TD
  User((Client Browser)) -->|HTTPS| CDN[Edge CDN / Vercel]
  CEO((CEO / Executive)) -->|HTTPS| AdminDash[Admin Analytics Dashboard]
  CDN -->|Next.js App Router| Storefront[Storefront Production Instance]
  Storefront -->|Auth Validation| Clerk[Clerk Production Auth]
  Storefront -->|Read Queries| Sanity[Sanity CMS Production]
  Storefront -->|M-Pesa STK Push| Safaricom[Safaricom Daraja API Production]

  Storefront -->|REST API calls| LB[Application Load Balancer]
  LB -->|API Route Requests| MedusaAPI[Medusa v2 API Nodes]

  MedusaAPI -->|Read/Write| PostgresPool[PostgreSQL Connection Pool / PgBouncer]
  PostgresPool -->|Primary DB| RDS[(Managed PostgreSQL - e.g., AWS RDS / Neon)]

  MedusaAPI -->|PubSub / Queue Jobs| Redis[(Managed Redis - e.g., Upstash / ElastiCache)]
  Redis -->|Background Processing| MedusaWorker[Medusa v2 Worker Nodes]

  MedusaAPI -->|Push Index| Meilisearch[(Meilisearch Cloud / Secure Instance)]
  Storefront -->|Scoped Search Key| Meilisearch

  MedusaAPI -->|Upload Media| Cloudinary[Cloudinary Production CDN]
  AdminDash -->|Direct SQL Query| RDS
  AdminDash -->|OAuth Reports| QB[QuickBooks Online Production]
```

---

## 🔒 1. Medusa v2 Backend Production Setup

The Medusa backend is a modular node application. In production, we separate the API nodes from the worker nodes for horizontal scalability.

### A. Environment Configuration (`.env.production`)

Create a secure environment file on your production host or hosting platform:

```env
# Node Environment
NODE_ENV=production

# Server Configuration
PORT=9000
STORE_CORS=https://lumilighting.co.ke,https://www.lumilighting.co.ke
ADMIN_CORS=https://admin.lumilighting.co.ke,https://dashboard.lumilighting.co.ke,https://api.lumilighting.co.ke
AUTH_CORS=https://admin.lumilighting.co.ke,https://dashboard.lumilighting.co.ke,https://api.lumilighting.co.ke

# Database Configuration (Always use SSL in production)
DATABASE_URL=postgres://<username>:<password>@<host>:<port>/<db_name>?sslmode=require
# If using PgBouncer/connection pooling:
# DATABASE_URL=postgres://<username>:<password>@<bouncer_host>:<port>/<db_name>?sslmode=require&pgbouncer=true

# Redis Configuration (For event processing and job queues)
REDIS_URL=rediss://default:<redis_password>@<redis_host>:<redis_port>

# Core Security Secrets (Generate using openssl rand -base64 32)
JWT_SECRET=prod_jwt_secret_here
COOKIE_SECRET=prod_cookie_secret_here

# Cloudinary Integration (Ensure production buckets/folders are configured)
CLOUDINARY_CLOUD_NAME=prod_cloud_name
CLOUDINARY_API_KEY=prod_api_key
CLOUDINARY_API_SECRET=prod_api_secret

# QuickBooks Online Production Credentials
QB_CLIENT_ID=prod_quickbooks_client_id
QB_CLIENT_SECRET=prod_quickbooks_client_secret
QB_REDIRECT_URI=https://api.lumilighting.co.ke/admin/quickbooks/callback
```

### B. Database Migration & Initialization

Always run database migrations in the release phase before traffic hits the container:

```bash
# Apply migrations
pnpm --filter @dtc/backend exec medusa db:migrate

# Update QuickBooks integration database tables
pnpm --filter @dtc/backend exec medusa db:generate quickbooks
pnpm --filter @dtc/backend exec medusa db:migrate
```

### C. Scaling API vs Worker

In production, run Medusa in two separate instances/containers:

1. **API Server**: Handles HTTP request routing. Run with:
   ```bash
   MEDUSA_WORKER_MODE=server pnpm --filter @dtc/backend exec medusa start
   ```
2. **Worker Server**: Handles event subscribers, email dispatching, QuickBooks syncs, and search index pushes. Run with:
   ```bash
   MEDUSA_WORKER_MODE=worker pnpm --filter @dtc/backend exec medusa start
   ```

---

## 🌐 2. Next.js Storefront Production Setup

The storefront should be deployed to a high-availability CDN/hosting platform like Vercel or AWS Amplify.

### A. Environment Configuration (`.env.production`)

Configure the following environment variables in your hosting provider's dashboard:

```env
# Next.js Server Configurations
PORT=3010
NODE_ENV=production

# Medusa API Routing (Point to your production load balancer or domain)
MEDUSA_BACKEND_URL=https://api.lumilighting.co.ke
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.lumilighting.co.ke
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_prod_your_publishable_key_here

# Clerk Production Credentials
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_clerk_publishable_key
CLERK_SECRET_KEY=sk_live_your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Sanity CMS Production Credentials
NEXT_PUBLIC_SANITY_PROJECT_ID=0egqukia
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_READ_TOKEN=your_sanity_read_token # Required for secure static builds / previews

# Meilisearch Production Search
NEXT_PUBLIC_FEATURE_SEARCH_ENABLED=true
NEXT_PUBLIC_SEARCH_ENDPOINT=https://search.lumilighting.co.ke
# IMPORTANT: Use a scoped public search key, NEVER your master key!
NEXT_PUBLIC_SEARCH_API_KEY=your_scoped_search_only_api_key
NEXT_PUBLIC_INDEX_NAME=products

# Titan SMTP Configuration (Email Notification)
SMTP_HOST=smtp.titan.email
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=info@lumilighting.co.ke
SMTP_PASSWORD=prod_smtp_password
DEALER_EMAIL=info@lumilighting.co.ke
SMTP_FROM_EMAIL=Lumi Lighting <info@lumilighting.co.ke>

# Safaricom M-Pesa Production Credentials
MPESA_ENVIRONMENT=production
MPESA_CONSUMER_KEY=live_consumer_key
MPESA_CONSUMER_SECRET=live_consumer_secret
MPESA_SHORTCODE=your_live_paybill_or_till_number
MPESA_PASSKEY=live_passkey_for_stk_push
# Must be HTTPS and accessible to Safaricom's gateway IPs
MPESA_CALLBACK_URL=https://lumilighting.co.ke/api/mpesa/callback
```

### B. Clerk Domain & Redirect Configurations

1. Go to the **Clerk Dashboard -> Paths**.
2. Change the application type to **Production**.
3. Set your production domain: `lumilighting.co.ke`.
4. Add DNS records (CNAME) generated by Clerk for SSL and session cookie sync across subdomains.

---

## 📈 3. Admin Analytics Dashboard (CEO Portal) Setup

The CEO portal runs on a separate Next.js instance, querying data directly from the Medusa PostgreSQL database.

### A. Environment Configuration (`.env.production`)

```env
PORT=3001
NODE_ENV=production
HOSTNAME=0.0.0.0

# Direct access to primary/replica database
DATABASE_URL=postgres://<username>:<password>@<db_host>:<port>/<db_name>?sslmode=require

# Clerk Authorization Configurations (Must match Clerk Admin group configurations)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_clerk_publishable_key
CLERK_SECRET_KEY=sk_live_your_clerk_secret_key
```

### B. Analytics Warehouse Synchronization

Ensure that event subscribers are running on the Medusa worker node. On any storefront action (`order.placed`, `product.updated`), the subscriber updates reporting tables in PostgreSQL:

- `daily_sales`
- `monthly_sales`
- `product_sales`
- `customer_metrics`
- `inventory_metrics`
- `mpesa_transaction`

Verify that the database user configured in the Analytics Dashboard has read/write permissions for these custom analytics tables.

---

## 💳 4. Safaricom M-Pesa (Daraja API) Production Transition

Transitioning M-Pesa STK Push from the developer Sandbox to Production requires strict coordination with Safaricom.

```mermaid
sequenceDiagram
  autonumber
  participant Customer as Client Browser
  participant Store as Next.js Storefront API
  participant Safaricom as Safaricom Production API
  participant Phone as Customer Mobile Phone

  Customer->>Store: Initiate Checkout (M-Pesa Number)
  Store->>Safaricom: Secure POST /stkpush (OAuth + Passkey)
  Safaricom-->>Store: Response 200 (MerchantRequestID, CheckoutRequestID)
  Safaricom->>Phone: STK Push PIN Prompt
  Phone->>Safaricom: User inputs PIN & approves
  Safaricom->>Store: Async POST /api/mpesa/callback (HTTPS + JSON Payload)
  Store->>Store: Verify signature, amount & update Cart status
  Store-->>Customer: Order Completed Page
```

### Step-by-Step Transition Plan

1. **Obtain M-Pesa Merchant Credentials**:
   - Get your Safaricom Paybill Number or Till Number.
   - Create an Organization Account on the [Safaricom Partner Portal](https://org.safaricom.co.ke/).
   - Create a Developer Account on the [Safaricom Developer Portal](https://developer.safaricom.co.ke/).

2. **Go Live on the Developer Portal**:
   - Navigate to **My Apps** in the Developer Portal.
   - Click **Go Live** and select the production package.
   - Enter your Organization Shortcode (Paybill/Till), Operator Username, and password.
   - Retrieve your **Live Consumer Key** and **Live Consumer Secret**.

3. **Get Live Passkey / Security Credentials**:
   - For C2B STK Push, you need the Passkey. Safaricom will send this to your registered primary email address upon successful validation of the "Go Live" request.
   - Alternatively, generate an **Initiator Security Credential** via the M-Pesa portal.

4. **Setup Secure Callback Endpoints**:
   - **HTTPS Requirement**: Safaricom _strictly_ requires callbacks to be delivered via HTTPS. SSL certificates must be valid (not self-signed).
   - **Port Requirements**: Ensure the storefront webhook port (`443`) is open on your firewall and does not block Safaricom IP ranges (Safaricom uses specific IP blocks to post webhook data).
   - Update the environment variable:
     `MPESA_CALLBACK_URL=https://lumilighting.co.ke/api/mpesa/callback`

---

## 🔍 5. Meilisearch Production Hardening

Meilisearch must be secured before exposing it on the public internet.

1. **Deploy Meilisearch**: Deploy Meilisearch on a secure virtual machine or use Meilisearch Cloud.
2. **Enable Production Mode**: Set `MEILI_ENV=production` inside Meilisearch environment variables.
3. **Configure Master Key**: Create a strong master key:
   ```bash
   MEILI_MASTER_KEY=your_extremely_strong_master_key
   ```
4. **Generate Public Scoped API Key**:
   Do _not_ expose the Master Key in the browser. Run this command on your backend server or locally to generate a search-only key:
   ```bash
   curl \
     -X POST 'https://search.lumilighting.co.ke/keys' \
     -H 'Authorization: Bearer your_extremely_strong_master_key' \
     -H 'Content-Type: application/json' \
     --data-raw '{
       "description": "Search-only key for Storefront",
       "actions": ["search"],
       "indexes": ["products"],
       "expiresAt": null
     }'
   ```
   Use the returned `key` value for `NEXT_PUBLIC_SEARCH_API_KEY` on the storefront.

---

## 🎨 6. Sanity CMS Production Config

1. Go to your [Sanity Manage Dashboard](https://www.sanity.io/manage).
2. Choose your project ID: `0egqukia`.
3. Navigate to **API settings -> CORS origins**.
4. Add your production domain:
   - `https://lumilighting.co.ke` (Allow credentials: Checked)
   - `https://www.lumilighting.co.ke` (Allow credentials: Checked)
5. Create a token with **Read** access and set it as `SANITY_API_READ_TOKEN` on the storefront server to fetch fresh content during build time.

---

## 🐳 7. Docker Production Compose Template

If hosting the backend, dashboard, database, and cache on a single virtual machine (e.g. AWS EC2, DigitalOcean Droplet), use this optimized `docker-compose.prod.yml` template:

```yaml
version: "3.8"

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: lumi_prod_postgres
    restart: always
    environment:
      POSTGRES_DB: medusa-store
      POSTGRES_USER: ${PROD_DB_USER:-lumi}
      POSTGRES_PASSWORD: ${PROD_DB_PASSWORD:-Lumilighting123!}
    ports:
      - "${PROD_DB_PORT:-5435}:5432"
    volumes:
      - postgres_prod_data:/var/lib/postgresql/data
    networks:
      - lumi_prod_network

  # Redis Cache & Queue
  redis:
    image: redis:7-alpine
    container_name: lumi_prod_redis
    restart: always
    command: redis-server --requirepass ${PROD_REDIS_PASSWORD:-LumiRedis123!}
    volumes:
      - redis_prod_data:/data
    networks:
      - lumi_prod_network

  # Medusa API Node
  medusa-api:
    build:
      context: ./lumilightingco-medusa
      dockerfile: Dockerfile
    container_name: lumi_prod_api
    restart: always
    depends_on:
      - postgres
      - redis
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgres://${PROD_DB_USER:-lumi}:${PROD_DB_PASSWORD:-Lumilighting123!}@postgres:5432/medusa-store?sslmode=disable
      - REDIS_URL=redis://default:${PROD_REDIS_PASSWORD:-LumiRedis123!}@redis:6379
    env_file:
      - ./lumilightingco-medusa/apps/backend/.env.production
    expose:
      - "9000"
    healthcheck:
      test: ["CMD", "nc", "-z", "localhost", "9000"]
      interval: 10s
      timeout: 10s
      retries: 20
      start_period: 300s
    networks:
      - lumi_prod_network
      - web_proxy

  # Medusa Worker Node
  medusa-worker:
    build:
      context: ./lumilightingco-medusa
      dockerfile: Dockerfile
    container_name: lumi_prod_worker
    restart: always
    depends_on:
      postgres:
        condition: service_started
      redis:
        condition: service_started
      medusa-api:
        condition: service_healthy
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgres://${PROD_DB_USER:-lumi}:${PROD_DB_PASSWORD:-Lumilighting123!}@postgres:5432/medusa-store?sslmode=disable
      - REDIS_URL=redis://default:${PROD_REDIS_PASSWORD:-LumiRedis123!}@redis:6379
    env_file:
      - ./lumilightingco-medusa/apps/backend/.env.production
    command: --worker
    networks:
      - lumi_prod_network

  # Next.js Storefront
  storefront:
    build:
      context: ./lumilightingco
      dockerfile: Dockerfile
      args:
        - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:-pk_live_placeholder}
        - CLERK_SECRET_KEY=${CLERK_SECRET_KEY:-sk_live_placeholder}
        - NEXT_PUBLIC_SANITY_DATASET=${NEXT_PUBLIC_SANITY_DATASET:-production}
        - NEXT_PUBLIC_SANITY_PROJECT_ID=${NEXT_PUBLIC_SANITY_PROJECT_ID:-0egqukia}
        - NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY:-pk_prod_placeholder}
        - NEXT_PUBLIC_MEDUSA_BACKEND_URL=${NEXT_PUBLIC_MEDUSA_BACKEND_URL:-https://api.lumilighting.co.ke}
        - MEDUSA_BACKEND_URL=${MEDUSA_BACKEND_URL:-http://lumi_prod_api:9000}
        - NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL:-https://lumilighting.co.ke}
        - NEXT_PUBLIC_DEFAULT_REGION=${NEXT_PUBLIC_DEFAULT_REGION:-ke}
        - NEXT_PUBLIC_SEARCH_ENDPOINT=${NEXT_PUBLIC_SEARCH_ENDPOINT:-https://search.lumilighting.co.ke}
        - NEXT_PUBLIC_SEARCH_API_KEY=${NEXT_PUBLIC_SEARCH_API_KEY:-your_scoped_search_only_api_key}
        - NEXT_PUBLIC_INDEX_NAME=${NEXT_PUBLIC_INDEX_NAME:-products}
        - NEXT_PUBLIC_SENTRY_DSN=${NEXT_PUBLIC_SENTRY_DSN:-https://8627c0a599066d97c041dafd2b5a588e@o4511094307749888.ingest.de.sentry.io/4511579456929872}
    container_name: lumi_prod_storefront
    restart: always
    depends_on:
      medusa-api:
        condition: service_healthy
    environment:
      - MEDUSA_BACKEND_URL=http://lumi_prod_api:9000
      - PORT=3010
    env_file:
      - ./lumilightingco/.env.production
    expose:
      - "3010"
    networks:
      - lumi_prod_network
      - web_proxy

volumes:
  postgres_prod_data:
  redis_prod_data:

networks:
  lumi_prod_network:
    driver: bridge
  web_proxy:
    external: true
```

---

## 🚀 8. Build, Deploy & Monitoring Checklists

### Automated Production Deployment

To deploy updates to the production server:

1. **SSH into the production server**:
   ```bash
   ssh user@your-server-ip
   ```
2. **Navigate to the project root directory**:
   ```bash
   cd /path/to/lumilightingco
   ```
3. **Execute the deployment script**:
   ```bash
   ./deploy.sh
   ```
   _(Note: The script automatically pulls the latest changes, builds the production containers, restarts them with minimal downtime, and applies Medusa database migrations.)_

### Build Commands (Manual)

Run clean builds before staging:

- **Next.js Storefront Build**:
  ```bash
  cd lumilightingco
  pnpm install
  pnpm run build
  ```
- **Medusa Backend Build**:
  ```bash
  cd lumilightingco-medusa/apps/backend
  pnpm install
  pnpm run build
  ```

### Active Performance & Error Logging (Sentry)

Ensure Sentry is monitoring client crash logs:

1. Verify the project has `@sentry/nextjs` installed.
2. Setup Sentry environment keys: `SENTRY_AUTH_TOKEN`, `NEXT_PUBLIC_SENTRY_DSN`.
3. Check storefront logs inside the Sentry Issue dashboard.

### SSL & Routing via Nginx Proxy Manager

Instead of deploying a separate Nginx container (which would conflict with the existing Nginx Proxy Manager running on the host), route all incoming traffic directly through your existing **Nginx Proxy Manager Admin Console** (port `81`).

#### 📋 Proxy Configurations Reference Table

Below is the configuration checklist for setting up the Proxy Hosts in the Nginx Proxy Manager Admin interface:

| Domain Name(s) | Scheme | Forward Hostname / IP | Forward Port | Key Options | SSL Setup |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `lumilighting.co.ke`<br>`www.lumilighting.co.ke` | `http` | `lumi_prod_storefront` | `3010` | • Block Common Exploits<br>• Websockets Support | • Request Let's Encrypt Certificate<br>• Force SSL<br>• HTTP/2 Support |
| `api.lumilighting.co.ke` | `http` | `lumi_prod_api` | `9000` | • Block Common Exploits<br>• Websockets Support | • Request Let's Encrypt Certificate<br>• Force SSL<br>• HTTP/2 Support |
| `admin.lumilighting.co.ke`<br>`dashboard.lumilighting.co.ke` | `http` | `lumi_prod_dashboard` | `3001` | • Block Common Exploits<br>• Websockets Support | • Request Let's Encrypt Certificate<br>• Force SSL<br>• HTTP/2 Support |
| `search.lumilighting.co.ke` | `http` | `lumi_prod_meilisearch` | `7700` | • Block Common Exploits | • Request Let's Encrypt Certificate<br>• Force SSL<br>• HTTP/2 Support |

> [!IMPORTANT]
> **Docker Network Hostname Resolution:**
> The forward hostnames listed above (`lumi_prod_storefront`, `lumi_prod_api`, etc.) assume that Nginx Proxy Manager is running in a Docker container attached to the same user-defined network (e.g., `web_proxy`).
> 
> If Nginx Proxy Manager is running directly on the host OS or in a different network environment, change the **Forward Hostname / IP** to the host loopback IP (`127.0.0.1` or the server's public IP) and ensure the corresponding ports (`3010`, `9000`, `3001`, `7700`) are mapped/bound to the host in `docker-compose.prod.yml`.

---

#### Step 1: Add a Proxy Host for the Storefront

1. Open Nginx Proxy Manager at `http://<YOUR_SERVER_IP>:81` and log in.
2. Go to **Proxy Hosts** -> **Add Proxy Host**.
3. Configure the **Details** tab:
   - **Domain Names:** `lumilighting.co.ke` and `www.lumilighting.co.ke`
   - **Scheme:** `http`
   - **Forward Hostname / IP:** `lumi_prod_storefront` (the container_name in `docker-compose.prod.yml`)
   - **Forward Port:** `3010`
   - Check **Block Common Exploits** and **Websockets Support**.
4. Configure the **SSL** tab:
   - Select **Request a new SSL Certificate**.
   - Check **Force SSL** and **HTTP/2 Support**.
   - Enter your email and agree to the terms.
5. Click **Save**.

#### Step 2: Add a Proxy Host for the Medusa API

1. Add a second Proxy Host:
   - **Domain Names:** `api.lumilighting.co.ke`
   - **Scheme:** `http`
   - **Forward Hostname / IP:** `lumi_prod_api` (the container_name in `docker-compose.prod.yml`)
   - **Forward Port:** `9000`
   - Check **Block Common Exploits** and **Websockets Support**.
2. Configure the **SSL** tab:
   - Select **Request a new SSL Certificate**.
   - Check **Force SSL** and **HTTP/2 Support**.
   - Enter your email and agree to the terms.
3. Click **Save**.

#### Step 3: Add a Proxy Host for the Admin Analytics Dashboard

1. Add a third Proxy Host:
   - **Domain Names:** `admin.lumilighting.co.ke` and `dashboard.lumilighting.co.ke`
   - **Scheme:** `http`
   - **Forward Hostname / IP:** `lumi_prod_dashboard`
   - **Forward Port:** `3001`
   - Check **Block Common Exploits** and **Websockets Support**.
2. Configure the **SSL** tab:
   - Select **Request a new SSL Certificate**.
   - Check **Force SSL** and **HTTP/2 Support**.
   - Enter your email and agree to the terms.
3. Click **Save**.

#### Step 4: Add a Proxy Host for the Meilisearch Service

1. Add a fourth Proxy Host:
   - **Domain Names:** `search.lumilighting.co.ke`
   - **Scheme:** `http`
   - **Forward Hostname / IP:** `lumi_prod_meilisearch`
   - **Forward Port:** `7700`
   - Check **Block Common Exploits**.
2. Configure the **SSL** tab:
   - Select **Request a new SSL Certificate**.
   - Check **Force SSL** and **HTTP/2 Support**.
   - Enter your email and agree to the terms.
3. Click **Save**.

_Note: Nginx Proxy Manager handles Let's Encrypt certificate renewals and Nginx configuration reloads dynamically, keeping the host ports `80` and `443` free from conflicts._

---

## 📦 9. Database Sync & Catalog Migration (Categories, Collections, Products)

When launching or syncing your production store catalog, you must migrate your categories, collections, and products. Due to constraints and relational dependencies in Medusa v2, we sync **Categories & Collections** via clean SQL imports and **Products** via standard CSV import.

### A. Migrating Categories & Collections (SQL Overwrite)
Categories have circular parent-child constraints, and collections are linked in several joints. The easiest and safest way to overwrite production categories and collections is by executing our pre-formatted SQL scripts (`categories.sql` and `collections.sql`) directly against the production database container.

These scripts automatically disable foreign-key checks temporarily, truncate/clear existing records, insert the data, and re-enable triggers.

On your production server:
```bash
# 1. Import Categories
docker exec -i lumi_prod_postgres psql -U ${PROD_DB_USER:-lumi} -d medusa-store < categories.sql

# 2. Import Collections
docker exec -i lumi_prod_postgres psql -U ${PROD_DB_USER:-lumi} -d medusa-store < collections.sql
```

*Note: If you ever need to regenerate these SQL dump files locally, run:*
```bash
docker exec -i lumi_postgres pg_dump -U lumi -d medusa-store -t product_category --data-only --inserts > categories.sql
docker exec -i lumi_postgres pg_dump -U lumi -d medusa-store -t product_collection --data-only --inserts > collections.sql
```

---

### B. Migrating Products (Standard CSV Import)
Products reside in over 15 database tables (variants, options, prices, images, etc.). We use Medusa's built-in Admin panel CSV importer because it correctly manages all related entities and maps them to your newly imported categories/collections.

1. **Export from Local**: Trigger the product export in the local Medusa Admin feed and download the CSV.
2. **Import to Production**: 
   - Open your production Medusa Admin dashboard (`http://localhost:9001/app/products` or via your proxy URL).
   - Go to **Products** and click **Import** in the top right.
   - Upload the local CSV file.

#### Overwriting vs. Creating New Products:
* **To Overwrite Existing Products**: Leave the `Product ID` and `Variant ID` columns intact in the CSV. Medusa will search for matching IDs in production and update them with the CSV values.
* **To Create New Products (No Overwrite)**: Delete the `Product ID` and `Variant ID` columns from the CSV. Ensure `Product Handles` and variant `SKUs` are unique (so they don't conflict with existing products).

---

### C. Alternative: Full Database Clone (Erase and Overwrite Everything)
If you want your production database to be a **100% exact copy** of your local environment (overwriting all products, categories, collections, users, settings, and orders), perform a full database dump and restore.

1. **Generate the dump locally**:
   ```bash
   docker exec -i lumi_postgres pg_dump -U lumi -d medusa-store > full_db.sql
   ```
2. **Restore on your production server**:
   ```bash
   # Drop and recreate the database to start fresh
   docker exec -i lumi_prod_postgres psql -U ${PROD_DB_USER:-lumi} -d postgres -c "DROP DATABASE \"medusa-store\";"
   docker exec -i lumi_prod_postgres psql -U ${PROD_DB_USER:-lumi} -d postgres -c "CREATE DATABASE \"medusa-store\";"

   # Restore the full dump
   docker exec -i lumi_prod_postgres psql -U ${PROD_DB_USER:-lumi} -d medusa-store < full_db.sql
   ```

---

## 💾 10. Automated Daily Database Backups (Cron Job)

To prevent data loss in production, we provide an automated daily database backup script ([backup-db.sh](file:///Users/dnyamwamu/projects/Clients/lumilightingco/backup-db.sh)). This script runs `pg_dump` inside the production Docker container, compresses it using gzip, saves it to the host, and rotates/deletes backups older than 7 days.

### A. Setup instructions on the production server:

1. **Upload the backup script** (`backup-db.sh`) to a directory on your server (e.g., `/home/ubuntu/scripts/backup-db.sh`).
2. **Make the script executable**:
   ```bash
   chmod +x /home/ubuntu/scripts/backup-db.sh
   ```
3. **Configure the Cron Job**:
   Open the crontab editor on your server:
   ```bash
   crontab -e
   ```
   Add the following line to run the backup daily at midnight (00:00) and redirect output to a log file:
   ```cron
   0 0 * * * /home/ubuntu/scripts/backup-db.sh >> /var/log/medusa-backup.log 2>&1
   ```

### B. Customizing Environment variables:
By default, the script stores backups in `/var/backups/medusa`. You can customize the storage path by prefixing the cron job command with `BACKUP_DIR`:
```cron
0 0 * * * BACKUP_DIR="/mnt/backups/db" /home/ubuntu/scripts/backup-db.sh >> /var/log/medusa-backup.log 2>&1
```
