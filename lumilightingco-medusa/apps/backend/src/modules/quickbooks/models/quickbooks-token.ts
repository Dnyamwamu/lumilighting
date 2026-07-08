import { model } from "@medusajs/framework/utils"

const QuickBooksToken = model.define("quickbooks_token", {
  id: model.id().primaryKey(),
  access_token: model.text(),
  refresh_token: model.text(),
  expires_at: model.dateTime(),
  refresh_token_expires_at: model.dateTime(),
  realm_id: model.text().nullable(),
})

export default QuickBooksToken
