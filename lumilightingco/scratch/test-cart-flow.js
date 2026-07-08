const MEDUSA_BACKEND_URL = "http://localhost:9001";
const PUBLISHABLE_KEY = ""; // Optional if publishable key is not strictly checked for GET/POST/DELETE

async function main() {
  const headers = {
    "Content-Type": "application/json",
    "x-publishable-api-key": PUBLISHABLE_KEY,
  };

  // 1. Create a cart
  console.log("Creating cart...");
  const createRes = await fetch(`${MEDUSA_BACKEND_URL}/store/carts`, {
    method: "POST",
    headers,
    body: JSON.stringify({ currency_code: "kes" }),
  });
  const createData = await createRes.json();
  console.log("Created cart ID:", createData.cart.id);
  const cartId = createData.cart.id;

  // 2. Fetch products to get a variant ID
  console.log("Fetching products...");
  const prodRes = await fetch(`${MEDUSA_BACKEND_URL}/store/products?fields=*variants.prices`, { headers });
  const prodData = await prodRes.json();
  const product = prodData.products[0];
  const variant = product.variants[0];
  console.log(`Using product "${product.title}" - Variant "${variant.title}" (ID: ${variant.id})`);

  // 3. Add item to cart
  console.log("Adding item to cart...");
  const addRes = await fetch(`${MEDUSA_BACKEND_URL}/store/carts/${cartId}/line-items`, {
    method: "POST",
    headers,
    body: JSON.stringify({ variant_id: variant.id, quantity: 1 }),
  });
  const addData = await addRes.json();
  const lineItem = addData.cart.items[0];
  console.log("Added line item ID:", lineItem.id);

  // 4. Delete item from cart
  console.log("Deleting item from cart...");
  const deleteRes = await fetch(`${MEDUSA_BACKEND_URL}/store/carts/${cartId}/line-items/${lineItem.id}`, {
    method: "DELETE",
    headers,
  });
  console.log("DELETE Status:", deleteRes.status);
  const deleteData = await deleteRes.json();
  console.log("DELETE Response Keys:", Object.keys(deleteData));
  console.log("DELETE Response Full Body:", JSON.stringify(deleteData, null, 2));
}

main().catch(console.error);
