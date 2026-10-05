import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { unstable_cache } from "next/cache";
import { CATALOG_REVALIDATE_SECONDS } from "@/lib/advantshop/config";

function normalizeArtNo(value: string): string {
  return value.trim().toLowerCase();
}

function parseCsvLine(line: string, delimiter: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === delimiter && !inQuotes) {
      cells.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  cells.push(current);
  return cells.map((cell) => cell.trim());
}

function detectDelimiter(headerLine: string): string {
  const semicolons = (headerLine.match(/;/g) ?? []).length;
  const commas = (headerLine.match(/,/g) ?? []).length;
  return semicolons >= commas ? ";" : ",";
}

/** ArtNo → артикулы комплекта из колонки Set. */
export function parseStocksSetMap(csv: string): Record<string, string[]> {
  const lines = csv
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length < 2) return {};

  const delimiter = detectDelimiter(lines[0]);
  const header = parseCsvLine(lines[0], delimiter).map((h) => h.toLowerCase());
  const artIdx = header.findIndex((h) => h === "artno" || h === "артикул");
  const setIdx = header.findIndex((h) => h === "set" || h === "свойство: set");
  if (artIdx < 0 || setIdx < 0) return {};

  const map: Record<string, string[]> = {};
  for (const line of lines.slice(1)) {
    const cells = parseCsvLine(line, delimiter);
    const artNo = cells[artIdx]?.trim();
    const setRaw = cells[setIdx]?.trim();
    if (!artNo || !setRaw) continue;
    const key = normalizeArtNo(artNo);
    if (map[key]?.length) continue;
    const setArtNos = [
      ...new Set(
        setRaw
          .split(",")
          .map((part) => part.trim())
          .filter(Boolean),
      ),
    ];
    if (setArtNos.length) map[key] = setArtNos;
  }
  return map;
}

async function downloadStocksCsvViaFtp(): Promise<string | null> {
  const host = process.env.FTP_HOST?.trim();
  const user = process.env.FTP_USER?.trim();
  const password = process.env.FTP_PASSWORD?.trim();
  if (!host || !user || !password) return null;

  try {
    const { Client } = await import("basic-ftp");
    const { mkdtempSync, readFileSync: read } = await import("node:fs");
    const { tmpdir } = await import("node:os");
    const { join } = await import("node:path");

    const remotePath = process.env.FTP_REMOTE_PATH?.trim() || "/stocks.csv";
    const port = Number(process.env.FTP_PORT || 21);
    const secure =
      String(process.env.FTP_SECURE || "false").toLowerCase() === "true";
    const dir = mkdtempSync(join(tmpdir(), "sinonim-stocks-"));
    const dest = join(dir, "stocks.csv");
    const client = new Client(60_000);
    try {
      await client.access({ host, port, user, password, secure });
      await client.downloadTo(dest, remotePath);
      return read(dest, "utf8");
    } finally {
      client.close();
    }
  } catch (error) {
    console.warn("stocks.csv FTP download failed:", error);
    return null;
  }
}

function readLocalStocksCsv(): string | null {
  const candidates = [
    process.env.STOCKS_CSV_PATH?.trim(),
    resolve(process.cwd(), "stocks.csv"),
    resolve(process.cwd(), "tmp/stocks.csv"),
  ].filter((path): path is string => Boolean(path));

  for (const path of candidates) {
    if (!existsSync(path)) continue;
    try {
      return readFileSync(path, "utf8");
    } catch {
      // try next
    }
  }
  return null;
}

async function loadStocksCsvText(): Promise<string | null> {
  const local = readLocalStocksCsv();
  if (local) return local;
  return downloadStocksCsvViaFtp();
}

export const getCachedStocksSetMapByArtNo = unstable_cache(
  async (): Promise<Record<string, string[]>> => {
    const csv = await loadStocksCsvText();
    if (!csv) return {};
    return parseStocksSetMap(csv);
  },
  ["stocks-csv-set-map-v1"],
  { revalidate: CATALOG_REVALIDATE_SECONDS, tags: ["catalog"] },
);

export function lookupStocksSetArtNos(
  setMapByArtNo: Record<string, string[]>,
  artNo?: string | null,
): string[] {
  if (!artNo?.trim()) return [];
  return setMapByArtNo[normalizeArtNo(artNo)] ?? [];
}
