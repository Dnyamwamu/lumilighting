# LUMI Lighting. — Monorepo & E-Commerce Workspace

Welcome to the master repository workspace for **LUMI Lighting.**, a premium retail showroom and digital commerce platform specializing in high-end architectural lights, LED panels, chandeliers, floodlights, and smart electrical accessories.

This workspace houses both the decouple-first **Next.js storefront** and the **Medusa.js v2 core e-commerce backend**, orchestrating search indices, Clerk user sessions, Sanity CMS content, and Safaricom M-Pesa payment gateways.

---

## 🏗️ Architecture & Ecosystem

The system follows a headless, decoupled design where the user-facing storefront consumes services from separate CMS, commerce, and billing APIs:

```mermaid
graph TD
  User((Client Browser)) -->|React Server/Client| NextJS[Next.js 16 Storefront]
  CEO((CEO / Executive)) -->|Browser| Dashboard[Next.js Admin Dashboard]
  NextJS -->|GROQ Queries| Sanity[Sanity CMS]
  NextJS -->|REST API| Medusa[Medusa.js v2 Backend]
  NextJS -->|Daraja API| Mpesa[Safaricom M-Pesa Gateway]
  Dashboard -->|Direct SQL Query| Postgres[(PostgreSQL)]
  Dashboard -->|Reports API| QB[QuickBooks Online]
  Medusa -->|Database| Postgres
  Medusa -->|Queue/Cache| Redis[(Redis)]
  Medusa -->|Index Sync| Meilisearch[(Meilisearch)]
  Medusa -->|Uploads| Cloudinary[Cloudinary Media CDN]
  NextJS -->|Auth / Session| Clerk[Clerk Authentication]
```

### 1. Storefront (`/lumilightingco`)

- **Framework**: Next.js 16 (App Router) & TypeScript.
- **Styling**: Vanilla CSS, Tailwind CSS v4, and ShadCN UI tokens.
- **Client Auth**: Clerk (social login, secure customer profiles, checkout sessions).
- **CMS Integration**: Next-Sanity (GROQ fetching for dynamic home carousel, FAQs, company details, blogs).
- **Calculator Engine**: Interactive React utility evaluating room dimensions (length, width, ceiling height) and lighting styles to suggest recommended LED panels, bulbs, and total target Lux/Lumens.

### 2. E-Commerce Backend (`/lumilightingco-medusa/apps/backend`)

- **Framework**: Medusa.js v2 (modular microservices structure).
- **Database**: PostgreSQL (relational storage for products, orders, cart, regions).
- **Cache & PubSub**: Redis (queues, token exchange, event subscribers).
- **Search**: Meilisearch (high-speed search indexing).
- **File Storage**: Cloudinary (integrated via `@tsc_tech/medusa-plugin-cloudinary` provider).

### 3. Admin Analytics Dashboard (`/lumilightingco-medusa/apps/admin-dashboard`)

- **Framework**: Next.js 15 (App Router) & Tailwind CSS v4.
- **Data Integration**: Connects directly to the PostgreSQL database for sub-millisecond analytics data querying.
- **Key Modules**: Real-time sales trends, QuickBooks Online P&L and Balance Sheet reports, Safaricom M-Pesa gateway statistics, WhatsApp order lead clicks, and B2B contractor quotations tracker.

---

## 🔌 Service Ports Reference

Below is the port configuration mapping when running the stack locally:

