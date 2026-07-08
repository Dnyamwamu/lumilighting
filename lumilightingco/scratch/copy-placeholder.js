import * as fs from "fs"
import * as path from "path"

const publicDir = path.resolve("public")
const imagesDir = path.join(publicDir, "images")
const sourceFile = path.join(publicDir, "lumi-lighting-co-logo.jpg")
const destFile = path.join(imagesDir, "placeholder-light.jpg")

try {
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true })
    console.log("Created directory:", imagesDir)
  }

  if (fs.existsSync(sourceFile)) {
    fs.copyFileSync(sourceFile, destFile)
    console.log("Successfully copied placeholder to:", destFile)
  } else {
    console.error("Source file not found at:", sourceFile)
  }
} catch (error) {
  console.error("Error copying file:", error)
}
