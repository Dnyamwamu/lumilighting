import nodemailer from "nodemailer"
import path from "path"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.titan.email",
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
})

const getLogoAttachment = () => ({
  filename: "lumi-lighting-co-logo.jpg",
  path: path.join(process.cwd(), "public/lumi-lighting-co-logo.jpg"),
  cid: "lumilogo",
})

interface QuoteProduct {
  id?: string
  title: string
  sku?: string
}

export async function sendQuoteEmail({
  name,
  phone,
  email,
  projectDescription,
  products,
}: {
  name: string
  phone: string
  email: string
  projectDescription: string
  products?: (string | QuoteProduct)[]
}) {
  const productsListHtml = (products || [])
    .map((p) => {
      if (typeof p === "string") {
        return `<li>${p}</li>`
      }
      const parts = [p.title]
      if (p.id) parts.push(`(ID: ${p.id})`)
      if (p.sku) parts.push(`(SKU: ${p.sku})`)
      return `<li>${parts.join(" ")}</li>`
    })
    .join("")

  const logoAttachment = getLogoAttachment()

  const dealerMailOptions = {
    from:
      process.env.SMTP_FROM_EMAIL ||
      '"LUMI Lighting." <info@lumilighting.co.ke>',
    to: process.env.DEALER_EMAIL || "info@lumilighting.co.ke",
    subject: `New LUMI Quote Request from ${name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="cid:lumilogo" alt="LUMI Lighting." style="max-height: 70px; width: auto;" />
        </div>
        <h2 style="color: #eab308; border-bottom: 2px solid #eab308; padding-bottom: 10px; margin-top: 10px;">New Quote Request Received</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <tr>
            <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee; width: 150px;">Customer Name:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Email Address:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><a href="mailto:${email}">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Phone Number:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${phone}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee; width: 150px;">Project Details:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; white-space: pre-wrap;">${projectDescription}</td>
          </tr>
        </table>
        ${
          productsListHtml
            ? `
          <h3 style="margin-top: 20px; color: #333;">Interested Products:</h3>
          <ul style="padding-left: 20px; color: #555;">
            ${productsListHtml}
          </ul>
        `
            : ""
        }
        <p style="margin-top: 30px; font-size: 11px; color: #888; border-top: 1px solid #eee; padding-top: 10px; text-align: center;">
          LUMI Lighting. Lead System
        </p>
      </div>
    `,
    attachments: [logoAttachment],
  }

  const customerMailOptions = {
    from:
      process.env.SMTP_FROM_EMAIL ||
      '"LUMI Lighting." <info@lumilighting.co.ke>',
    to: email,
    subject: `Thank you for contacting LUMI Lighting.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="cid:lumilogo" alt="LUMI Lighting." style="max-height: 70px; width: auto;" />
        </div>
        <h2 style="color: #eab308; border-bottom: 2px solid #eab308; padding-bottom: 10px; margin-top: 10px;">Quotation Request Received</h2>
        <p>Dear ${name},</p>
        <p>Thank you for reaching out to LUMI Lighting. We have successfully received your quotation request for your architectural lighting project.</p>
        <p>A project support representative is reviewing your requirements and will contact you shortly with a personalized pricing quotation.</p>
        <div style="background-color: #fcfcfc; padding: 15px; border-radius: 8px; border-left: 4px solid #eab308; margin: 20px 0;">
          <strong>Your project description:</strong><br/>
          <span style="color: #555; font-style: italic; white-space: pre-wrap; display: block;">"${projectDescription}"</span>
        </div>
        <p>If you have any immediate questions, feel free to reply to this email.</p>
        <p style="margin-top: 30px;">Best regards,<br/><strong>LUMI Project Support Team</strong></p>
      </div>
    `,
    attachments: [logoAttachment],
  }

  await Promise.all([
    transporter.sendMail(dealerMailOptions),
    transporter.sendMail(customerMailOptions),
  ])
}

interface ConfirmationOrderItem {
  title: string
  quantity: number
  unit_price: number
}

interface ConfirmationOrder {
  id: string
  display_id?: number
  email: string
  subtotal?: number
  shipping_total?: number
  discount_total?: number
  tax_total?: number
  total: number
  created_at?: string
  items: ConfirmationOrderItem[]
  metadata?: Record<string, unknown>
}

