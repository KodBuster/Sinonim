/**
 * Generate SEO product titles + descriptions for Sinonim catalog → Excel
 * Source: live catalog JSON from synonym-jewelry.ru/api/catalog
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import ExcelJS from "exceljs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CATALOG_URL =
  process.env.CATALOG_URL || "https://synonym-jewelry.ru/api/catalog";
const EXISTING_PATH = path.join(
  __dirname,
  "..",
  "docs",
  "SEO-opisaniya-vseh-tovarov-Sinonim.xlsx"
);
const OUT_PATH = process.env.SEO_OUT_PATH || EXISTING_PATH;

/**
 * ПП РФ �-657 от 30.05.2026 (с 01.09.2026):
 * — для синтетики: только «ограненный синтетический алмаз» (+ слово «синтетический»);
 * — запрещены «бриллиант» и производные для искусственных вставок;
 * — нельзя указывать качественно-цветовые характеристики;
 * — вес только в граммах.
 */
const PP657_REPLACEMENTS = [
  [/с лабораторным\s*\(выращенным\)\s*бриллиантом/gi, "с ограненным синтетическим алмазом"],
  [/с лабораторными бриллиантами/gi, "с ограненными синтетическими алмазами"],
  [/с лабораторным бриллиантом/gi, "с ограненным синтетическим алмазом"],
  [/лабораторными бриллиантами/gi, "ограненными синтетическими алмазами"],
  [/лабораторных бриллиантов/gi, "ограненных синтетических алмазов"],
  [/лабораторных бриллианта/gi, "ограненных синтетических алмазов"],
  [/лабораторным бриллиантом/gi, "ограненным синтетическим алмазом"],
  [/лабораторного бриллианта/gi, "ограненного синтетического алмаза"],
  [/лабораторный бриллиант/gi, "ограненный синтетический алмаз"],
  [/выращенными бриллиантами/gi, "ограненными синтетическими алмазами"],
  [/выращенных бриллиантов/gi, "ограненных синтетических алмазов"],
  [/выращенный бриллиант/gi, "ограненный синтетический алмаз"],
  [/выращенные бриллианты/gi, "ограненные синтетические алмазы"],
  [/синтетическими бриллиантами/gi, "ограненными синтетическими алмазами"],
  [/синтетический бриллиант/gi, "ограненный синтетический алмаз"],
  [/искусственным бриллиантом/gi, "ограненным синтетическим алмазом"],
  [/искусственные бриллианты/gi, "ограненные синтетические алмазы"],
  [/бриллиантовой дорожкой/gi, "дорожкой из ограненных синтетических алмазов"],
  [/бриллиантовой композицией/gi, "композицией из ограненных синтетических алмазов"],
  [/бриллиантовым акцентом/gi, "световым акцентом из ограненных синтетических алмазов"],
  [/рядом с бриллиантами/gi, "рядом с ограненными синтетическими алмазами"],
  [/вокруг бриллианта/gi, "вокруг камня"],
  [/рядом с бриллиантом/gi, "рядом с ограненным синтетическим алмазом"],
  [/с ограненный синтетический алмаз/gi, "с ограненным синтетическим алмазом"],
  [/с ограненные синтетические алмазы/gi, "с ограненными синтетическими алмазами"],
];

const PP657_FORBIDDEN_PATTERNS = [
  /бриллиант/gi,
  /лабораторн/gi,
  /выращен/gi,
  /природн/gi,
  /натуральн/gi,
  /настоящ/gi,
  /подлинн/gi,
  /естественн/gi,
  /экологич/gi,
  /цвет\s+\d/gi,
  /чистот[аы]\s+\d/gi,
  /\d\s*\/\s*\d\s*А?/gi,
];

function applyPp657Compliance(text) {
  let result = text;
  for (const [pattern, replacement] of PP657_REPLACEMENTS) {
    result = result.replace(pattern, replacement);
  }
  // Убрать сравнения с природными камнями и QC-формулировки
  result = result
    .replace(/[,.]?\s*цвет\s+[^.;,\n]+/gi, "")
    .replace(/[,.]?\s*чистот[аы]\s+[^.;,\n]+/gi, "")
    .replace(/[^.]*природн[^.]*\./gi, "")
    .replace(/[^.]*натуральн[^.]*\./gi, "")
    .replace(/[^.]*идентичн[^.]*природн[^.]*\./gi, "")
    .replace(/[^.]*тот же углерод[^.]*\./gi, "")
    .replace(/[^.]*выгоднее по цене[^.]*:/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.])/g, "$1")
    .trim();
  return result;
}

