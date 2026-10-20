# SYNONYM VISUAL QA — BRAND v05

## Objective

Avoid functional regression while increasing fidelity to the **provided brandbook**. This is a manual-and-automated visual QA protocol, **not** a claim that visual artistry can be graded by CI alone.

## Automated

\`npm run brand:check\` verifies:
- exact three general and two logo brand swatches and both fonts;
- preview layout imports the v05 stylesheet;
- the existing logo **image** is present in the header and footer, never a plain text-only footer wordmark;
- accessible button dark-olive on white contrast; rejects white-on-bright-green and white-on-terracotta for primary text;
- the critical homepage category section markup remains unchanged;
- main source files / product media integrations do not need modification.

Playwright CI verifies:
- v05 computed CSS tokens on the preview route;
- heading typefaces, authentic footer image and minimum displayed logo width;
- three-banner and six-section home layout unchanged;
- category page H1 serif font and legibility;
- PDP button styling / accordion / gallery / sizes on explicitly enabled QA fixture;
- horizontal overflow, broken local image resources and visible text clipping at existing viewport widths.

## Manual screenshot comparisons (v04 → v05)

View **side by side**, especially at 390 and 1440px:
1. Header — original logo artwork readable, 80px minimum, generous clear space; announcement remains high-contrast.
2. Hero — title and CTA readable over artwork; no clipping; brand color shows through only where useful.
3. Four homepage categories — structure/images/cropping unchanged.
4. Bestsellers — real AdvantShop product photos only; don't infer readiness from empty preview.
5. Promotions + trust — stronger sand grounding, not exaggerated luxury styling; photos pending.
6. Social video — only center visible video plays, poster/controls accessible; influencers pending.
7. Blog and footer — avoid duplicate imagery once new approved editorial photography is uploaded; footer original logo.
8. Four collection pages — Playfair heading, usable filter text, stable 3-to-2-column responsive grid; product images/stock still need real AdvantShop integration testing.
9. PDP — accessible CTA and selected sizes, image zoom; no fake SKU/price; current demo fixture remains disabled for purchase.
10. Mobile sticky chat widget — verify against real running preview; chat comes from inherited global integration and must not be changed casually in production.

## Blockers to final visual signoff

* Approved editorial photos for 3 Hero slides / 3 promos / blog are not yet uploaded; v05 **does not pretend they are finished**.
* Real AdvantShop catalog QA requires a credentialled test environment managed by authorized site owner, no secret tokens in GitHub/chat.
* Brandbook is seven pages of logo and design basics, not a full digital product system; derived component decisions require owner review.
