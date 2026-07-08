import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: 0.1, // Capture 10% of transactions for performance monitoring

  // Session Replay
  replaysSessionSampleRate: 0.0, // Don't record replays on successful sessions
  replaysOnErrorSampleRate: 1.0, // Record 100% of sessions that experience an error
})
