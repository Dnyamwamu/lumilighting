import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export default async function check_order_graph({
  container,
}: {
  container: MedusaContainer;
}) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);

  logger.info("Fetching last order with all item fields...");

  const { data: orders } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "display_id",
      "email",
      "total",
      "currency_code",
      "metadata",
      "items.*",
      "customer.*"
    ],
    pagination: {
      take: 1,
      order: {
        created_at: "DESC"
      }
    }
  });

  if (orders && orders.length > 0) {
    logger.info("SUCCESS! Found order details:");
    console.log(JSON.stringify(orders[0], null, 2));
  } else {
    logger.info("No orders found in database.");
  }
}
