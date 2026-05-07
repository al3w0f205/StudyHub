import { spawn } from "node:child_process";
import os from "node:os";
import qrcode from "qrcode-terminal";

/**
 * Detect the machine's local IPv4 address
 */
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    const networkInterface = interfaces[name];
    if (!networkInterface) continue;
    
    for (const iface of networkInterface) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
}

const port = process.env.PORT || "3000";
const nextBin = process.platform === "win32" ? "npx.cmd" : "npx";
const localIp = getLocalIp();
const localUrl = `http://${localIp}:${port}`;

console.clear();
console.log("\x1b[36m%s\x1b[0m", "═══════════════════════════════════════════════════");
console.log("\x1b[36m%s\x1b[0m", "       STUDYHUB — MOBILE PREVIEW MODE              ");
console.log("\x1b[36m%s\x1b[0m", "═══════════════════════════════════════════════════");
console.log("\nEscanea este código con tu celular para entrar:\n");

qrcode.generate(localUrl, { small: true });

console.log(`\nURL Local: \x1b[32m${localUrl}\x1b[0m`);
console.log(`URL Host:  \x1b[32mhttp://localhost:${port}\x1b[0m\n`);
console.log("Presiona \x1b[31mCtrl+C\x1b[0m para detener el servidor.\n");

const child = spawn(nextBin, ["next", "dev", "--port", port, "--hostname", "0.0.0.0"], {
  stdio: "inherit",
  shell: true, // Crucial for Windows
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
