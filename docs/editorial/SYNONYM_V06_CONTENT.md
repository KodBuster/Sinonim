# SYNONYM v06 — editorial campaign / curated media staging

## Status

**Editorial pack created, but not uploaded to repository.** The current live media manifest remains untouched. Binary images are provided separately in \`SYNONYM_v06_EDITORIAL_MEDIA_PACK.zip\`. New images are NOT a proof of actual jewelry geometry or packaging.

## Curated campaign assets

| Section | Files in pack | Subject |
| --- | --- | --- |
| Hero 01 | \`hero-01-v01.webp\` desktop+mobile | Model, ivory linen, silver jewelry, warm natural light, room for copy |
| Hero 02 | \`hero-02-v01.webp\` desktop+mobile | Silver jewelry on warm stone with olive and terracotta studio scene |
| Hero 03 | \`hero-03-v01.webp\` desktop+mobile | Opening a gift, model and olive box, editorial story |
| Promo price | \`promo-price-v01.webp\` desktop+mobile | Silver-toned rings |
| Promo sets | \`promo-sets-v01.webp\` desktop+mobile | Stud earrings and silver jewelry |
| Promo gifts | \`promo-gifts-v01.webp\` desktop+mobile | Thin bracelet on wrist |
| Blog covers | \`blog-brand/sizes/guide/care-v01.webp\` | Four distinct brand stories |

Total: **16 WebP images**. Keep \`brandVideos\` unchanged: influencer videos will be added later; central autoplay logic remains.

## Merchandise reference (public SYNONYM shop; data is NOT copied into product catalog)

The following live product pages were verified for editorial **reference**. They are not yet accurately pictured in generated campaigns:

- Ring SKU base \`191-048025\`, silver 925, round cut, 0.05g diamond: https://synonym-jewelry.ru/products/koltso-iz-serebra-925-s-ogranennym-sinteticheskim-almazom-0-05-g-0-25-karat-serebro-925-11545
- Earrings SKU \`JYE60210L\`: https://synonym-jewelry.ru/products/sergi-s-brilliantom-0-2-karat-serebro-925-12895
- Necklace SKU base \`JYN60328L\`: https://synonym-jewelry.ru/products/kole-0-2-karat-serebro-925-12890
- Bracelet SKU base \`JYB50576L\`: https://synonym-jewelry.ru/products/braslet-s-brilliantom-0-2-karat-serebro-925-12894

**Commerce boundary:** All purchasable SKU photos, prices, sizes, stock, and variations stay server-side in AdvantShop. No direct SKU links from model lifestyle photos until exact appearance is confirmed against supplier images. The photo story must NEVER show synthetic/yellow-gold products as the actual silver-925 catalog item. Do not claim the concept gift box is the real delivery packaging.

## Install and activate after owner review

1. In branch \`redesign/synonym-v02\`, upload the ZIP's \`public/media/hero/\`, \`public/media/promotions/\`, \`public/media/blog/\` to the matching paths of the repository.
2. Run \`npm run media:v06:activate\`. This fails unless all **16** files are present. The checked-in \`src/config/synonym-media.json\` does **not** change until this step.
3. Run \`npm run media:check\`, \`npm run brand:check\`, \`npx tsc --noEmit\`, \`npm run build\` and browser QA.
4. Review mobile crop and contrast for all Hero slides on 390px, desktop on 1440px, blog and promo sections, then approve a separate merge.

## Generated media constraints

These are *concept photographs* based on the visual brandbook, **not** retouched factual photographs of identified products. For precise model-with-SKU imagery later, request clear studio photo from AdvantShop for each exact SKU, use image-editing compositing with shape-locked reference, and visually verify gemstone setting before calling it the same item.

## Future work

- Verify each model-with-product visual using the exact product photos.
- Replace editorial gift packaging concept with actual packaging after confirmation.
- Add influencer videos in the separate video carousel when provided.
- Run real catalog checkout-flow QA only in a protected server-side test environment; no API secrets in this repository.
