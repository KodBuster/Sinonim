const HTML_ENTITIES: Record<string, string> = {
  "&nbsp;": " ",
  "&ndash;": "-",
  "&mdash;": "-",
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
