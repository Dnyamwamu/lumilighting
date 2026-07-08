import {
  createWorkflow,
  createStep,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export type SyncOrderWorkflowInput = {
  orderId: string
}

export const fetchOrderStep = createStep(
  "fetch-order",
  async (input: { orderId: string }, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const { data: [order] } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "email",
        "total",
        "currency_code",
        "metadata",
        "items.*",
        "customer.*"
      ],
      filters: {
        id: input.orderId
      }
    })

    if (!order) {
      throw new Error(`Order with ID ${input.orderId} not found`)
    }

    return new StepResponse(order)
  }
)

export const syncOrderToQuickBooksStep = createStep(
  "sync-order-to-quickbooks",
  async (order: any, { container }) => {
    const quickbooksService = container.resolve("quickbooks")
    const orderService = container.resolve(Modules.ORDER)

    try {
      const email = order.email || order.customer?.email || ""
      const firstName = order.customer?.first_name || "Guest"
      const lastName = order.customer?.last_name || "Customer"

      // 1. Sync Customer
      const qbCustomerId = await quickbooksService.syncCustomer(
        email,
        firstName,
        lastName
      )

      // 2. Sync Sales Receipt
      const salesReceipt = await quickbooksService.createSalesReceipt(
        order,
        qbCustomerId
      )

      const qbReceiptId = salesReceipt.SalesReceipt?.Id || ""

      // 3. Update Order Metadata
      const existingMetadata = order.metadata || {}
      await orderService.updateOrders([{
        id: order.id,
        metadata: {
          ...existingMetadata,
          quickbooks_sync_status: "Synced",
          quickbooks_sales_receipt_id: qbReceiptId,
          quickbooks_sync_error: null,
          quickbooks_synced_at: new Date().toISOString()
        }
      }])

      return new StepResponse(
        {
          success: true,
          qbCustomerId,
          qbReceiptId,
          orderId: order.id,
          existingMetadata
        },
        {
          orderId: order.id,
          existingMetadata
        }
      )
    } catch (error: any) {
      // Mark as Failed in case of error
      const existingMetadata = order.metadata || {}
      await orderService.updateOrders([{
        id: order.id,
        metadata: {
          ...existingMetadata,
          quickbooks_sync_status: "Failed",
          quickbooks_sync_error: error.message || String(error),
          quickbooks_sync_failed_at: new Date().toISOString()
        }
      }])
      throw error
    }
  },
  // Compensation Callback (Rollback)
  async (compensationData, { container }) => {
    if (!compensationData) return

    const { orderId, existingMetadata } = compensationData
    const orderService = container.resolve(Modules.ORDER)

    // Revert metadata status
    await orderService.updateOrders([{
      id: orderId,
      metadata: {
        ...existingMetadata,
        quickbooks_sync_status: "Failed",
        quickbooks_sync_error: "Workflow execution rolled back"
      }
    }])
  }
)

export const syncOrderToQuickBooksWorkflow = createWorkflow(
  "sync-order-to-quickbooks",
  (input: SyncOrderWorkflowInput) => {
    const order = fetchOrderStep(input)
    const syncResult = syncOrderToQuickBooksStep(order)

    return new WorkflowResponse(syncResult)
  }
)
