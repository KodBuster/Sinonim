# SYNONYM — этап 02: Next.js preview

Branch: redesign/synonym-v02

Routes:
- /redesign-preview — new editorial homepage
- /redesign-preview/catalog — filterable real catalog preview
- /redesign-preview/product/[slug] — product page reusing existing ProductGallery, ProductConfigurator, ProductSelectionProvider and CartContext

The preview is marked noindex/nofollow. The public /, /shop, /products, /cart, /checkout and /api routes are untouched.

Data integrity: preview catalog is loaded using AdvantShop directly, without production fallback to hard-coded PRODUCTS. If the API is unavailable, the preview displays an honest empty state. Product page is looked up using real AdvantShop products, existing stock and size logic. No payment settings are changed.

The preview currently uses media already checked into public/images. These are temporary editorial assets until new campaign photo/video gets explicit approval. No product SKU photography is artificially replaced.

Before approval: run npm ci, npm run lint, npx tsc --noEmit and npm run build in a safe local or staging environment. Test 360/390/430/768/1024/1440/1920 widths; header/menu, filters, real SKU/size/price, cart state, checkout integration and analytics. Audit server-authoritative totals, order sequence and YooKassa status handling separately before payment testing. Do not auto-deploy or merge to main.
