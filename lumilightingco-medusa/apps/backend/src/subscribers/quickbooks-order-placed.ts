import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { syncOrderToQuickBooksWorkflow } from "../workflows/quickbooks/sync-order";

export default async function syncOrderToQuickBooks({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  await syncOrderToQuickBooksWorkflow(container).run({
    input: {
      orderId: data.id,
    },
  });
}

export const config: SubscriberConfig = {
  event: "order.placed",
};
