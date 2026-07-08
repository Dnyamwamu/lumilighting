import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { generateInvoicePdfWorkflow } from "../workflows/generate-invoice-pdf"
import { capturePaymentWorkflow } from "@medusajs/medusa/core-flows"

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{
  id: string
}>) {
  const query = container.resolve("query")
  const notificationModuleService = container.resolve("notification")

  const { data: [order] } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "display_id",
      "created_at",
      "currency_code",
      "total",
      "email",
      "cart_id",
      "items.*",
      "items.variant.*",
      "items.variant.product.*",
      "shipping_address.*",
      "billing_address.*",
      "shipping_methods.*",
      "tax_total",
      "subtotal",
      "discount_total",
      "payment_collections.id",
      "payment_collections.payments.id",
      "payment_collections.payments.status",
      "payment_collections.payments.amount"
    ],
    filters: {
      id: data.id
    }
  })

  // Check if there is a successful M-Pesa transaction for this cart
  try {
    const orderAny = order as any
    if (orderAny.cart_id) {
      const analyticsService = container.resolve("analytics") as any;
      const mpesaTx = await analyticsService.listMpesaTransactions({
        cart_id: orderAny.cart_id,
        status: "success"
      });

      if (mpesaTx.length > 0) {
        const tx = mpesaTx[0];
        const paymentCollection = orderAny.payment_collections?.[0];
        if (paymentCollection) {
          const payment = paymentCollection.payments?.find(
            (p: any) => p.status === "authorized"
          );
          if (payment) {
            // Capture payment
            await capturePaymentWorkflow(container).run({
              input: {
                payment_id: payment.id,
                amount: payment.amount,
              }
            });

            // Update metadata
            const paymentModule = container.resolve("payment") as any;
            await paymentModule.updatePayments({
              id: payment.id,
              metadata: {
                mpesa_receipt_number: tx.mpesa_receipt_number,
                mpesa_phone: tx.phone_number,
              }
            });
            console.log(`[MPESA SUBSCRIBER CAPTURE] Captured payment ${payment.id} for order ${order.id}`);
          }
        }
      }
    }
  } catch (err) {
    console.error("Failed to capture M-Pesa payment in order.placed subscriber:", err);
  }

  const { result: {
    pdf_buffer
  } } = await generateInvoicePdfWorkflow(container)
    .run({
      input: {
        order_id: data.id
      }
    })

  const buffer = Buffer.from(pdf_buffer)

  // Convert to binary string to pass as attachment
  const binaryString = [...buffer]
    .map(byte => byte.toString(2).padStart(8, '0'))
    .join('')

  await notificationModuleService.createNotifications({
    to: order.email || "",
    template: "order-placed",
    channel: "email",
    // for testing:
    // channel: "feed",
    data: order,
    attachments: [
      {
        content: binaryString,
        filename: `invoice-${order.id}.pdf`,
        content_type: "application/pdf",
        disposition: "attachment"
      }
    ]
  })
}

export const config: SubscriberConfig = {
  event: "order.placed",
}