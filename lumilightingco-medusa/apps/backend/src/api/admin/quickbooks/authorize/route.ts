import { MedusaRequest, MedusaResponse } from "@medusajs/framework";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const clientId = process.env.QUICKBOOKS_CLIENT_ID || "";
  const redirectUri = process.env.QUICKBOOKS_REDIRECT_URI || "";
  const state = Math.random().toString(36).substring(7);

  if (!clientId || !redirectUri) {
    return res.status(400).json({
      message: "QuickBooks client configuration is missing. Please set QUICKBOOKS_CLIENT_ID and QUICKBOOKS_REDIRECT_URI.",
    });
  }

  const scope = "com.intuit.quickbooks.accounting";
  const authUrl = `https://appcenter.intuit.com/connect/oauth2?client_id=${encodeURIComponent(clientId)}&response_type=code&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;

  return res.redirect(authUrl);
};
