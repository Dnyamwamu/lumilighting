import fs from "fs"

const envFile = fs.readFileSync(".env.local", "utf8")
let secretKey = ""
for (const line of envFile.split("\n")) {
  if (line.startsWith("CLERK_SECRET_KEY=")) {
    secretKey = line.split("=")[1].trim()
  }
}

async function updateAllUsers() {
  const res = await fetch("https://api.clerk.com/v1/users", {
    headers: {
      Authorization: `Bearer ${secretKey}`,
    },
  })
  const users = await res.json()
  if (!Array.isArray(users)) {
    console.error("Clerk API returned:", users)
    return
  }
  console.log(`Found ${users.length} existing users in Clerk.`)
  for (const user of users) {
    const patchRes = await fetch(`https://api.clerk.com/v1/users/${user.id}/metadata`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        public_metadata: {
          ...user.public_metadata,
          role: "member",
          isMember: true,
          memberType: "client",
          memberSince: user.public_metadata?.memberSince || new Date(user.created_at).toISOString(),
        },
        unsafe_metadata: {
          ...user.unsafe_metadata,
          status: "active",
        },
      }),
    })
    const updated = await patchRes.json()
    console.log(`Successfully updated user ${user.id} (${user.email_addresses[0]?.email_address}) to member.`)
  }
}

updateAllUsers().catch(console.error)
