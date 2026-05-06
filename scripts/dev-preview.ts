import { spawn } from "node:child_process";

const port = process.env.PORT || "3000";
const nextBin = process.platform === "win32" ? "npx.cmd" : "npx";

const child = spawn(nextBin, ["next", "dev", "--port", port], {
  stdio: "inherit",
  shell: false,
  env: {
    ...process.env,
    STUDYHUB_PREVIEW_MODE: "true",
    AUTH_SECRET: process.env.AUTH_SECRET || "local-preview-secret-not-for-production",
    AUTH_TRUST_HOST: "true",
    NEXT_TELEMETRY_DISABLED: "1",
  },
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  }
  process.exit(code ?? 0);
});
