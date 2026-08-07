import { cpSync, existsSync } from "node:fs";
import { join } from "node:path";

const standaloneDir = ".next/standalone";

if (!existsSync(standaloneDir)) {
  console.error("Missing .next/standalone — run next build with output: standalone");
  process.exit(1);
}

cpSync(".next/static", join(standaloneDir, ".next/static"), { recursive: true });
cpSync("public", join(standaloneDir, "public"), { recursive: true });

if (existsSync("certs")) {
  cpSync("certs", join(standaloneDir, "certs"), { recursive: true });
}

console.log("Standalone bundle prepared");
