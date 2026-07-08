import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  return res.json({
    success: true,
    message: "Custom route is healthy"
  });
}


