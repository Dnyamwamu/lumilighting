import { MedusaRequest, MedusaResponse } from "@medusajs/framework";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const pgConnection = req.scope.resolve("__pg_connection__");

  try {
    const publishableKeys = await pgConnection.raw(`
      SELECT * FROM "publishable_api_key" WHERE "deleted_at" IS NULL;
    `);

    return res.json({
      success: true,
      keys: publishableKeys.rows
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || error
    });
  }
};
