import { Pool } from "pg";

// In Docker, the postgres host is "postgres"
// On the host, the postgres host is "localhost" and port is 5439
const getConnectionString = () => {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  
  const isDocker = process.env.NODE_ENV === "production" || process.env.HOSTNAME === "0.0.0.0";
  const host = isDocker ? "postgres" : "localhost";
  const port = isDocker ? "5432" : "5439";
  
  return `postgres://postgres:postgres@${host}:${port}/medusa-store`;
};

const pool = new Pool({
  connectionString: getConnectionString(),
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    // console.log("Executed query", { text, duration, rows: res.rowCount });
    return res;
  } catch (err) {
    console.error("Database query error:", err);
    throw err;
  }
};
