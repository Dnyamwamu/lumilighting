import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { syncOrderToQuickBooksWorkflow } from "../../../../workflows/quickbooks/sync-order";

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { order_id } = req.body as { order_id: string };

  if (!order_id) {
    return res.status(400).json({
      message: "Missing order_id in request body",
    });
  }

  try {
    const { result, transaction } = await syncOrderToQuickBooksWorkflow(req.scope).run({
      input: {
        orderId: order_id,
      },
    });

    return res.json({
      message: "Sync workflow executed successfully",
      result,
      transaction_id: transaction.transactionId,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Sync workflow execution failed",
      error: error.message || error,
    });
  }
};
