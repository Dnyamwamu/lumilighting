import { model } from "@medusajs/framework/utils"

const CustomerMetrics = model.define("customer_metrics", {
  id: model.id().primaryKey(), // "singleton"
  total_customers: model.number(),
  new_customers_today: model.number(),
  returning_customers: model.number(),
  repeat_purchase_rate: model.float(),
  top_customers: model.text().nullable(), // JSON string representing top customers list
})

export default CustomerMetrics
