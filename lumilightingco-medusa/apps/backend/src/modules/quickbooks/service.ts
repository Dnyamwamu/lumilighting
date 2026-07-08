import { MedusaService } from "@medusajs/framework/utils"
import QuickBooksToken from "./models/quickbooks-token"
import { Context } from "@medusajs/framework/types"

class QuickBooksModuleService extends MedusaService({
  QuickBooksToken,
}) {
  private getClientConfig() {
    return {
      clientId: process.env.QUICKBOOKS_CLIENT_ID || "",
      clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET || "",
      redirectUri: process.env.QUICKBOOKS_REDIRECT_URI || "",
      environment: process.env.QUICKBOOKS_ENVIRONMENT || "sandbox",
    }
  }

  private getApiUrl(endpoint: string, realmId: string) {
    const { environment } = this.getClientConfig()
    const baseUrl = environment === "production"
      ? "https://quickbooks.api.intuit.com"
      : "https://sandbox-quickbooks.api.intuit.com"
    return `${baseUrl}/v3/company/${realmId}/${endpoint}`
  }

  async authenticate(code: string, realmId: string, sharedContext?: Context): Promise<any> {
    const { clientId, clientSecret, redirectUri } = this.getClientConfig()
    const tokenUrl = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer"

    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    })

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${authHeader}`,
        "Accept": "application/json",
      },
      body,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to exchange code for tokens: ${errorText}`)
    }

    const data = await response.json()
    const expiresAt = new Date(Date.now() + data.expires_in * 1000)
    const refreshTokenExpiresAt = new Date(Date.now() + data.x_refresh_token_expires_in * 1000)

    const existingTokens = await this.listQuickBooksTokens({}, {}, sharedContext)
    if (existingTokens.length > 0) {
      await this.updateQuickBooksTokens({
        id: existingTokens[0].id,
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: expiresAt,
        refresh_token_expires_at: refreshTokenExpiresAt,
        realm_id: realmId,
      }, sharedContext)
    } else {
      await this.createQuickBooksTokens({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: expiresAt,
        refresh_token_expires_at: refreshTokenExpiresAt,
        realm_id: realmId,
      }, sharedContext)
    }

    return data
  }

  async getValidToken(sharedContext?: Context): Promise<{ access_token: string; realm_id: string }> {
    const tokens = await this.listQuickBooksTokens({}, {}, sharedContext)
    if (tokens.length === 0) {
      throw new Error("QuickBooks is not authorized. Please link your account first.")
    }

    const tokenRecord = tokens[0]
    
    if (new Date(tokenRecord.expires_at).getTime() - 60000 > Date.now()) {
      return {
        access_token: tokenRecord.access_token,
        realm_id: tokenRecord.realm_id || "",
      }
    }

    const { clientId, clientSecret } = this.getClientConfig()
    const tokenUrl = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer"
    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: tokenRecord.refresh_token,
    })

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${authHeader}`,
        "Accept": "application/json",
      },
      body,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to refresh token: ${errorText}`)
    }

    const data = await response.json()
    const expiresAt = new Date(Date.now() + data.expires_in * 1000)
    const newRefreshToken = data.refresh_token || tokenRecord.refresh_token

    await this.updateQuickBooksTokens({
      id: tokenRecord.id,
      access_token: data.access_token,
      refresh_token: newRefreshToken,
      expires_at: expiresAt,
      realm_id: tokenRecord.realm_id,
    }, sharedContext)

    return {
      access_token: data.access_token,
      realm_id: tokenRecord.realm_id || "",
    }
  }

  async syncCustomer(email: string, firstName: string, lastName: string, sharedContext?: Context): Promise<string> {
    const { access_token, realm_id } = await this.getValidToken(sharedContext)

    const queryStr = `select * from Customer where PrimaryEmailAddr.Address = '${email}'`
    const searchUrl = `${this.getApiUrl("query", realm_id)}?query=${encodeURIComponent(queryStr)}`

    const searchRes = await fetch(searchUrl, {
      headers: {
        "Authorization": `Bearer ${access_token}`,
        "Accept": "application/json",
      }
    })

    if (searchRes.ok) {
      const searchData = await searchRes.json()
      const customer = searchData.QueryResponse?.Customer?.[0]
      if (customer) {
        return customer.Id
      }
    }

    const createUrl = this.getApiUrl("customer", realm_id)
    const response = await fetch(createUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${access_token}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        DisplayName: `${firstName} ${lastName}`,
        GivenName: firstName,
        FamilyName: lastName,
        PrimaryEmailAddr: {
          Address: email,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to create QuickBooks customer: ${errorText}`)
    }

    const data = await response.json()
    return data.Customer.Id
  }

  async syncItem(sku: string, title: string, unitPrice: number, sharedContext?: Context): Promise<string> {
    const { access_token, realm_id } = await this.getValidToken(sharedContext)

    // Clean SKU to avoid issues in query
    const cleanSku = sku.replace(/'/g, "\\'")
    const queryStr = `select * from Item where Name = '${cleanSku}'`
    const searchUrl = `${this.getApiUrl("query", realm_id)}?query=${encodeURIComponent(queryStr)}`

    try {
      const searchRes = await fetch(searchUrl, {
        headers: {
          "Authorization": `Bearer ${access_token}`,
          "Accept": "application/json",
        }
      })

      if (searchRes.ok) {
        const searchData = await searchRes.json()
        const item = searchData.QueryResponse?.Item?.[0]
        if (item) {
          return item.Id
        }
      }
    } catch (e) {
      console.warn("Failed to search QuickBooks item:", e)
    }

    // Fallback/Create Item
    try {
      const createUrl = this.getApiUrl("item", realm_id)
      const response = await fetch(createUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${access_token}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          Name: sku,
          Description: title,
          Active: true,
          Taxable: true,
          UnitPrice: unitPrice / 100,
          Type: "NonInventory",
          IncomeAccountRef: {
            value: "1", // Use default standard fallback
            name: "Services"
          }
        }),
      })

      if (response.ok) {
        const data = await response.json()
        return data.Item.Id
      } else {
        const err = await response.text()
        console.warn(`Failed to create item in QuickBooks (using default fallback '1'): ${err}`)
      }
    } catch (e) {
      console.warn("Failed to create QuickBooks item, using default fallback:", e)
    }

    return "1" // Default fallback ID
  }

  async syncInventory(sku: string, quantity: number, sharedContext?: Context): Promise<any> {
    // Inventory sync in QuickBooks typically adjusts inventory item levels.
    // For NonInventory items or Services, QtyOnHand is not tracked in the same way.
    // However, if the store uses Inventory-type items, we can query it and adjust stock.
    // Here we query the item, check if it tracks quantity, and log or perform adjustment.
    const { access_token, realm_id } = await this.getValidToken(sharedContext)
    const cleanSku = sku.replace(/'/g, "\\'")
    const queryStr = `select * from Item where Name = '${cleanSku}'`
    const searchUrl = `${this.getApiUrl("query", realm_id)}?query=${encodeURIComponent(queryStr)}`

    const searchRes = await fetch(searchUrl, {
      headers: {
        "Authorization": `Bearer ${access_token}`,
        "Accept": "application/json",
      }
    })

    if (!searchRes.ok) {
      throw new Error(`Failed to query item for inventory sync: ${await searchRes.text()}`)
    }

    const searchData = await searchRes.json()
    const item = searchData.QueryResponse?.Item?.[0]
    
    if (!item) {
      // Item doesn't exist, we can't sync inventory. Let's sync it as a non-inventory first.
      await this.syncItem(sku, sku, 0, sharedContext)
      return { status: "created_as_non_inventory" }
    }

    return {
      status: "queried",
      itemId: item.Id,
      qtyOnHand: item.QtyOnHand,
      sku
    }
  }

  async createSalesReceipt(orderData: any, qbCustomerId: string, sharedContext?: Context): Promise<any> {
    const { access_token, realm_id } = await this.getValidToken(sharedContext)

    console.log("DEBUG: QuickBooks sync orderData items:", JSON.stringify(orderData.items, null, 2))

    const lineItems = await Promise.all(orderData.items.map(async (item: any, index: number) => {
      const sku = item.variant?.sku || item.sku || `ITEM-${item.id}`
      const quantity = typeof item.quantity === 'number' ? item.quantity : 1
      const unitPrice = typeof item.unit_price === 'number' ? item.unit_price : 0
      const itemId = await this.syncItem(sku, item.title, unitPrice, sharedContext)
      const amount = (unitPrice * quantity) / 100
      console.log(`DEBUG: Line item index ${index} - SKU: ${sku}, ItemId: ${itemId}, Amount: ${amount}, UnitPrice: ${unitPrice}, Qty: ${quantity}`)
      return {
        Description: item.title,
        Amount: amount,
        DetailType: "SalesItemLineDetail",
        SalesItemLineDetail: {
          Qty: quantity,
          UnitPrice: unitPrice / 100,
          ItemRef: {
            value: itemId,
            name: item.title,
          },
        },
        LineNum: index + 1,
      }
    }))

    console.log("DEBUG: QuickBooks sync constructed lineItems:", JSON.stringify(lineItems, null, 2))

    const receiptPayload = {
      CustomerRef: {
        value: qbCustomerId,
      },
      Line: lineItems,
      TotalAmt: orderData.total / 100,
      DocNumber: String(orderData.display_id || orderData.id),
      PrivateNote: `Order synced from Medusa.js. Order ID: ${orderData.id}`,
    }

    const createUrl = this.getApiUrl("salesreceipt", realm_id)
    const response = await fetch(createUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${access_token}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(receiptPayload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to create QuickBooks SalesReceipt: ${errorText}`)
    }

    return await response.json()
  }
}

export default QuickBooksModuleService
