import { execSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const serverPath = ".next/standalone/server.js";
const caBundle = resolve("certs/russian_trusted_ca_bundle.pem");

function runBuild() {
  console.log("Standalone bundle missing — running npm run build...");
  execSync("npm run build", {
    stdio: "inherit",
    env: { ...process.env, NODE_ENV: "production" },
  });
}

if (!existsSync(serverPath)) {
  try {
    runBuild();
  } catch (error) {
    console.error("Production build failed:", error);
  }
}

if (!existsSync(serverPath)) {
  console.error("Cannot start: .next/standalone/server.js not found.");
  console.error(
    "Set Amvera build command to: npm ci --include=dev && npm run build"
  );
  console.error("Remove artifacts * -> / from the Amvera UI if present.");
  process.exit(1);
}

const env = { ...process.env };

// MAX platform-api2.max.ru подписан УЦ Минцифры — без CA Node fetch падает
if (existsSync(caBundle)) {
  env.NODE_EXTRA_CA_CERTS = caBundle;
  console.log("MAX TLS: NODE_EXTRA_CA_CERTS =", caBundle);
} else {
  console.warn("MAX TLS: certs/russian_trusted_ca_bundle.pem not found");
}

const result = spawnSync(process.execPath, [serverPath], {
  stdio: "inherit",
  env,
});
process.exit(result.status ?? 1);
