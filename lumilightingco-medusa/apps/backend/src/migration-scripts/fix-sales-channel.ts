import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export default async function fix_sales_channel({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const pgConnection = container.resolve("__pg_connection__");

  logger.info("Starting fix for sales channel sc_01KTXH31KY404EQAP0XXKY5WM4...");

  try {
    // 1. Undelete the old sales channel
    await pgConnection.raw(`
      UPDATE "sales_channel" 
      SET "deleted_at" = NULL 
      WHERE "id" = 'sc_01KTXH31KY404EQAP0XXKY5WM4';
    `);
    logger.info("Undeleted sales channel sc_01KTXH31KY404EQAP0XXKY5WM4.");

    // 2. Undelete its existing stock location links
    await pgConnection.raw(`
      UPDATE "sales_channel_stock_location" 
      SET "deleted_at" = NULL 
      WHERE "sales_channel_id" = 'sc_01KTXH31KY404EQAP0XXKY5WM4';
    `);
    logger.info("Undeleted stock location links for sc_01KTXH31KY404EQAP0XXKY5WM4.");

    // 3. Explicitly link it to the active showroom stock location if not already linked
    const activeLocationId = "sloc_01KVVXHZD0MCV8GMS83K22P8GH"; // LUMI Lighting Showroom
    
    // Generate a unique ID for the link
    const linkId = `scloc_fix_${Math.random().toString(36).substring(2, 9)}`;

    await pgConnection.raw(`
      INSERT INTO "sales_channel_stock_location" ("id", "sales_channel_id", "stock_location_id", "created_at", "updated_at", "deleted_at")
      SELECT '${linkId}', 'sc_01KTXH31KY404EQAP0XXKY5WM4', '${activeLocationId}', NOW(), NOW(), NULL
      WHERE NOT EXISTS (
        SELECT 1 FROM "sales_channel_stock_location" 
        WHERE "sales_channel_id" = 'sc_01KTXH31KY404EQAP0XXKY5WM4' 
        AND "stock_location_id" = '${activeLocationId}'
        AND "deleted_at" IS NULL
      );
    `);
    logger.info(`Ensured link exists between sc_01KTXH31KY404EQAP0XXKY5WM4 and stock location ${activeLocationId}.`);

    logger.info("Sales channel fix completed successfully!");
  } catch (error: any) {
    logger.error(`Failed to execute sales channel fix: ${error.message}`);
    throw error;
  }
}
