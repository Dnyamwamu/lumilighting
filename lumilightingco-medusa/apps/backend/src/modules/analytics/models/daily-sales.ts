import { model } from "@medusajs/framework/utils"

const DailySales = model.define("daily_sales", {
  id: model.id().primaryKey(), // date string e.g. "2026-06-14"
  date: model.dateTime(),
  revenue: model.number(), // stored in cents/units
  orders_count: model.number(),
  avg_order_value: model.number(),
})

export default DailySales
