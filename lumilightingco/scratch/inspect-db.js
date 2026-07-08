// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Client } = require("pg")

async function main() {
  const client = new Client({
    connectionString:
      "postgres://postgres:postgres@localhost:5439/medusa-store",
  })

  try {
    await client.connect()
    console.log("Connected to database successfully!")

    const res = await client.query(`
      SELECT id, title, handle FROM product_collection;
    `)

    console.log("Collections in database:")
    res.rows.forEach((row) => console.log(` - Title: ${row.title}, Handle: ${row.handle}, ID: ${row.id}`))
  } catch (err) {
    console.error("Error connecting or querying:", err)
  } finally {
    await client.end()
  }
}

main()