export async function sendOrderConfirmationEmail(order: ConfirmationOrder) {
  if (!order || !order.email) return

  const shipping_total = order.shipping_total || 0
  const discount_total = order.discount_total || 0
  const tax_total = order.tax_total || 0
  const subtotal = order.subtotal !== undefined ? order.subtotal : (order.total - shipping_total + discount_total - tax_total)
  const total = order.total

  const itemsListHtml = (order.items || [])
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.title}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">KES ${(item.unit_price / 100).toLocaleString()}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">KES ${((item.unit_price * item.quantity) / 100).toLocaleString()}</td>
      </tr>
    `
    )
    .join("")

  const orderIdText = order.display_id ? `LUMI-${order.display_id}` : order.id
  const logoAttachment = getLogoAttachment()

  const mailOptions = {
    from:
      process.env.SMTP_FROM_EMAIL ||
      '"LUMI Lighting." <info@lumilighting.co.ke>',
    to: order.email,
    subject: `Order Confirmation - ${orderIdText}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: auto; padding: 25px; border: 1px solid #eee; border-radius: 12px;">
        <div style="text-align: center; border-bottom: 2px solid #eab308; padding-bottom: 15px; margin-bottom: 25px;">
          <img src="cid:lumilogo" alt="LUMI Lighting." style="max-height: 70px; width: auto; margin-bottom: 5px;" />
          <p style="color: #eab308; margin: 5px 0 0 0; font-weight: bold; font-size: 14px;">ORDER CONFIRMATION</p>
        </div>
        <p>Dear Valued Customer,</p>
        <p>Thank you for shopping with LUMI Lighting. We are pleased to confirm that we have received your order. Below is your purchase summary:</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 13px;">
          <strong>Order Reference:</strong> <span style="font-family: monospace; font-weight: bold; color: #eab308;">${orderIdText}</span><br/>
          <strong>Date:</strong> ${new Date(order.created_at || Date.now()).toLocaleDateString()}<br/>
          <strong>Status:</strong> Processing
        </div>

        <table style="width: 100%; border-collapse: collapse; margin: 25px 0; font-size: 13px;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Product Details</th>
              <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd; width: 60px;">Qty</th>
              <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd; width: 100px;">Unit Price</th>
              <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd; width: 100px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsListHtml}
          </tbody>
        </table>

        <div style="display: flex; justify-content: flex-end; margin-top: 20px; font-size: 13px;">
          <table style="width: 250px;">
            <tr>
              <td style="padding: 5px 0; color: #666;">Subtotal</td>
              <td style="padding: 5px 0; text-align: right; font-weight: bold;">KES ${(subtotal / 100).toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #666;">Shipping</td>
              <td style="padding: 5px 0; text-align: right; font-weight: bold; ${shipping_total === 0 ? "color: #10b981;" : ""}">
                ${shipping_total > 0 ? `KES ${(shipping_total / 100).toLocaleString()}` : "Free"}
              </td>
            </tr>
            ${discount_total > 0 ? `
            <tr>
              <td style="padding: 5px 0; color: #666;">Discount</td>
              <td style="padding: 5px 0; text-align: right; font-weight: bold; color: #ef4444;">- KES ${(discount_total / 100).toLocaleString()}</td>
            </tr>
            ` : ""}
            ${tax_total > 0 ? `
            <tr>
              <td style="padding: 5px 0; color: #666;">Tax</td>
              <td style="padding: 5px 0; text-align: right; font-weight: bold;">KES ${(tax_total / 100).toLocaleString()}</td>
            </tr>
            ` : ""}
            <tr style="border-top: 2px solid #111; font-size: 16px;">
              <td style="padding: 10px 0; font-weight: bold;">Total Paid</td>
              <td style="padding: 10px 0; text-align: right; font-weight: bold; color: #eab308;">KES ${(total / 100).toLocaleString()}</td>
            </tr>
          </table>
        </div>

        ${order.metadata?.order_notes ? `
        <div style="background-color: #fafafa; padding: 15px; border-radius: 8px; border-left: 4px solid #eab308; margin: 20px 0; font-size: 13px;">
          <strong>Order Notes / Delivery Instructions:</strong><br/>
          <span style="color: #555; font-style: italic; white-space: pre-wrap; display: block; margin-top: 5px;">"${order.metadata.order_notes}"</span>
        </div>
        ` : ""}

        <p style="margin-top: 30px; font-size: 13px; line-height: 1.6;">
          Your order will be packed and dispatched shortly. If you requested M-Pesa Payment, processing takes a few minutes to complete on our side.
        </p>

        <p style="margin-top: 30px;">Best regards,<br/><strong>LUMI Project & Operations Team</strong></p>
        
        <div style="margin-top: 40px; font-size: 11px; color: #888; border-top: 1px solid #eee; padding-top: 15px; text-align: center;">
          For any questions or changes, reply to this email or contact support@lumilightingco.com
        </div>
      </div>
    `,
    attachments: [logoAttachment],
  }

  await transporter.sendMail(mailOptions)
}

export async function sendOrderFulfillmentEmail(order: ConfirmationOrder) {
  if (!order || !order.email) return

  const itemsListHtml = (order.items || [])
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.title}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      </tr>
    `
    )
    .join("")

  const orderIdText = order.display_id ? `LUMI-${order.display_id}` : order.id
  const logoAttachment = getLogoAttachment()

  const mailOptions = {
    from:
      process.env.SMTP_FROM_EMAIL ||
      '"LUMI Lighting." <info@lumilighting.co.ke>',
    to: order.email,
    subject: `Your Order is being Packed - ${orderIdText}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: auto; padding: 25px; border: 1px solid #eee; border-radius: 12px;">
        <div style="text-align: center; border-bottom: 2px solid #eab308; padding-bottom: 15px; margin-bottom: 25px;">
          <img src="cid:lumilogo" alt="LUMI Lighting." style="max-height: 70px; width: auto; margin-bottom: 5px;" />
          <p style="color: #eab308; margin: 5px 0 0 0; font-weight: bold; font-size: 14px;">ORDER BEING PACKED</p>
        </div>
        <p>Dear Valued Customer,</p>
        <p>We are excited to let you know that we are currently packing your order. Our team is ensuring all items are securely prepared for safe transport. Below is the summary of items being packed:</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 13px;">
          <strong>Order Reference:</strong> <span style="font-family: monospace; font-weight: bold; color: #eab308;">${orderIdText}</span><br/>
          <strong>Status:</strong> Packing & Preparing
        </div>

        <table style="width: 100%; border-collapse: collapse; margin: 25px 0; font-size: 13px;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Product Details</th>
              <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd; width: 60px;">Qty</th>
            </tr>
          </thead>
          <tbody>
            ${itemsListHtml}
          </tbody>
        </table>

        <p style="margin-top: 30px; font-size: 13px; line-height: 1.6;">
          Once your package is dispatched, we will send you another update with the delivery details.
        </p>

        <p style="margin-top: 30px;">Best regards,<br/><strong>LUMI Project & Operations Team</strong></p>
        
        <div style="margin-top: 40px; font-size: 11px; color: #888; border-top: 1px solid #eee; padding-top: 15px; text-align: center;">
          For any questions or changes, reply to this email or contact support@lumilightingco.com
        </div>
      </div>
    `,
    attachments: [logoAttachment],
  }

  await transporter.sendMail(mailOptions)
}

