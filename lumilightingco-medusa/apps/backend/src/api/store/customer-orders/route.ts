import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const query = req.scope.resolve("query");
  const email = req.query.email as string;

  if (!email) {
    return res.status(400).json({ message: "Email query parameter is required" });
  }

  try {
    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "created_at",
        "total",
        "status",
        "payment_status",
        "currency_code",
        "shipping_address.id",
        "shipping_address.first_name",
        "shipping_address.last_name",
        "shipping_address.phone",
        "shipping_address.address_1",
        "shipping_address.address_2",
        "shipping_address.city",
        "shipping_address.country_code",
        "items.title",
        "items.quantity",
        "items.unit_price"
      ],
      filters: {
        email: email
      }
    });

    res.json({ orders });
  } catch (error: any) {
    res.status(500).json({ 
      message: "Failed to retrieve customer orders", 
      error: error.message || error 
    });
  }
}
