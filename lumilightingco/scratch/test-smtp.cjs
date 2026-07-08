/* eslint-disable */
const fs = require("fs")
const path = require("path")
const nodemailer = require("nodemailer")

// Manually parse .env.local to load SMTP credentials in a standalone node process
const envPath = path.resolve(__dirname, "../.env.local")
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8")
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) return
    const parts = trimmed.split("=")
    const key = parts[0].trim()
    let val = parts.slice(1).join("=").trim()
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.substring(1, val.length - 1)
    }
    process.env[key] = val
  })
}

const config = {
  host: process.env.SMTP_HOST || "smtp.titan.email",
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
}

console.log("Config loaded:", {
  host: config.host,
  port: config.port,
  secure: config.secure,
  user: config.auth.user,
})

console.log("Connecting to Titan SMTP server...")
const transporter = nodemailer.createTransport(config)

transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Connection verification failed:")
    console.error(error)
  } else {
    console.log("✅ Server is ready to take our messages!")

    const mailOptions = {
      from:
        process.env.SMTP_FROM_EMAIL ||
        '"Lumi Lighting" <info@lumilighting.co.ke>',
      to: process.env.DEALER_EMAIL || "info@lumilighting.co.ke",
      subject: "Test Email from LUMI SMTP Setup",
      text: "This is a test email to verify that the Titan SMTP setup in the lumilightingco project is fully functional.",
    }

    console.log(`Sending test email to ${mailOptions.to}...`)
    transporter.sendMail(mailOptions, (sendErr, info) => {
      if (sendErr) {
        console.error("❌ Failed to send email:")
        console.error(sendErr)
      } else {
        console.log("✅ Email sent successfully!")
        console.log("Message ID:", info.messageId)
      }
    })
  }
})