export async function sendOrderShipmentEmail(order: ConfirmationOrder) {
  if (!order || !order.email) return

  const itemsListHtml = (order.items || [])
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.title}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      </tr>
    `
    )
    .join("")

  const orderIdText = order.display_id ? `LUMI-${order.display_id}` : order.id
  const logoAttachment = getLogoAttachment()

  const mailOptions = {
    from:
      process.env.SMTP_FROM_EMAIL ||
      '"LUMI Lighting." <info@lumilighting.co.ke>',
    to: order.email,
    subject: `Your Order is on its Way! - ${orderIdText}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: auto; padding: 25px; border: 1px solid #eee; border-radius: 12px;">
        <div style="text-align: center; border-bottom: 2px solid #eab308; padding-bottom: 15px; margin-bottom: 25px;">
          <img src="cid:lumilogo" alt="LUMI Lighting." style="max-height: 70px; width: auto; margin-bottom: 5px;" />
          <p style="color: #eab308; margin: 5px 0 0 0; font-weight: bold; font-size: 14px;">ORDER SHIPPED</p>
        </div>
        <p>Dear Valued Customer,</p>
        <p>Great news! Your order has been dispatched and is currently on its way to your delivery address. Below are the shipment details:</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 13px;">
          <strong>Order Reference:</strong> <span style="font-family: monospace; font-weight: bold; color: #eab308;">${orderIdText}</span><br/>
          <strong>Shipping Carrier:</strong> LUMI Express Delivery<br/>
          <strong>Status:</strong> Dispatched & Out for Delivery
        </div>

        <table style="width: 100%; border-collapse: collapse; margin: 25px 0; font-size: 13px;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Product Details</th>
              <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd; width: 60px;">Qty</th>
            </tr>
          </thead>
          <tbody>
            ${itemsListHtml}
          </tbody>
        </table>

        <p style="margin-top: 30px; font-size: 13px; line-height: 1.6;">
          Our delivery representative will contact you via your phone number to coordinate the drop-off.
        </p>

        <p style="margin-top: 30px;">Best regards,<br/><strong>LUMI Project & Operations Team</strong></p>
        
        <div style="margin-top: 40px; font-size: 11px; color: #888; border-top: 1px solid #eee; padding-top: 15px; text-align: center;">
          For any questions or changes, reply to this email or contact support@lumilightingco.com
        </div>
      </div>
    `,
    attachments: [logoAttachment],
  }

  await transporter.sendMail(mailOptions)
}