function parseRuNumber(value) {
  return Number(String(value).replace(",", "."));
}

/** 1 карат = 0,2 г */
function formatGrams(caratWeight) {
  const carat =
    caratWeight == null || Number.isNaN(caratWeight) ? 0.2 : Number(caratWeight);
  const grams = carat * 0.2;
  return grams.toLocaleString("ru-RU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  });
}

/** Для уже готовых текстов: ct / карат → г */
function replaceCaratsWithGramsInText(text) {
  let result = text.replace(
    /(\d+(?:[,.]\d+)?)\s*ct\b/gi,
    (_, n) => `${formatGrams(parseRuNumber(n))} г`
  );
  result = result.replace(
    /(\d+(?:[,.]\d+)?)\s*карат(?:а|ов)?\b/gi,
    (_, n) => `${formatGrams(parseRuNumber(n))} г`
  );
  result = result.replace(/каратности/gi, "массы");
  return result;
}

function finalizeSeoText(text) {
  return replaceCaratsWithGramsInText(applyPp657Compliance(text)).replace(
    /[—–]/g,
    "-",
  );
}

function validatePp657Compliance(text, context = "") {
  const violations = [];
  for (const pattern of PP657_FORBIDDEN_PATTERNS) {
    const m = text.match(pattern);
    if (m) violations.push(`${context}: «${m[0]}»`);
  }
  return violations;
}

function insertLabel(stoneCount, { withPreposition = false } = {}) {
  if (stoneCount <= 1) {
    return withPreposition
      ? "с ограненным синтетическим алмазом"
      : "ограненный синтетический алмаз";
  }
  return withPreposition
    ? "с ограненными синтетическими алмазами"
    : "ограненные синтетические алмазы";
}

function formatPrice(n) {
  return `${Math.round(n).toLocaleString("ru-RU")} ₽`;
}

function parsePassport(description = "") {
  const d = description.replace(/\s+/g, " ").trim();
  let stoneCount = 1;
  const countMatch = d.match(/^(\d+)\s*Брил/i) || d.match(/(\d+)\s*Брил/i);
  if (countMatch) stoneCount = Number(countMatch[1]);
  else if (/^Брил/i.test(d) || /^1\s*Брил/i.test(d)) stoneCount = 1;

  const colorClarity =
    (d.match(/(\d)\s*\/\s*(\d)\s*А?/i) || []).slice(1, 3).join("/") || "2/5";
  const [color, clarityRaw] = colorClarity.split("/");
  const clarity = clarityRaw?.includes("А") ? clarityRaw : `${clarityRaw}А`;

  const cut = /Кр[.\-]?57|Кр\s*57/i.test(d) ? "Кр-57" : "круглая";
  const rhodium = /родир/i.test(d);

  return {
    stoneCount,
    color: color || "2",
    clarity: clarity || "5А",
    cut,
    rhodium,
  };
}

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function pick(arr, seed) {
  return arr[seed % arr.length];
}

function sizeRange(sizeOptions) {
  if (!sizeOptions?.length) return null;
  const labels = sizeOptions.map((s) => s.label || s.value);
  if (labels.length === 1) return labels[0];
  return `${labels[0]}-${labels[labels.length - 1]}`;
}

function inferRingStyle(stoneCount, carat) {
  if (stoneCount <= 1) {
    if (carat >= 0.5) return "классический солитер с выразительным камнем";
    return "классический солитер";
  }
  if (stoneCount <= 4) return "модель с центральным акцентом и боковыми камнями";
  if (stoneCount <= 12) return "кольцо с дорожкой из ограненных синтетических алмазов";
  return "кольцо с насыщенной россыпью ограненных синтетических алмазов";
}

function inferEarringStyle(stoneCount) {
  if (stoneCount <= 2) return "пусеты";
  if (stoneCount <= 10) return "пусеты с россыпью";
  return "серьги с выраженной композицией из ограненных синтетических алмазов";
}

function inferBraceletStyle(stoneCount, carat) {
  if (stoneCount >= 40 || carat >= 1.5) return "теннисный";
  if (stoneCount >= 10) return "близкий к теннисному формату";
  if (stoneCount >= 5) return "с акцентной дорожкой";
  return "цепной со световым акцентом из ограненных синтетических алмазов";
}

function inferPendantStyle(stoneCount) {
  if (stoneCount <= 1) return "солитер на цепи";
  if (stoneCount <= 5) return "подвес с несколькими камнями";
  return "колье с композицией из ограненных синтетических алмазов";
}

const RING_DESIGN = [
  "Тонкая гладкая шинка не перегружает палец и удобна для повседневной носки.",
  "Шинка сидит стабильно: кольцо не «гуляет» и комфортно под перчатки.",
  "Пропорции оправы подчёркивают камень — свет входит свободно, блеск читается на руке.",
  "Аккуратная посадка на пальце: модель смотрится легко и собирается в стек с другими кольцами.",
  "Сдержанный силуэт для ежедневного образа и как акцент к более нарядным украшениям.",
  "Оправа держит камень надёжно, при этом визуально оставляет максимум «воздуха» вокруг вставки.",
  "Баланс металла и камня рассчитан на долгую носку без ощущения тяжести.",
  "Лаконичный профиль шинки хорошо сочетается с обручальным или вторым тонким кольцом.",
];

const EARRING_DESIGN = [
  "Сидят близко к уху, не цепляются за волосы и ворот.",
  "Лёгкая посадка на мочке — комфортны на весь день.",
  "Пара выверена по симметрии: одинаковая игра света слева и справа.",
  "Компактный силуэт подходит и к повседневному образу, и к вечернему.",
  "Не утяжеляют мочку — удобный формат «надел и забыл».",
  "Родиевый блеск металла подчёркивает холодный тон ограненных синтетических алмазов.",
  "Аккуратная геометрия — серьги читаются как чистый световой акцент у лица.",
  "Хорошо стыкуются с кольцом или колье той же массы в один гарнитур.",
];

const BRACELET_DESIGN = [
  "На запястье ложится мягкой линией света — заметно, но без перегруза.",
  "Подвижная конструкция следует движению руки, камни ловят свет при каждом жесте.",
  "Универсальная длина линейки размеров позволяет подобрать посадку под обхват запястья.",
  "Работает соло как главный акцент и в слое с тонкими цепочками.",
  "Родиевое покрытие даёт платиновый оттенок металла рядом с ограненными синтетическими алмазами.",
  "Сдержанный ритм камней — уместно и в деловом, и в вечернем образе.",
  "Формат рассчитан на ежедневную носку: блеск есть, дискомфорта нет.",
  "Легко собирается в комплект с пусетами и кольцом той же линейки.",
];

const PENDANT_DESIGN = [
  "Подвес ложится у ключиц — чистый акцент на декольте.",
  "Длину цепи можно носить выше или ниже в зависимости от выреза.",
  "Минимум металла, максимум света камня на шее.",
  "Лёгкий подвес удобен под водолазку и под открытое платье.",
  "Солитер на цепи собирает взгляд в одну точку — без лишнего декора.",
  "Хорошо стыкуется с пусетами и кольцом той же массы.",
  "Родиевое покрытие сохраняет белый тон металла рядом с ограненным синтетическим алмазом.",
  "Формат «на каждый день» и одновременно готовый подарочный акцент.",
];

function buildSeoName(product, pass) {
  const grams = formatGrams(product.stoneWeight);
  const insert = insertLabel(pass.stoneCount, { withPreposition: true });
  switch (product.category) {
    case "rings": {
      const style =
        pass.stoneCount <= 1
          ? ""
          : pass.stoneCount <= 4
            ? " с боковыми камнями"
            : " с дорожкой";
      return `Кольцо из серебра 925 ${insert} ${grams} г${style}`;
    }
    case "earrings": {
      const style =
        pass.stoneCount <= 2 ? "-пусеты" : pass.stoneCount <= 10 ? "-пусеты" : "";
      return `Серьги${style} из серебра 925 ${insert} ${grams} г`;
    }
    case "bracelets": {
      const tennis =
        pass.stoneCount >= 40 || product.stoneWeight >= 1.5 ? " теннисный" : "";
      return `Браслет${tennis} из серебра 925 ${insert} ${grams} г`;
    }
    case "pendants":
      return `Колье из серебра 925 ${insert} ${grams} г`;
    default:
      return `${product.name} из серебра 925 ${insert} ${grams} г`;
  }
}

function buildInsertSpecs(pass, grams) {
  const label = insertLabel(pass.stoneCount);
  const countPart =
    pass.stoneCount > 1 ? `${pass.stoneCount} шт., общая масса` : "масса";
  return `${label}, ${countPart} ${grams} г, огранка ${pass.cut}`;
}

function buildSeoDescription(product) {
  const pass = parsePassport(product.description || "");
  const grams = formatGrams(product.stoneWeight);
  const seed = hashStr(product.artNo || product.id);
  const metal = "серебро 925, родиевое покрытие";
  const price = formatPrice(product.price);
  const sizes = sizeRange(product.sizeOptions);
  const hasSet = (product.setArtNos || []).length > 0;

  const trust =
    "Гарантия 2 года. Добровольная аттестация качества для изделий от 0,1 г. Доставка по России, примерка в шоуруме Синоним (Москва, ул. Гиляровского, 40).";

  if (product.category === "rings") {
    const style = inferRingStyle(pass.stoneCount, product.stoneWeight);
    const design = pick(RING_DESIGN, seed);
    const insert = insertLabel(pass.stoneCount, { withPreposition: true });
    const sizeLine = sizes
      ? `Размеры в наличии: ${sizes}.`
      : "Размер подбирается при заказе и в шоуруме.";
    return [
      `Кольцо из серебра 925 пробы ${insert} ${grams} г — ${style}. Огранка ${pass.cut}, сдержанный блеск и аккуратная посадка камня в оправе.`,
      `${design} ${sizeLine} Покрытие — родирование: белый зеркальный блеск и защита от потемнения.`,
      `Характеристики: металл — ${metal}; вставка — ${buildInsertSpecs(pass, grams)}; артикул ${product.artNo}.`,
      `${trust}${hasSet ? " Можно собрать в комплект с серьгами или колье той же линейки." : ""} Купить кольцо ${insert} — ${price}.`,
    ].join("\n\n");
  }

  if (product.category === "earrings") {
    const style = inferEarringStyle(pass.stoneCount);
    const design = pick(EARRING_DESIGN, seed);
    const insert = insertLabel(pass.stoneCount, { withPreposition: true });
    return [
      `Серьги из серебра 925 ${insert} общим весом ${grams} г — ${style}. Огранка ${pass.cut}, симметричная игра света в паре.`,
      `${design} Родирование сохраняет белый тон металла.`,
      `Характеристики: ${metal}; вставка — ${buildInsertSpecs(pass, grams)}; артикул ${product.artNo}.`,
      `${trust}${hasSet ? " Идеальны в комплект к кольцу или колье." : ""} Купить серьги ${insert} — ${price}.`,
    ].join("\n\n");
  }

  if (product.category === "bracelets") {
    const style = inferBraceletStyle(pass.stoneCount, product.stoneWeight);
    const design = pick(BRACELET_DESIGN, seed);
    const insert = insertLabel(pass.stoneCount, { withPreposition: true });
    const sizeLine = sizes
      ? `Доступные размеры: ${sizes}.`
      : "Длина подбирается под обхват запястья.";
    return [
      `Браслет из серебра 925 ${insert} ${grams} г — ${style}. Ряд камней огранки ${pass.cut}, ровный ритм света по запястью.`,
      `${design} ${sizeLine} Родирование защищает металл и усиливает холодный блеск вставок.`,
      `Характеристики: ${metal}; вставка — ${buildInsertSpecs(pass, grams)}; артикул ${product.artNo}.`,
      `${trust}${hasSet ? " Можно собрать в комплект с серьгами и кольцом." : ""} Купить браслет ${insert} — ${price}.`,
    ].join("\n\n");
  }

  // pendants / default
  const style = inferPendantStyle(pass.stoneCount);
  const design = pick(PENDANT_DESIGN, seed);
  const insert = insertLabel(pass.stoneCount, { withPreposition: true });
  const sizeLine = sizes
    ? `Длина цепи / размер: ${sizes}.`
    : "Длина цепи уточняется при заказе.";
  return [
    `Колье из серебра 925 ${insert} ${grams} г — ${style}. Огранка ${pass.cut}, чистый акцент на декольте.`,
    `${design} ${sizeLine} Родирование — стабильный белый блеск металла.`,
    `Характеристики: ${metal}; вставка — ${buildInsertSpecs(pass, grams)}; артикул ${product.artNo}.`,
    `${trust}${hasSet ? " Легко стыкуется с пусетами и кольцом той же массы." : ""} Купить колье ${insert} — ${price}.`,
  ].join("\n\n");
}

async function loadExistingSeo() {
  const map = new Map();
  if (!fs.existsSync(EXISTING_PATH)) return map;

  const readPath = process.env.SEO_EXISTING_READ_PATH || EXISTING_PATH;
  const wb = new ExcelJS.Workbook();
  try {
    await wb.xlsx.readFile(readPath);
  } catch (error) {
    if (error?.code === "EBUSY" && readPath === EXISTING_PATH) {
      const tmp = path.join(
        process.env.TEMP || "/tmp",
        "sinonim-seo-existing-copy.xlsx"
      );
      fs.copyFileSync(EXISTING_PATH, tmp);
      await wb.xlsx.readFile(tmp);
    } else {
      throw error;
    }
  }
  const ws = wb.worksheets[0];
  if (!ws) return map;

  ws.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const artNo = String(row.getCell(1).value ?? "").trim();
    if (!artNo) return;
    const seoName =
      row.getCell(2).value != null ? String(row.getCell(2).value).trim() : "";
    const seoDesc =
      row.getCell(3).value != null ? String(row.getCell(3).value).trim() : "";
    if (seoName || seoDesc) {
      map.set(artNo, { seoName, seoDesc });
    }
  });

  return map;
}

