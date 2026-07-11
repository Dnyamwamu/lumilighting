import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { capturePaymentWorkflow } from "@medusajs/medusa/core-flows";

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const analyticsService = req.scope.resolve("analytics") as any;
  const {
    checkoutRequestId,
    status,
    resultCode,
    resultDesc,
    mpesaReceiptNumber,
    transactionDate
  } = req.body as any;

  if (!checkoutRequestId || !status) {
    return res.status(400).json({
      error: "Missing required fields: checkoutRequestId, status"
    });
  }

  try {
    // Check if the transaction exists
    const transactions = await analyticsService.listMpesaTransactions({
      checkout_request_id: checkoutRequestId
    });

    if (transactions.length === 0) {
      return res.status(404).json({
        error: `M-Pesa transaction with checkout_request_id ${checkoutRequestId} not found`
      });
    }

    const transaction = transactions[0];

    const updated = await analyticsService.updateMpesaTransactions({
      id: transaction.id,
      status,
      result_code: resultCode !== undefined ? parseInt(resultCode) : null,
      result_desc: resultDesc || null,
      mpesa_receipt_number: mpesaReceiptNumber || null,
      transaction_date: transactionDate || null
    });

    // Run analytics sync to recalculate metrics
    await analyticsService.syncAnalytics();

    // If payment is successful, try to capture the order payment
    if (status === "success" && transaction.cart_id) {
      try {
        const query = req.scope.resolve("query");
        const { data: orders } = await query.graph({
          entity: "order",
          fields: [
            "id",
            "cart_id",
            "payment_collections.id",
            "payment_collections.payments.id",
            "payment_collections.payments.status",
            "payment_collections.payments.amount"
          ],
          filters: {
            cart_id: transaction.cart_id
          } as any
        });

        if (orders.length > 0) {
          const order = orders[0];
          const paymentCollection = order.payment_collections?.[0];
          if (paymentCollection) {
            const payment = paymentCollection.payments?.find(
              (p: any) => p.status === "authorized"
            );
            if (payment) {
              // Capture the payment using Medusa core flow
              await capturePaymentWorkflow(req.scope).run({
                input: {
                  payment_id: payment.id,
                  amount: payment.amount,
                }
              });

              // Update payment metadata with M-Pesa receipt number
              const paymentModule = req.scope.resolve("payment") as any;
              await paymentModule.updatePayments({
                id: payment.id,
                metadata: {
                  mpesa_receipt_number: mpesaReceiptNumber,
                  mpesa_phone: transaction.phone_number,
                }
              });
              console.log(`[MPESA CAPTURE SUCCESS] Captured payment ${payment.id} for order ${order.id}`);
            }
          }
        }
      } catch (captureErr) {
        console.error("Failed to capture payment on M-Pesa callback:", captureErr);
      }
    }

    return res.json({
      success: true,
      transaction: updated
    });
  } catch (error: any) {
    console.error("Failed to update M-Pesa transaction:", error);
    return res.status(500).json({
      error: error.message || error
    });
  }
};
