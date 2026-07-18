import type { NextConfig } from "next"
import { withSentryConfig } from "@sentry/nextjs"

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    // We run type checking separately in the pipeline
    ignoreBuildErrors: true,
  },
  experimental: {
    webpackBuildWorker: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/medusa/:path*",
        destination: `${process.env.MEDUSA_BACKEND_URL || "http://localhost:9001"}/:path*`,
      },
    ]
  },
}

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "dennis-nyamwamu",

  project: "lumilighting-storefront",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,

  // Tree-shaking options for reducing bundle size
  bundleSizeOptimizations: {
    // Automatically tree-shake Sentry logger statements to reduce bundle size
    excludeDebugStatements: true,
  },

  // Prevent build failure when SENTRY_AUTH_TOKEN is missing (e.g. during Docker builds)
  errorHandler: (err: unknown) => {
    console.warn("Sentry CLI Plugin failed, continuing build:", err);
  },
})
