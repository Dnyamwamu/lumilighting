const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || ""
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || ""
const SHORTCODE = process.env.MPESA_SHORTCODE || "174379" // Default Sandbox shortcode
const PASSKEY =
  process.env.MPESA_PASSKEY ||
  "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919" // Default Sandbox passkey
const CALLBACK_URL = process.env.MPESA_CALLBACK_URL || ""
const ENVIRONMENT = process.env.MPESA_ENVIRONMENT || "sandbox"

const BASE_URL =
  ENVIRONMENT === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke"

export interface MpesaStkPushResponse {
  MerchantRequestID: string
  CheckoutRequestID: string
  ResponseCode: string
  ResponseDescription: string
  CustomerMessage: string
}

export const mpesaService = {
  /**
   * Fetches OAuth2 Access Token from Safaricom Daraja API
   */
  async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString(
      "base64"
    )
    const url = `${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`

    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Basic ${auth}`,
        },
      })

      if (!res.ok) {
        throw new Error(
          `Failed to generate M-Pesa Access Token: ${res.statusText}`
        )
      }

      const data = await res.json()
      return data.access_token
    } catch (error) {
      console.error("Error fetching M-Pesa Access Token:", error)
      throw error
    }
  },

  /**
   * Triggers an STK Push to the customer's phone
   */
  async initiateStkPush(
    phoneNumber: string,
    amount: number,
    orderId: string
  ): Promise<MpesaStkPushResponse> {
    // Format phone number to international format: e.g. 254712345678
    let formattedPhone = phoneNumber.replace(/[\s+]/g, "")
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "254" + formattedPhone.substring(1)
    } else if (
      formattedPhone.startsWith("7") ||
      formattedPhone.startsWith("1")
    ) {
      formattedPhone = "254" + formattedPhone
    }

    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, "")
      .slice(0, 14) // YYYYMMDDHHmmss

    const password = Buffer.from(SHORTCODE + PASSKEY + timestamp).toString(
      "base64"
    )
    const accessToken = await this.getAccessToken()

    const payload = {
      BusinessShortCode: SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(amount),
      PartyA: formattedPhone,
      PartyB: SHORTCODE,
      PhoneNumber: formattedPhone,
      CallBackURL: CALLBACK_URL,
      AccountReference: orderId,
      TransactionDesc: `LUMI Lighting Order ${orderId}`,
    }

    const url = `${BASE_URL}/mpesa/stkpush/v1/processrequest`

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`STK Push failed (${res.status}): ${errorText}`)
      }

      return await res.json()
    } catch (error) {
      console.error("Error initiating M-Pesa STK Push:", error)
      throw error
    }
  },
}
