import fs from "fs"
import path from "path"
import nodemailer from "nodemailer"

// Parse .env.local manually to load variables
const envPath = path.join(process.cwd(), "lumilightingco/.env.local")
console.log(`Loading env variables from: ${envPath}`)

let envContent = ""
try {
  envContent = fs.readFileSync(envPath, "utf8")
} catch (e) {
  console.error("Error reading .env.local file:", e.message)
  process.exit(1)
}

const env = {}
envContent.split("\n").forEach((line) => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
  if (match) {
    let value = match[2] ? match[2].trim() : ""
    // Remove quotes
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1)
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.substring(1, value.length - 1)
    }
    env[match[1]] = value
  }
})

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST || "smtp.titan.email",
  port: parseInt(env.SMTP_PORT || "465"),
  secure: env.SMTP_SECURE === "true",
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
})

const mailOptions = {
  from: env.SMTP_FROM_EMAIL || '"LUMI Lighting." <info@lumilighting.co.ke>',
  to: env.SMTP_USER, // Sending to self to verify delivery
  subject: "Test Email from LUMI Lighting.",
  text: "Hello! This is a test email to verify that the Titan SMTP configuration is working correctly.",
  html: "<b>Hello!</b><br>This is a test email to verify that the Titan SMTP configuration is working correctly.",
}

console.log(`Attempting to send test email with:`)
console.log(`- SMTP Host: ${env.SMTP_HOST}`)
console.log(`- SMTP Port: ${env.SMTP_PORT}`)
console.log(`- SMTP User: ${env.SMTP_USER}`)
console.log(`- SMTP Password: ${env.SMTP_PASSWORD ? "********" : "NOT SET"}`)

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error("Error sending email:", error)
  } else {
    console.log("Email sent successfully!")
    console.log("Response:", info.response)
    console.log("Message ID:", info.messageId)
  }
})