| Service                       |          Local (Host) Port          | Container (Internal) Port | Type / Description                      |
| :---------------------------- | :---------------------------------: | :-----------------------: | :-------------------------------------- |
| **Next.js Storefront**        |               `3000`                |          `3000`           | Frontend web interface                  |
| **Admin Analytics Dashboard** |               `3001`                |          `3001`           | CEO / Executive Portal                  |
| **Medusa REST API**           |               `9001`                |          `9000`           | Commerce API backend                    |
| **Medusa Admin Dashboard**    |               `5174`                |          `5173`           | Vite-based admin portal                 |
| **Meilisearch API**           |               `7701`                |          `7700`           | Search indexing service                 |
| **PostgreSQL Database**       |               `5439`                |          `5432`           | Relational database storage             |
| **Redis Cache**               |               `6389`                |          `6379`           | Memory cache and queue worker           |
| **Sanity Content Studio**     | `3000/studio` (or `3333` local dev) |             —             | Embedded CMS editor (or standalone dev) |
| **Starter Storefront**        |               `8000`                |             —             | Secondary fallback storefront           |
| **Ngrok Tunnel Dashboard**    |               `4045`                |          `4040`           | Local tunnel monitor portal             |

---

## 🎯 Project Objectives

1. **Elite Visual Aesthetics**: Render a premium-feeling luxury showroom experience with smooth carousel transitions, glassmorphism UI, and custom typography.
2. **Dynamic Content Controls**: Empower non-technical administrators to manage landing banners, articles, FAQs, and blogs dynamically via the Sanity Studio dashboard.
3. **Frictionless Local Payments**: Simplify checkout for Kenyan customers with direct Safaricom M-Pesa STK Push prompts and automated callback order processing.
4. **Performant Scaling**: Offload media Delivery to Cloudinary CDN, search querying to Meilisearch, and page loading to Next.js static server rendering.

---

## 📂 Workspace Structure

```
/Users/dnyamwamu/projects/Clients/lumilightingco/
├── docker-compose.yml       # Unified orchestrator (Postgres, Redis, Backend, Storefront, Meilisearch)
├── README.md                # Workspace Master Documentation (This File)
├── lumilightingco/          # Next.js Frontend Repository
│   ├── app/                 # Next.js pages, API paths (stkpush, callback, quotes)
│   ├── components/          # Reusable UI parts (Calculator, Shop grid, layout)
│   ├── public/              # Local static media (lumi-poster1.jpeg, lumi-poster2.jpeg)
│   ├── sanity/              # Sanity schema configurations & client configuration
│   └── .env.local           # Storefront environment credentials
└── lumilightingco-medusa/   # Medusa v2 Backend Repository
    ├── apps/
    │   ├── admin-dashboard/ # Next.js CEO Dashboard, custom SVG charts, QuickBooks reports
    │   ├── backend/         # Medusa server, custom plugins, database migrations, analytics sync
    │   └── storefront/      # Secondary fallback/starter storefront
    └── pnpm-workspace.yaml  # Backend monorepo configuration
```

---

## 🛠️ Step-by-Step Installation & Setup

### Prerequisites

- Docker & Docker Compose installed.
- Node.js (v20 or newer).
- `pnpm` package manager: `npm install -g pnpm`.

---

### Method A: Single Command Run (Docker Compose)

A master Docker Compose orchestrator is located at the root of the workspace. It spins up the database, cache, search service, backend, and storefront in a single bridge network.

To build and run all services:

```bash
docker compose up --build
```

