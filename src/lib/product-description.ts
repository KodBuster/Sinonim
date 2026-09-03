const HTML_ENTITIES: Record<string, string> = {
  "&nbsp;": " ",
  "&ndash;": "-",
  "&mdash;": "-",
  "&laquo;": "«",
  "&raquo;": "»",
  "&lsquo;": "‘",
  "&rsquo;": "’",
  "&ldquo;": "“",
  "&rdquo;": "”",
  "&hellip;": "…",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
};

/** Плоский текст для карточки товара: без HTML-тегов и с дефисом «-» вместо тире. */
export function normalizeProductDescription(text: string): string {
  let result = text
    .replace(/<\/?(p|div|li|ul|ol|h[1-6])[^>]*>/gi, " ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "");

  for (const [entity, value] of Object.entries(HTML_ENTITIES)) {
    result = result.replaceAll(entity, value);
  }

  result = result.replace(/&#(\d+);/g, (_, code) =>
    String.fromCharCode(Number(code)),
  );
  result = result.replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
    String.fromCharCode(Number.parseInt(hex, 16)),
  );
  result = result.replace(/[—–]/g, "-");
  result = result.replace(/\s+/g, " ").trim();

  return result;
}

export type DescriptionSegment =
  | { type: "visible"; text: string }
  | { type: "seoHidden"; text: string };

/**
 * Разбивает описание на обычный текст и SEO-фрагменты в двойных квадратных скобках [[...]].
 * Скрытый текст остаётся в DOM (для индексации), визуально белый.
 */
export function splitDescriptionForSeoDisplay(
  text: string,
): DescriptionSegment[] {
  const normalized = normalizeProductDescription(text);
  if (!normalized) return [];

  const segments: DescriptionSegment[] = [];
  const pattern = /\[\[([\s\S]*?)\]\]/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(normalized)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: "visible",
        text: normalized.slice(lastIndex, match.index),
      });
    }
    const hidden = match[1]?.trim();
    if (hidden) {
      segments.push({ type: "seoHidden", text: `[[${hidden}]]` });
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < normalized.length) {
    segments.push({ type: "visible", text: normalized.slice(lastIndex) });
  }

  return segments.length ? segments : [{ type: "visible", text: normalized }];
}
