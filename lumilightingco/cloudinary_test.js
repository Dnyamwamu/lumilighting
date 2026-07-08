#!/usr/bin/env node
import { v2 as cloudinary } from "cloudinary"

// Configure Cloudinary
cloudinary.config({
  cloud_name: "dul9mjxed",
  api_key: "137428427538582",
  api_secret: "BHexOaz1Z1zf2wVmesX6Ys8btx8",
})

async function runOnboarding() {
  try {
    console.log("Step 1: Uploading image to Cloudinary...")
    const uploadResult = await cloudinary.uploader.upload(
      "https://res.cloudinary.com/demo/image/upload/dog.jpg",
      {
        public_id: "cloudinary_onboarding_test",
      }
    )
    console.log("Secure URL:", uploadResult.secure_url)
    console.log("Public ID:", uploadResult.public_id)

    console.log("\nStep 2: Fetching image details...")
    const details = await cloudinary.api.resource(uploadResult.public_id)
    console.log("Width:", details.width)
    console.log("Height:", details.height)
    console.log("Format:", details.format)
    console.log("File Size (bytes):", details.bytes)

    console.log("\nStep 3: Transforming the image...")
    // 'fetch_format: auto' (f_auto) automatically delivers the image in the most optimal format (WebP, AVIF, etc.) depending on the user's browser.
    // 'quality: auto' (q_auto) automatically compresses the image to minimize file size while preserving high visual quality.
    const transformedUrl = cloudinary.url(uploadResult.public_id, {
      fetch_format: "auto",
      quality: "auto",
      secure: true,
    })

    console.log(
      "\nDone! Click link below to see optimized version of the image. Check the size and the format."
    )
    console.log(transformedUrl)
  } catch (error) {
    console.error("Error during onboarding script execution:", error)
  }
}

runOnboarding()
