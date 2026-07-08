import * as Sentry from "@sentry/node";

export function register() {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 0.1, // Trace 10% of transactions
    });
    console.info("Sentry initialized successfully in Medusa Backend via instrumentation hook.");
  } else {
    console.info("Sentry disabled in Medusa Backend (SENTRY_DSN environment variable not set).");
  }
}