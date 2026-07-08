import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { linkSalesChannelsToStockLocationWorkflow } from "@medusajs/medusa/core-flows";

export default async function linkSalesChannelLocationLoader(container: MedusaContainer) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  try {
    logger.info("Running custom loader to link all sales channels to all stock locations...");

    // 1. Fetch all sales channels
    const { data: salesChannels } = await query.graph({
      entity: "sales_channel",
      fields: ["id", "name"],
    });

    // 2. Fetch all stock locations
    const { data: stockLocations } = await query.graph({
      entity: "stock_location",
      fields: ["id", "name"],
    });

    logger.info(`Found ${salesChannels.length} sales channels and ${stockLocations.length} stock locations.`);

    // 3. Link each stock location to all sales channels
    for (const location of stockLocations) {
      const channelIds = salesChannels.map(sc => sc.id);
      if (channelIds.length > 0) {
        logger.info(`Linking stock location ${location.name} (${location.id}) to sales channels: ${channelIds.join(", ")}`);
        await linkSalesChannelsToStockLocationWorkflow(container).run({
          input: {
            id: location.id,
            add: channelIds,
          },
        });
      }
    }
    
    logger.info("Successfully finished linking all sales channels to all stock locations.");
  } catch (err) {
    logger.error("Failed to run linkSalesChannelLocationLoader: " + (err instanceof Error ? err.message : String(err)));
  }
}
