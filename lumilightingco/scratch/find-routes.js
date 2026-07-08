import fs from "fs"
import path from "path"

function walk(dir) {
  let results = []
  const list = fs.readdirSync(dir)
  list.forEach((file) => {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)
    if (stat && stat.isDirectory()) {
      if (file !== "node_modules" && file !== ".git" && file !== ".next") {
        results = results.concat(walk(fullPath))
      }
    } else {
      if (file === "route.ts" || file === "route.js") {
        results.push(fullPath)
      }
    }
  })
  return results
}

try {
  const routes = walk("./lumilightingco-medusa")
  console.log("Found routes:\n", routes.join("\n"))
} catch (e) {
  console.error(e)
}
