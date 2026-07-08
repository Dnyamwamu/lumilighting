import { model } from "@medusajs/framework/utils"

const ProductSales = model.define("product_sales", {
  id: model.id().primaryKey(), // product title or custom ID
  product_title: model.text(),
  sold_quantity: model.number(),
  revenue: model.number(),
})

export default ProductSales
