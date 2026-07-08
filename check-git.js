const { execSync } = require('child_process');

try {
  const result = execSync('git status', {
    cwd: './lumilightingco-medusa'
  }).toString();
  console.log("Git Status:\n", result);
} catch (e) {
  console.error("Error executing git command:", e.message);
  if (e.stderr) {
    console.error("Stderr:", e.stderr.toString());
  }
}
