import {
  SubscriberArgs,
  type SubscriberConfig,
} from "@medusajs/framework";

export default async function orderPlacedEmailHandler({ 
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger");
  const query = container.resolve("query");
  
  logger.info(`Sending order confirmation email for order: ${data.id}`);

  try {
    // Fetch order details including items and customer details
    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "email",
        "total",
        "currency_code",
        "created_at",
        "items.*",
      ],
      filters: {
        id: data.id,
      },
    });

    if (!orders || orders.length === 0) {
      logger.warn(`Order ${data.id} not found when trying to send confirmation email`);
      return;
    }

    const order = orders[0];

    if (!order.email) {
      logger.info(`No email address associated with order ${data.id}. Skipping email dispatch.`);
      return;
    }

    // Call Next.js storefront API to trigger nodemailer email sending
    const storefrontUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    logger.info(`Forwarding order data to storefront email API at: ${storefrontUrl}/api/email/order-confirmation`);

    const response = await fetch(`${storefrontUrl}/api/email/order-confirmation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(order),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`Storefront email endpoint failed (${response.status}): ${errorText}`);
    } else {
      logger.info(`Order confirmation email sent successfully for order ${data.id}`);
    }
  } catch (error) {
    logger.error(`Error processing order confirmation email subscriber for order ${data.id}:`, error);
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
};
