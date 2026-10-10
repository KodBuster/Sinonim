# SYNONYM — media shipped with Next.js

This directory contains **editorial and marketing assets only**.
**Product images, SKU photos, prices, sizes, availability and variants remain sourced from AdvantShop.**

Edit `src/config/synonym-media.json` to connect uploaded media to Hero, promotions, social video and blog.

Upload destinations:
- `hero/desktop/`, `hero/mobile/` — three responsive campaign banners;
- `promotions/desktop/`, `promotions/mobile/` — three editorial promotions;
- `influencers/video/`, `influencers/poster/` — influencer clips, preview images;
- `blog/images/` — articles and editorial covers;
- `brand/images/`, `brand/video/` — future stories, collection visuals.

Do not place real product photos here; they are loaded from AdvantShop.
Do not put secrets or confidential materials in public media folders. Anything in `public/` is public after deployment.
See `docs/SYNONYM_MEDIA_WORKFLOW.md` for exact sizes, licenses, naming, revisioning and approval gates.
