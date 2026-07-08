import { MedusaRequest, MedusaResponse } from "@medusajs/framework";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const code = req.query.code as string;
  const realmId = (req.query.realmId || req.query.realmid) as string;

  if (!code || !realmId) {
    return res.status(400).json({
      message: "Authorization code or realmId (Company ID) is missing. If you are accessing this directly, please initiate authorization from http://localhost:9001/admin/quickbooks/authorize first.",
    });
  }

  try {
    const quickbooksService = req.scope.resolve("quickbooks");
    await quickbooksService.authenticate(code, realmId);

    return res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QuickBooks Authorization Success</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background-color: #f9fafb;
            }
            .card {
              background: white;
              padding: 2.5rem;
              border-radius: 12px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
              text-align: center;
              max-width: 400px;
            }
            h1 { color: #10b981; margin-top: 0; }
            p { color: #4b5563; line-height: 1.5; }
            .btn {
              display: inline-block;
              margin-top: 1.5rem;
              padding: 0.75rem 1.5rem;
              background-color: #3b82f6;
              color: white;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 500;
              cursor: pointer;
              border: none;
            }
            .btn:hover { background-color: #2563eb; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Linked Successfully!</h1>
            <p>Your Medusa.js backend is now successfully connected to QuickBooks Online Plus.</p>
            <p>You can close this tab and return to the dashboard.</p>
            <button class="btn" onclick="window.close()">Close Window</button>
          </div>
        </body>
      </html>
    `);
  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to complete QuickBooks authorization",
      error: error.message || error,
    });
  }
};
