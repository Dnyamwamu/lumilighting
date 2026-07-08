import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";

export default async function syncAnalyticsSubscriber({
  container,
}: SubscriberArgs<any>) {
  try {
    const analyticsService = container.resolve("analytics") as any;
    await analyticsService.syncAnalytics();
  } catch (error) {
    console.error("Failed to run analytics sync in subscriber:", error);
  }
}

export const config: SubscriberConfig = {
  event: [
    "order.placed",
    "order.completed",
    "order.refunded",
    "product.created",
    "product.updated",
    "product.deleted",
    "customer.created",
  ],
};
