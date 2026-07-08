import { MedusaRequest, MedusaResponse } from "@medusajs/framework";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const pgConnection = req.scope.resolve("__pg_connection__");

  try {
    const products = await pgConnection.raw('SELECT * FROM "product";');
    return res.json({
      success: true,
      products: products.rows
    });
  } catch (error: any) {
    return res.json({
      success: false,
      error: error.message
    });
  }
};


