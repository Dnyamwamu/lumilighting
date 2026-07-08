import { model } from "@medusajs/framework/utils"

const InventoryMetrics = model.define("inventory_metrics", {
  id: model.id().primaryKey(), // "singleton"
  total_products: model.number(),
  in_stock: model.number(),
  out_of_stock: model.number(),
  low_stock: model.number(),
})

export default InventoryMetrics
