import { execSync } from "child_process"

try {
  const result = execSync("git status && git diff", {
    cwd: "/Users/dnyamwamu/projects/Clients/lumilightingco/lumilightingco-medusa",
  }).toString()
  console.log("Git Status & Diff:\n", result)
} catch (e) {
  console.error("Error executing git command:", e.message)
  if (e.stderr) {
    console.error("Stderr:", e.stderr.toString())
  }
}
