import { readFileSync, statSync, existsSync } from "node:fs";
import { resolve, relative, sep, extname, join } from "node:path";

const root = resolve(process.cwd(), "public");
const manifestFile = resolve(process.cwd(), "src/config/synonym-media.json");
const errors = [];
const warnings = [];
const paths = new Map();
const acceptedImages = new Set([".webp", ".avif", ".jpg", ".jpeg", ".png"]);
const acceptedVideos = new Set([".mp4", ".webm"]);
const required = {
  heroSlides: 3,
  promotions: 3,
  brandVideos: 1,
  blogCovers: 4,
};
const MB = 1024 * 1024;

let config;
try {
  config = JSON.parse(readFileSync(manifestFile, "utf8"));
} catch (error) {
  console.error("SYNONYM media manifest could not be read:", error.message);
  process.exit(1);
}

if (config.version !== 1) errors.push("Unsupported media manifest version");
for (const [section, minItems] of Object.entries(required)) {
  if (!Array.isArray(config[section]) || config[section].length < minItems) {
    errors.push(section + " needs at least " + minItems + " entries");
  }
}
if (config.heroSlides?.length !== 3) errors.push("Exactly 3 hero slides are required for the approved layout");
if (config.promotions?.length !== 3) errors.push("Exactly 3 promotions are required for the approved layout");

function asset(url, context, video = false) {
  if (url === null || url === undefined || url === "") return; // mobile art-direction is optional
  if (typeof url !== "string" || !/^\/(images|media)\//.test(url) || url.includes("..") || url.includes("?") || url.includes("#")) {
    errors.push(context + ": invalid public asset path " + String(url));
    return;
  }
  const physical = resolve(root, url.slice(1));
  if (!(physical === root || physical.startsWith(root + sep))) {
    errors.push(context + ": path escapes public/");
    return;
  }
  const ext = extname(physical).toLowerCase();
  if (!(video ? acceptedVideos : acceptedImages).has(ext)) {
    errors.push(context + ": unsupported " + (video ? "video" : "image") + " extension " + ext);
    return;
  }
  if (!existsSync(physical)) {
    errors.push(context + ": missing file public" + url);
    return;
  }
  const stats = statSync(physical);
  if (!stats.isFile() || stats.size === 0) {
    errors.push(context + ": file is empty or not a regular file " + url);
    return;
  }
  const buf = readFileSync(physical).subarray(0, 24);
  const signatureOk =
    ext === ".png" ? buf.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) :
    (ext === ".jpg" || ext === ".jpeg") ? buf[0] === 0xff && buf[1] === 0xd8 :
    ext === ".webp" ? buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP" :
    ext === ".avif" ? buf.toString("ascii", 4, 8) === "ftyp" && buf.toString("ascii", 8, 24).includes("avif") :
    ext === ".mp4" ? buf.toString("ascii", 4, 8) === "ftyp" :
    ext === ".webm" ? buf.subarray(0, 4).equals(Buffer.from([26,69,223,163])) : false;

  if (!signatureOk) errors.push(context + ": invalid media file signature " + url);
  const hardLimit = video ? 25 * MB : 5 * MB;
  if (stats.size > hardLimit) errors.push(context + ": exceeds upload policy (" + (stats.size / MB).toFixed(1) + " MB) " + url);
  else if (stats.size > (video ? 8 * MB : 1.5 * MB)) warnings.push(context + ": consider optimizing " + (stats.size / MB).toFixed(1) + " MB " + url);

  if (url.startsWith("/media/")) {
    const fileName = physical.split(sep).at(-1);
    if (!/^[a-z0-9][a-z0-9-]*-v\d{2}\.(avif|webp|jpg|jpeg|png|mp4|webm)$/.test(fileName)) {
      errors.push(context + ": files in public/media must use lowercase kebab-case and version suffix (-v01): " + url);
    }
  }
  paths.set(url, (paths.get(url) ?? 0) + 1);
}
function internalHref(href, context) {
  if (typeof href !== "string" || !href.startsWith("/") || href.startsWith("//")) errors.push(context + ": href must be an internal path");
}
function unique(items, section) {
  const seen = new Set();
  for (const [index, item] of (items ?? []).entries()) {
    const at = section + "[" + index + "]";
    if (!item?.id || typeof item.id !== "string") errors.push(at + ": missing ID");
    else if (seen.has(item.id)) errors.push(at + ": duplicate ID " + item.id);
    else seen.add(item.id);
  }
}
for (const section of Object.keys(required)) unique(config[section], section);

for (const [i, item] of (config.heroSlides ?? []).entries()) {
  const at = "heroSlides[" + i + "]";
  asset(item.desktopSrc, at + ".desktopSrc");
  asset(item.mobileSrc, at + ".mobileSrc");
  internalHref(item.href, at);
  if (!item.alt || !item.heading || !item.cta) errors.push(at + ": missing copy or image alt");
}
for (const [i, item] of (config.promotions ?? []).entries()) {
  const at = "promotions[" + i + "]";
  asset(item.src, at + ".src");
  asset(item.mobileSrc, at + ".mobileSrc");
  internalHref(item.href, at);
  if (!item.alt || !item.title || !item.cta) errors.push(at + ": missing copy or image alt");
}
for (const [i, item] of (config.brandVideos ?? []).entries()) {
  const at = "brandVideos[" + i + "]";
  asset(item.video, at + ".video", true);
  asset(item.poster, at + ".poster");
  if (!["brand-demo","influencer-approved"].includes(item.kind)) errors.push(at + ": unknown video kind");
  if (item.kind === "influencer-approved" && !item.approvalRef) errors.push(at + ": approved influencer videos need a non-secret approval reference");
  if (item.productSlug && typeof item.productSlug !== "string") errors.push(at + ": productSlug must be a real catalog slug");
  if (!item.label) errors.push(at + ": missing label");
}
for (const [i, item] of (config.blogCovers ?? []).entries()) {
  const at = "blogCovers[" + i + "]";
  asset(item.src, at + ".src");
  internalHref(item.href, at);
  if (!item.alt || !item.title) errors.push(at + ": missing title or image alt");
}

for (const [file, count] of paths) {
  if (count >= 3) warnings.push("Image/video used in " + count + " placements: " + file + " (replace repeating temporary media before release)");
}

console.log("SYNONYM media check | asset URLs: " + paths.size);
for (const warning of warnings) console.warn("WARN: " + warning);
for (const error of errors) console.error("ERROR: " + error);
if (errors.length) {
  console.error("FAILED: " + errors.length + " media manifest errors");
  process.exitCode = 1;
} else {
  console.log("PASS: media manifest references, types, local files, size limits and signatures");
}