async function fetchCatalog() {
  const response = await fetch(CATALOG_URL);
  if (!response.ok) {
    throw new Error(`Catalog fetch failed: ${response.status} ${response.statusText}`);
  }
  const raw = await response.json();
  return (raw.products || []).filter((p) => p.category !== "gifts");
}

async function main() {
  const products = await fetchCatalog();

  // Stable sort: category order, then artNo
  const catOrder = { rings: 1, earrings: 2, pendants: 3, bracelets: 4 };
  products.sort(
    (a, b) =>
      (catOrder[a.category] || 9) - (catOrder[b.category] || 9) ||
      String(a.artNo).localeCompare(String(b.artNo), "ru")
  );

  const rows = products.map((p) => {
    const artNo = String(p.artNo ?? "").trim();
    const pass = parsePassport(p.description || "");
    const seoName = buildSeoName(p, pass);
    const seoDesc = buildSeoDescription(p);

    return {
      artNo,
      seoName: finalizeSeoText(seoName),
      seoDesc: finalizeSeoText(seoDesc),
      category: p.category,
    };
  });

  const violations = rows.flatMap((row) => [
    ...validatePp657Compliance(row.seoName, `${row.artNo} (название)`),
    ...validatePp657Compliance(row.seoDesc, `${row.artNo} (описание)`),
  ]);
  if (violations.length) {
    console.warn(`PP657: найдено ${violations.length} нарушений:`);
    console.warn(violations.slice(0, 30).join("\n"));
  }

  const wb = new ExcelJS.Workbook();
  wb.creator = "Sinonim SEO";
  wb.created = new Date();

  const ws = wb.addWorksheet("SEO описания", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  ws.columns = [
    { header: "артикул", key: "artNo", width: 16 },
    { header: "seo название", key: "seoName", width: 62 },
    { header: "seo описание", key: "seoDesc", width: 90 },
  ];

  const header = ws.getRow(1);
  header.font = { bold: true };
  header.alignment = { vertical: "middle", wrapText: true };
  header.height = 22;

  for (const row of rows) {
    const r = ws.addRow({
      artNo: row.artNo,
      seoName: row.seoName,
      seoDesc: row.seoDesc,
    });
    r.alignment = { vertical: "top", wrapText: true };
    r.height = 120;
  }

  const meta = wb.addWorksheet("сводка");
  meta.columns = [
    { header: "показатель", width: 28 },
    { header: "значение", width: 40 },
  ];
  const counts = {};
  for (const r of rows) counts[r.category] = (counts[r.category] || 0) + 1;
  for (const [k, v] of Object.entries(counts)) meta.addRow([`категория: ${k}`, v]);
  meta.addRow(["всего товаров", rows.length]);
  meta.addRow(["сгенерировано", rows.length]);
  meta.addRow(["нарушения ПП �-657", violations.length]);
  meta.addRow([]);
  meta.addRow([
    "примечание",
    "seo название = H1 AdvantShop; seo описание = Description",
  ]);
  meta.addRow([
    "терминология",
    "ПП РФ �-657: только «ограненный синтетический алмаз»; без «бриллиант», цвета/чистоты и сравнений с природными",
  ]);
  meta.addRow([
    "вес камня",
    "в названиях и описаниях: масса в граммах (1 ct = 0,2 г)",
  ]);
  meta.addRow([
    "источник",
    `${CATALOG_URL} · ${new Date().toISOString().slice(0, 10)}`,
  ]);

  await wb.xlsx.writeFile(OUT_PATH);
  console.log(`OK: ${rows.length} rows → ${OUT_PATH}`);
  console.log({ violations: violations.length, counts });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
