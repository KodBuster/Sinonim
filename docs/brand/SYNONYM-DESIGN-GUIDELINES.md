# SYNONYM DESIGN SYSTEM v05

## Source and scope

**Source of truth:** “Краткая информация по логотипу Синоним.pdf”, 7 pages provided by the brand. This document is a technical **application** of that source, not a new brandbook. Apply only within the preview route \`/redesign-preview\` until approval; do not modify production \`main\`, AdvantShop integrations, SKU product media, or checkout.

### Directly from the brandbook

* Page 1: **простые ценности; инновационные технологии; высокое качество**.
* Page 2: **современный демократичный подход к украшениям, сочетание технологий и экологичности**.
* Page 3: **#73A341** (основной оливково-зелёный), **#D47750** (терракота), **#E8D9B5** (песочный).
* Page 4: **Playfair Display** for headings, **Inter** for body text.
* Page 5: **#4A5335**, **#C96A4A**, **#E8D9B5** for logo versions. Monochrome black/white versions are permitted if necessary. Clear space at least the **height of the logo's lettermark O**. Screen logo width **at least 80px**. Use a light sand/white or contrasting neutral background; on busy backgrounds use a one-color version.
* Pages 6–7: preserve logo proportions; **no rotation, cropping, shadow, gradient, stroke, or unauthorized recoloring**. Approved appearance: color, black, white.

### Derived UI decisions, not in the brandbook

* CTA buttons: white on **#4A5335** (contrast approximately **8.14:1**), hover **#36402B**. Do **not** use white body text on **#73A341** (contrast ~2.98:1) or white on **#D47750** (~3.20:1); those are accents, decorative rules, and suitable backgrounds only when foreground contrast is verified.
* Page backgrounds: white and warm neutral surfaces; avoid replacing hero and product photography with decorative gradients.
* Brand accents: use bright green sparingly for selection and progress; terracotta for dividers, overlines and editorial warmth; sand for trust, editorial cards and footer.
* H1 and editorial headings: Playfair Display. Inter in navigation, filters, details and shopping controls; allow occasional uppercase small labels.
* Prefer >= 13px desktop / >= 12px mobile for shopping content; 11px allowed only for short micro-labels at sufficient contrast.
* Retain current homepage six-block order. **Do not change the four existing category-image cards on homepage**.
* Category PDP product images, product options, SKU, stock and price come **only from AdvantShop**; campaign images/video come only from the separate GitHub media manifest.
* Keep 3-hero slide behavior, central-video muted autoplay (where browser allows), checkout and accessibility semantics.
* Original logo is an image from \`/images/logo_20260527190756.png\`; do not recreate wordmark as standard typography.

## Token ownership

Technical CSS source: \`src/app/redesign-preview/brand-v05.css\`. Values are split into brandbook-derived \`--syn-brand-*\` and \`--syn-logo-*\`, and **separately identified** derived \`--syn-ink\`, \`--syn-surface-*\`, \`--syn-interactive\`.

Before adjusting any brand value, compare to the 7-page PDF and get brand owner approval. Before adjusting any **derived** design value, review its contrast and desktop/mobile screenshots.

## Acceptance

1. \`npm run brand:check\` passes, including logo in header and footer, no manual reconstructed lettermark, specified colors/fonts and text contrast.
2. \`npm run media:check\`, TypeScript, ESLint and production build pass.
3. Browser checks at 390px and 1440px confirm computed brand tokens, footer image, headings, default CTA contrast and intact home section ordering.
4. No horizontal page overflow, clipped headings or missing media. Existing product fixture remains non-purchasable.
5. Visually review \`/redesign-preview/styleguide\`, homepage, categories and PDP. New campaign photography is a **separate** approval step.
6. Production/main must not be changed without explicit sign-off.
