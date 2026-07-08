async function run() {
  const MEDUSA_BACKEND_URL = "http://localhost:9001";
  const PUBLISHABLE_KEY = "pk_2057cfa2ae21763877eac38d2a967f140fe2a867030e9412ff47200320f0bab8";
  try {
    const res = await fetch(`${MEDUSA_BACKEND_URL}/store/collections`, {
      headers: {
        "x-publishable-api-key": PUBLISHABLE_KEY,
      }
    });
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Collections:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
