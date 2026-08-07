import { execSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";

const serverPath = ".next/standalone/server.js";
const rootCa = resolve("certs/russian_trusted_root_ca.cer");
const subCa = resolve("certs/russian_trusted_sub_ca.cer");
const caBundle = resolve("certs/russian_trusted_ca_bundle.pem");

function ensureCaBundle() {
  if (existsSync(caBundle)) return true;
  if (!existsSync(rootCa) || !existsSync(subCa)) return false;
  mkdirSync(dirname(caBundle), { recursive: true });
  writeFileSync(
    caBundle,
    `${readFileSync(rootCa, "utf8").trim()}\n${readFileSync(subCa, "utf8").trim()}\n`,
    "utf8"
  );
  return true;
}

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
if (ensureCaBundle()) {
  env.NODE_EXTRA_CA_CERTS = caBundle;
  console.log("MAX TLS: NODE_EXTRA_CA_CERTS =", caBundle);
} else {
  console.warn("MAX TLS: certs/russian_trusted_*.cer not found");
}

const result = spawnSync(process.execPath, [serverPath], {
  stdio: "inherit",
  env,
});
process.exit(result.status ?? 1);
