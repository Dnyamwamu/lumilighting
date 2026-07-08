import { MedusaRequest, MedusaResponse } from "@medusajs/framework";

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const analyticsService = req.scope.resolve("analytics") as any;
  const { merchantRequestId, checkoutRequestId, amount, phoneNumber, cartId, orderId } = req.body as any;

  if (!merchantRequestId || !checkoutRequestId || !amount || !phoneNumber) {
    return res.status(400).json({
      error: "Missing required fields: merchantRequestId, checkoutRequestId, amount, phoneNumber"
    });
  }

  try {
    const transaction = await analyticsService.createMpesaTransactions({
      id: checkoutRequestId, // Use checkoutRequestId as unique ID
      merchant_request_id: merchantRequestId,
      checkout_request_id: checkoutRequestId,
      amount: parseFloat(amount),
      phone_number: phoneNumber,
      status: "pending",
      cart_id: cartId || null,
      order_id: orderId || null
    });

    return res.json({
      success: true,
      transaction
    });
  } catch (error: any) {
    console.error("Failed to log M-Pesa transaction:", error);
    return res.status(500).json({
      error: error.message || error
    });
  }
};

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const analyticsService = req.scope.resolve("analytics") as any;
  const { checkout_request_id, cart_id } = req.query as any;

  try {
    const filter: any = {};
    if (checkout_request_id) {
      filter.checkout_request_id = checkout_request_id;
    }
    if (cart_id) {
      filter.cart_id = cart_id;
    }

    if (Object.keys(filter).length === 0) {
      return res.status(400).json({
        error: "Query parameter checkout_request_id or cart_id is required"
      });
    }

    const transactions = await analyticsService.listMpesaTransactions(filter);
    if (transactions.length === 0) {
      return res.status(404).json({
        error: "Transaction not found"
      });
    }

    return res.json({
      success: true,
      transaction: transactions[0]
    });
  } catch (error: any) {
    return res.status(500).json({
      error: error.message || error
    });
  }
};

