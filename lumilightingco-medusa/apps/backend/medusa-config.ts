import { loadEnv, defineConfig } from "@medusajs/framework/utils";

loadEnv(process.env.NODE_ENV || "development", process.cwd());

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    workerMode: (process.env.MEDUSA_WORKER_MODE as "shared" | "worker" | "server") || "shared",
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
    databaseDriverOptions:
      process.env.NODE_ENV === "production" &&
      !process.env.DATABASE_URL?.includes("sslmode=disable")
        ? {
            ssl: {
              rejectUnauthorized: false,
            },
          }
        : {
            ssl: false,
            sslmode: "disable",
          },
  },
  admin: {
    vite: (config) => {
      return {
        server: {
          host: "0.0.0.0",
          // Allow all hosts when running in Docker (development mode)
          // In production, this should be more restrictive
          allowedHosts: ["localhost", ".localhost", "127.0.0.1"],
          hmr: {
            // HMR websocket port inside container
            port: 5173,
            // Port browser connects to (exposed in docker-compose.yml)
            clientPort: 5174,
          },
        },
      };
    },
  },
  modules: [
    {
      resolve: "./src/modules/sanity",
      options: {
        api_token: process.env.SANITY_API_TOKEN,
        project_id: process.env.SANITY_PROJECT_ID,
        api_version: new Date().toISOString().split("T")[0],
        dataset: "production",
        studio_url:
          process.env.SANITY_STUDIO_URL || "http://localhost:8000/studio",
        type_map: {
          product: "product",
        },
      },
    },
    {
      resolve: "./src/modules/product-review",
    },
    {
      resolve: "./src/modules/quickbooks",
    },
    {
      resolve: "./src/modules/analytics",
    },
    {
      resolve: "./src/modules/meilisearch",
      options: {
        host: process.env.MEILISEARCH_HOST!,
        apiKey: process.env.MEILISEARCH_API_KEY!,
        productIndexName: process.env.MEILISEARCH_PRODUCT_INDEX_NAME!,
      },
    },
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          {
            resolve: "./src/modules/cloudinary-custom",
            id: "cloudinary",
            options: {
              apiKey: process.env.CLOUDINARY_API_KEY,
              apiSecret: process.env.CLOUDINARY_API_SECRET,
              cloudName: process.env.CLOUDINARY_CLOUD_NAME,
              folderName: "medusa",
              secure: true,
            },
          },
        ],
      },
    },
    {
      resolve: "./src/modules/invoice-generator",
    },
    {
      resolve: "./src/modules/quote",
    },
    {
      resolve: "./src/modules/restock",
    },
    {
      resolve: "@medusajs/medusa/notification",
      options: {
        providers: [
          // For debugging. To setup email Notification Module Providers
          // refer to this documentation: https://docs.medusajs.com/resources/architectural-modules/notification
          {
            resolve: "@medusajs/medusa/notification-local",
            id: "local",
            options: {
              channels: process.env.SENDGRID_API_KEY ? ["feed"] : ["email", "feed"],
            },
          },
          ...(process.env.SENDGRID_API_KEY ? [
            {
              resolve: "@medusajs/medusa/notification-sendgrid",
              id: "sendgrid",
              options: {
                channels: ["email"],
                api_key: process.env.SENDGRID_API_KEY,
                from: process.env.SENDGRID_FROM,
              },
            }
          ] : []),
        ],
      },
    },
    {
      resolve: "./src/modules/product-media",
    },
    {
      resolve: "./src/modules/wishlist",
    },
    ...(process.env.REDIS_URL
      ? [
          {
            resolve: "@medusajs/medusa/event-bus-redis",
            options: {
              redisUrl: process.env.REDIS_URL,
            },
          },
          {
            resolve: "@medusajs/medusa/cache-redis",
            options: {
              redisUrl: process.env.REDIS_URL,
            },
          },
        ]
      : []),
  ],
});

// Trigger reload 6
