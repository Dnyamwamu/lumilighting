import { model } from "@medusajs/framework/utils"

const MonthlySales = model.define("monthly_sales", {
  id: model.id().primaryKey(), // month string e.g. "2026-06"
  month: model.text(),
  revenue: model.number(),
  orders_count: model.number(),
})

export default MonthlySales