- **Next.js Storefront**: Accessible at [http://localhost:3000](http://localhost:3000)
- **Medusa Admin Dashboard**: Accessible at [http://localhost:9001/app](http://localhost:9001/app)
- **Meilisearch API**: Running at [http://localhost:7701](http://localhost:7701)

#### 📝 Seeding Products in Docker

After starting the Docker containers, you will need to seed the products, categories, and region configurations for Kenya:

```bash
docker exec -it lumi_backend pnpm run backend:seed
```

#### 📂 Seeding Nested Categories (Indoor, Outdoor, Commercial, Switches)

To seed the structured 3-level parent-child-grandchild category hierarchy, run:

```bash
docker exec -it lumi_backend pnpm run backend:seed:nested
```

This populates the catalog with the complete nested e-commerce category trees.

#### 🔑 Creating an Admin User in Docker

To log in to the Medusa Admin Dashboard (accessible at `http://localhost:9001/app`), run the following command to create your admin user:

```bash
docker exec -it lumi_backend pnpm --filter @dtc/backend exec medusa user -e admin@lumilighting.co.ke -p Lumilighting@123!
```

---

### Method B: Manual Local Setup

#### Step 1: Configure Environment Files

1. **Medusa Backend**:
   Create a `.env` file in `lumilightingco-medusa/apps/backend/.env`:

   ```env
   STORE_CORS=http://localhost:8000,http://localhost:3000,https://docs.medusajs.com
   ADMIN_CORS=http://localhost:5173,http://localhost:9000,https://docs.medusajs.com
   AUTH_CORS=http://localhost:5173,http://localhost:9000,https://docs.medusajs.com
   REDIS_URL=redis://localhost:6379
   JWT_SECRET=supersecret
   COOKIE_SECRET=supersecret
   DATABASE_URL=postgres://postgres:postgres@localhost:5439/medusa-store

   # Cloudinary Keys
   CLOUDINARY_CLOUD_NAME=dul9mjxed
   CLOUDINARY_API_KEY=137428427538582
   CLOUDINARY_API_SECRET=BHexOaz1Z1zf2wVmesX6Ys8btx8
   ```

2. **Next.js Storefront**:
   Create a `.env.local` file in `lumilightingco/.env.local`:

   ```env
   # Clerk Credentials
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ZnVua3ktY291Z2FyLTE1LmNsZXJrLmFjY291bnRzLmRldiQ
   CLERK_SECRET_KEY=sk_test_JsWT2mDl3lsiK7rxxYnvyrQMVLDgH36uew086RL3Ke

   # Sanity Settings
   NEXT_PUBLIC_SANITY_PROJECT_ID=0egqukia
   NEXT_PUBLIC_SANITY_DATASET=production

   # Medusa API Details
   MEDUSA_BACKEND_URL=http://localhost:9001
   NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9001
   NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_2057cfa2ae21763877eac38d2a967f140fe2a867030e9412ff47200320f0bab8

   # Search Indexing (Meilisearch)
   NEXT_PUBLIC_FEATURE_SEARCH_ENABLED=true
   NEXT_PUBLIC_SEARCH_ENDPOINT=http://localhost:7701
   NEXT_PUBLIC_SEARCH_API_KEY=your_meilisearch_key
   NEXT_PUBLIC_INDEX_NAME=products

   # Email Configuration (Titan SMTP)
   SMTP_HOST="smtp.titan.email"
   SMTP_PORT="465"
   SMTP_SECURE="true"
   SMTP_USER="info@lumilighting.co.ke"
   SMTP_PASSWORD="your_smtp_password"
   DEALER_EMAIL="info@lumilighting.co.ke"
   SMTP_FROM_EMAIL="Lumi Lighting <info@lumilighting.co.ke>"

   # Safaricom M-Pesa STK Push
   MPESA_ENVIRONMENT=sandbox
   MPESA_CONSUMER_KEY=your_mpesa_key
   MPESA_CONSUMER_SECRET=your_mpesa_secret
   MPESA_SHORTCODE=174379
   MPESA_PASSKEY=your_mpesa_passkey
   MPESA_CALLBACK_URL=https://your-public-tunnel.ngrok-free.app/api/mpesa/callback
   ```

#### Step 2: Spin up Database & Cache

In a terminal, start postgres and redis inside the backend repository:

```bash
cd lumilightingco-medusa
docker compose up -d postgres redis meilisearch
```

#### Step 3: Run Backend Migrations & Start Medusa

Install dependencies, run migrations, seed Kenya products, and boot up Medusa:

```bash
cd apps/backend
pnpm install
pnpm exec medusa db:migrate
pnpm exec medusa user -e admin@test.com -p supersecret # Add admin credentials
pnpm run seed # Seed products and region configurations
pnpm dev
```

#### Step 4: Access/Run Sanity Content Studio

Sanity Studio is embedded directly in the Next.js storefront application:

- **Via Docker / Dev Server**: When the storefront is running, simply access Sanity Studio at [http://localhost:3000/studio](http://localhost:3000/studio).
- **Standalone Development**: Alternatively, to run Sanity Studio on a separate port standalone:
  ```bash
  cd lumilightingco
  pnpm exec sanity dev
  ```
  This will launch the studio at [http://localhost:3333](http://localhost:3333).

#### Step 5: Start Storefront dev server

```bash
cd lumilightingco
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the storefront.

#### Step 6: Start Admin Analytics Dashboard

```bash
cd lumilightingco-medusa/apps/admin-dashboard
pnpm run dev
```

Open [http://localhost:3001](http://localhost:3001) to view the CEO Portal.

---

## ⚡ Key Integrations Deep Dive

### 1. Cloudinary Integration

Product images are configured to upload directly to Cloudinary instead of storing locally on the backend.

- **Provider Plugin**: Custom `cloudinary-custom` provider that decodes base64 upload requests from the admin UI to raw binary data before pushing to Cloudinary.
- **Module ID**: `"cloudinary"`
- **Vite/Next configs**: Allowed image domains include `res.cloudinary.com` to let Next.js render optimized images.

### 2. Safaricom M-Pesa STK Push Integration

M-Pesa payments are triggered directly from checkout and verified asynchronously using webhook callbacks.

#### 🛠️ Local Testing Setup with Ngrok Sidecar

We have integrated an automated `ngrok` sidecar tunnel into the Docker Compose setup to handle callback forwarding:

1. Register your test Safaricom phone number in the [Safaricom Developer Portal](https://developer.safaricom.co.ke/) under **Sandbox Test Credentials -> Mobile Numbers**.
2. Add your ngrok token to the root `.env` file:
   ```env
   NGROK_AUTHTOKEN=your_actual_token_here
   ```
3. Boot the stack: `docker compose up -d`.
4. Get your active public tunnel URL:
   - Visit the tunnel dashboard at `http://localhost:4045` or query:
     ```bash
     curl http://localhost:4045/api/tunnels
     ```
5. Set `MPESA_CALLBACK_URL=https://<your-tunnel-id>.ngrok-free.app/api/mpesa/callback` in `lumilightingco/.env.local` and restart the storefront: `docker compose restart storefront`.
6. Complete checkout selecting **Safaricom M-Pesa** with your whitelisted number.

### 3. QuickBooks Online ERP Integration

Designed and implemented a custom QuickBooks Online Plus integration for the Medusa v2 backend to synchronize customers, items, and completed orders automatically via events and workflows.

- **Module ID**: `"quickbooks"` (registers `QuickBooksModuleService` under `apps/backend/src/modules/quickbooks`).
- **OAuth API Flows**: Handles authentication and storage/refresh of tokens via `/admin/quickbooks/authorize` and callback endpoints.
- **Event-Driven Sync**: Listens to `order.placed` events to trigger `syncOrderToQuickBooksWorkflow` in the background, matching customer details and compiling sales receipts.
- **Database Schema**: Generates and manages token database tables. Run the following to update your schema:
  ```bash
  docker exec -it -w /server/apps/backend lumi_backend npx medusa db:generate quickbooks
  docker exec -it -w /server/apps/backend lumi_backend npx medusa db:migrate
  ```

### 4. Admin Analytics Dashboard & Warehouse

A custom real-time executive dashboard built in Next.js 15 that bypasses API overheads by querying a custom data warehouse schema inside the PostgreSQL database.

- **Real-Time Data Warehouse**: Composed of 6 reporting tables (`daily_sales`, `monthly_sales`, `product_sales`, `customer_metrics`, `inventory_metrics`, `mpesa_transaction`) generated using custom Mikro-ORM models in Medusa's `analytics` module.
- **Event-Driven Sync**: An event subscriber (`analytics-sync.ts`) listens to store lifecycle events (`order.placed`, `product.updated`, `customer.created`) and triggers SQL queries to aggregate raw Medusa records into the warehouse tables.
- **M-Pesa Gateway Logs**: Synchronizes Safaricom checkout request IDs, receipt numbers, amount, and success rate statistics (visible under the dashboard's gateway tab).
- **QuickBooks Reports**: Interacts with the `quickbooks_token` database table, performs silent token refreshes, and calls the QuickBooks Online Reports API to retrieve live Profit & Loss and Balance Sheet data.
- **B2B Inquiries & Leads**: Tracks storefront WhatsApp click conversions and contractor quotation requests (Approved vs Pending vs Rejected).
- **Custom Charts**: Zero-dependency SVG charts (Sales Trend line, Category Donut, M-Pesa Gateway donut, QuickBooks Profit & Loss bars) ensuring lightning-fast load times and type safety.

### 5. Clerk Authentication (Admin Dashboard & Storefront)

Clerk provides secure, production-ready user identity and session management for both customer accounts and administrative entry:

- **Admin Dashboard Route Protection**: Configured via `@clerk/nextjs` middleware (`middleware.ts`). All routes in `/apps/admin-dashboard` except `/sign-in` and `/sign-up` are strictly protected using the `auth.protect()` method.
- **Environment Variables**:
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Public API key for frontend components.
  - `CLERK_SECRET_KEY`: Private key for secure backend token verification.
  - `NEXT_PUBLIC_CLERK_SIGN_IN_URL` / `NEXT_PUBLIC_CLERK_SIGN_UP_URL`: Redirect handles for the customized authentication views.

### 6. Automated SMTP Email Notifications (Titan SMTP)

The e-commerce workspace handles automated transactional emails asynchronously using event subscribers:

- **Event-Driven Subscribers**: The Medusa backend registers event listeners under `src/subscribers/`:
  - `order-placed-email.ts` (listens to `order.placed` event)
  - `order-fulfillment-email.ts` (listens to `order.fulfillment_created` event)
  - `order-shipment-email.ts` (listens to `order.shipment_created` event)
- **Storefront Nodemailer Forwarding**: When triggered, subscribers fetch order and item data from the Medusa Graph and dispatch a POST request to the Next.js storefront API routes (`/api/email/order-confirmation`, `/api/email/fulfillment`, and `/api/email/shipment`).
- **SMTP Transport Layer**: The storefront routes invoke the `send*Email` methods inside `@/lib/email` utilizing `nodemailer` configured for **Titan SMTP** with variables:
  - `SMTP_HOST`: Host name (defaults to `smtp.titan.email`).
  - `SMTP_PORT`: Connection port (defaults to `465` with SSL).
  - `SMTP_USER` / `SMTP_PASSWORD`: Secure mail credentials.
  - `SMTP_FROM_EMAIL` / `DEALER_EMAIL`: Sender and copy-recipient addresses.

### 7. Custom Product Reviews & Ratings Engine

A modular, built-from-scratch review system linking customers to product entries:

- **Medusa Module (`product-review`)**: Registered in `medusa-config.ts` as `productReview` with database schema:
  - Table: `review` containing columns `id`, `title`, `content`, `rating` (real/numeric 1–5 range check), `first_name`, `last_name`, `status` (enum `pending`, `approved`, `rejected`), `product_id`, and `customer_id`.
  - Links: Linked directly to Medusa's product entry using a custom schema link `src/links/review-product.ts`.
- **Public Store Endpoints**:
  - `POST /store/reviews`: Submits a customer review (validated via `PostStoreReviewSchema` Zod validation). Newly submitted reviews default to `pending` status.
  - `GET /store/products/[id]/reviews`: Retrieves approved reviews for a given product ID alongside aggregate statistics like `average_rating`.
- **Admin Moderation Portal**: A custom admin route `/admin/routes/reviews/page.tsx` renders a data-table where administrators can select multiple pending reviews to bulk approve or reject via a request to `/admin/reviews/status`.

### 8. High-Speed Meilisearch Search & Query Syncing

Meilisearch provides fast search capabilities with clean React routing and state synchronization:

- **Meilisearch Module**: The backend features a custom `meilisearch` module querying Meilisearch instances. Products are automatically indexed or updated on product-related lifecycle events (`product.created`, `product.updated`, `product.deleted`).
- **Store Search API (`POST /store/products/search`)**: Proxies search queries from the storefront straight to the internal Meilisearch service, preventing API key exposure in the browser.
- **Aesthetic Search Interface**: Hitting the search pill or pressing `⌘K` / `Ctrl+K` opens a blurred, modern glassmorphism overlay modal. Text input is debounced to query `/store/products/search` dynamically, rendering live match cards. Hitting `Enter` redirects the user to the full shop page with URL parameters.
- **URL Parameter Sync & CSR Suspense**: The shop page (`/shop`) dynamically parses URL parameters like `?q=query` using `useSearchParams`. To avoid Next.js CSR bailout errors, the querying component `ShopContent` is isolated and wrapped within a React `<Suspense>` boundary. URL sync uses a direct-render state check pattern (rather than deferred `useEffect` blocks) to prevent cascading render warnings.

### 9. Premium Cookie Consent Banner & Privacy Preferences

The storefront features a custom-built, glassmorphic Cookie Consent Banner that complies with data privacy best practices:

- **UI Design**: A floating glassmorphic card (`bg-slate-950/90 backdrop-blur-md` with `border-slate-800`) positioned at the bottom right.
- **Preference Management**: Users can expand "Customize Settings" to review and toggle different cookie classifications:
  - _Essential Cookies_: Functional cookies like `_medusa_cart_id` (cart persistence) and Clerk authentication session cookies (always active).
  - _Performance & Analytics_: Toggleable tracking options for site analytics.
- **Persistence**: User preferences are saved in `localStorage` under the key `lumi_cookie_consent` to prevent the banner from showing on subsequent page visits.
- **Asynchronous Hydration**: React state updates are deferred asynchronously using event-loop timers to prevent server-side rendering (SSR) hydration mismatches and cascading render lint warnings.

---

## 🧪 Validation & Checks

To ensure code safety, typechecking is integrated across components. Run the following in the storefront root to verify type safety:

```bash
pnpm run typecheck
```

## Start

```bash
docker compose up -d
```

## Restart both front and back

```bash
docker compose up -d --build storefront && docker compose restart medusa
```

## Restart only front

```bash
docker compose restart storefront
```

## To force Docker to ignore the cache and rebuild the storefront with the updated code,

```bash
docker compose build --no-cache storefront
docker compose up -d storefront
```

## To force Docker to ignore the cache and rebuild the medusa with the updated code,

```bash
docker compose build --no-cache medusa
docker compose up -d medusa
```

## Restart only back

```bash
docker compose restart medusa
```

## Restart only admin dashboard

```bash
docker compose restart admin-dashboard
```

## Correct cleanup commands for your setup

1. Preview build cache
   docker buildx prune

2. Clean build cache (safe)
   docker buildx prune -a

3. Remove old containers
   docker rm -f lumi_postgres lumi_redis lumi_meilisearch lumi_storefront lumi_ngrok lumi_backend lumi_admin_dashboard

4. Remove old networks
   docker network rm lumi_network

5. Remove old volumes
   docker volume rm lumi_medusa_data
   docker volume rm lumi_meilisearch_data

6. Remove stopped containers
   docker container prune

# View the last 100 lines of logs for the Medusa backend container

docker compose logs medusa --tail 100

#### Database Reset Instructions.

1. Wipe all Docker volumes and stop the active containers:

   ```bash
   docker compose down -v
   ```

2. **Rebuild the containers from scratch**:

   ```bash
   docker compose up -d --build
   ```
