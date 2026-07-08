import { model } from "@medusajs/framework/utils"

const MpesaTransaction = model.define("mpesa_transaction", {
  id: model.id().primaryKey(), // merchant_request_id or checkout_request_id or mpesa_receipt_number
  merchant_request_id: model.text(),
  checkout_request_id: model.text(),
  amount: model.float(),
  phone_number: model.text(),
  status: model.text(), // 'pending', 'success', 'failed'
  result_code: model.number().nullable(),
  result_desc: model.text().nullable(),
  mpesa_receipt_number: model.text().nullable(),
  transaction_date: model.text().nullable(),
  cart_id: model.text().nullable(),
  order_id: model.text().nullable(),
})

export default MpesaTransaction
