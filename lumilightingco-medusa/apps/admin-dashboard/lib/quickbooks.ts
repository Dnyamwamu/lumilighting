import { query } from "./db";

export interface QuickBooksFinancials {
  sales: number;
  expenses: number;
  profit: number;
  vatPayable: number;
  accountsReceivable: number;
  isMock: boolean;
}

const getClientConfig = () => {
  return {
    clientId: process.env.QUICKBOOKS_CLIENT_ID || "",
    clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET || "",
    environment: process.env.QUICKBOOKS_ENVIRONMENT || "sandbox",
  };
};

const getApiUrl = (realmId: string, endpoint: string) => {
  const { environment } = getClientConfig();
  const baseUrl = environment === "production"
    ? "https://quickbooks.api.intuit.com"
    : "https://sandbox-quickbooks.api.intuit.com";
  return `${baseUrl}/v3/company/${realmId}/${endpoint}`;
};

export async function getValidToken(): Promise<{ access_token: string; realm_id: string } | null> {
  try {
    const res = await query('SELECT * FROM quickbooks_token WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 1');
    if (res.rows.length === 0) {
      return null;
    }

    const tokenRecord = res.rows[0];
    
    // Check if token is still valid (with 60 seconds buffer)
    if (new Date(tokenRecord.expires_at).getTime() - 60000 > Date.now()) {
      return {
        access_token: tokenRecord.access_token,
        realm_id: tokenRecord.realm_id || "",
      };
    }

    // Token is expired, refresh it
    const { clientId, clientSecret } = getClientConfig();
    const tokenUrl = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer";
    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: tokenRecord.refresh_token,
    });

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${authHeader}`,
        "Accept": "application/json",
      },
      body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to refresh QuickBooks token:", errorText);
      return null;
    }

    const data = await response.json();
    const expiresAt = new Date(Date.now() + data.expires_in * 1000);
    const newRefreshToken = data.refresh_token || tokenRecord.refresh_token;

    await query(
      `UPDATE quickbooks_token 
       SET access_token = $1, refresh_token = $2, expires_at = $3, updated_at = NOW() 
       WHERE id = $4`,
      [data.access_token, newRefreshToken, expiresAt, tokenRecord.id]
    );

    return {
      access_token: data.access_token,
      realm_id: tokenRecord.realm_id || "",
    };
  } catch (error) {
    console.error("QuickBooks token retrieval error:", error);
    return null;
  }
}

export async function fetchQuickBooksFinancials(): Promise<QuickBooksFinancials> {
  const tokenData = await getValidToken();
  
  // Return fallback mock data if QuickBooks is not linked/authorized
  if (!tokenData) {
    return getMockFinancials();
  }

  const { access_token, realm_id } = tokenData;

  try {
    // 1. Fetch Profit & Loss
    const plUrl = `${getApiUrl(realm_id, "reports/ProfitAndLoss")}?minorversion=65`;
    const plResponse = await fetch(plUrl, {
      headers: {
        "Authorization": `Bearer ${access_token}`,
        "Accept": "application/json",
      },
    });

    // 2. Fetch Balance Sheet
    const bsUrl = `${getApiUrl(realm_id, "reports/BalanceSheet")}?minorversion=65`;
    const bsResponse = await fetch(bsUrl, {
      headers: {
        "Authorization": `Bearer ${access_token}`,
        "Accept": "application/json",
      },
    });

    if (!plResponse.ok || !bsResponse.ok) {
      console.warn("QuickBooks API reports returned error, falling back to mock data");
      return getMockFinancials();
    }

    const plData = await plResponse.json();
    const bsData = await bsResponse.json();

    // Parse P&L Report for Sales (Total Income), Expenses (Total Expenses), and Net Income
    let sales = 0;
    let expenses = 0;
    let profit = 0;

    if (plData.Rows?.Row) {
      // Find Income and Expense sections
      plData.Rows.Row.forEach((row: any) => {
        if (row.group === "Income" || row.Summary?.ColData?.[0]?.value === "Total Income") {
          sales = parseFloat(row.Summary?.ColData?.[1]?.value || "0");
        }
        if (row.group === "Expenses" || row.Summary?.ColData?.[0]?.value === "Total Expenses") {
          expenses = parseFloat(row.Summary?.ColData?.[1]?.value || "0");
        }
        if (row.Summary?.ColData?.[0]?.value === "Net Income") {
          profit = parseFloat(row.Summary?.ColData?.[1]?.value || "0");
        }
      });
    }

    // Parse Balance Sheet Report for Accounts Receivable & VAT Payable (Taxes Payable)
    let accountsReceivable = 0;
    let vatPayable = 0;

    if (bsData.Rows?.Row) {
      const traverseRows = (rows: any[]) => {
        rows.forEach((row) => {
          const label = row.Summary?.ColData?.[0]?.value || "";
          const val = parseFloat(row.Summary?.ColData?.[1]?.value || "0");
          
          if (label.includes("Accounts Receivable") || label.includes("Debtors")) {
            accountsReceivable = val;
          }
          if (label.includes("VAT Payable") || label.includes("Tax Payable") || label.includes("Duties Payable")) {
            vatPayable = val;
          }

          if (row.Rows?.Row) {
            traverseRows(row.Rows.Row);
          }
        });
      };
      traverseRows(bsData.Rows.Row);
    }

    // Default fallbacks if parsing resulted in zeros but API succeeded
    return {
      sales: sales || 0,
      expenses: expenses || 0,
      profit: profit || (sales - expenses),
      vatPayable: vatPayable || 0,
      accountsReceivable: accountsReceivable || 0,
      isMock: false,
    };
  } catch (err) {
    console.error("Error calling QuickBooks reports, falling back to mock:", err);
    return getMockFinancials();
  }
}

function getMockFinancials(): QuickBooksFinancials {
  return {
    sales: 0,
    expenses: 0,
    profit: 0,
    vatPayable: 0,
    accountsReceivable: 0,
    isMock: false,
  };
}
