# Repository Discovery Audit

Operating mode: audit-only; no source edits; reports folder only; evidence-required; source-code mutation forbidden. No AGENTS.md was found (E036).

## Detected Stack

- Framework: Next.js App Router (E001).
- Language: TypeScript/TSX, Prisma schema, JavaScript/MJS scripts (E001, E003).
- Package manager: npm with package-lock.json.
- Database/ORM: Prisma/PostgreSQL (E003).
- Auth: NextAuth v5 beta with Prisma adapter, Google OAuth, credentials login, JWT sessions (E004).

## Important Scripts

- dev: next dev
- build: next build
- start: next start
- lint: next lint
- typecheck: tsc --noEmit -p tsconfig.typecheck.json
- test: tsx --test tests/**/*.test.ts
- db:migrate: prisma migrate dev
- db:push: prisma db push
- db:seed: tsx prisma/seed.ts
- db:reset-signals: node scripts/reset-commerce-signals.mjs
- db:studio: prisma studio
- db:reset: prisma migrate reset --force && tsx prisma/seed.ts
- postinstall: prisma generate

## File Coverage

- First-party file count: 292
- Inspected text/source/config/schema/test/content file count: 254
- Skipped/cataloged file count: 38

## Route Map

route | file
--- | ---
/admin/banners/:id | src/app/(admin)/admin/banners/[id]/page.tsx
/admin/banners/new | src/app/(admin)/admin/banners/new/page.tsx
/admin/banners | src/app/(admin)/admin/banners/page.tsx
/admin/categories/:id | src/app/(admin)/admin/categories/[id]/page.tsx
/admin/categories/new | src/app/(admin)/admin/categories/new/page.tsx
/admin/categories | src/app/(admin)/admin/categories/page.tsx
/admin/content/:id | src/app/(admin)/admin/content/[id]/page.tsx
/admin/content/new | src/app/(admin)/admin/content/new/page.tsx
/admin/content | src/app/(admin)/admin/content/page.tsx
/admin/coupons/:id | src/app/(admin)/admin/coupons/[id]/page.tsx
/admin/coupons/new | src/app/(admin)/admin/coupons/new/page.tsx
/admin/coupons | src/app/(admin)/admin/coupons/page.tsx
/admin/dashboard | src/app/(admin)/admin/dashboard/page.tsx
/admin/flash-sales/:id | src/app/(admin)/admin/flash-sales/[id]/page.tsx
/admin/flash-sales/new | src/app/(admin)/admin/flash-sales/new/page.tsx
/admin/flash-sales | src/app/(admin)/admin/flash-sales/page.tsx
/admin/inventory | src/app/(admin)/admin/inventory/page.tsx
/admin/notifications | src/app/(admin)/admin/notifications/page.tsx
/admin/orders/:id | src/app/(admin)/admin/orders/[id]/page.tsx
/admin/orders | src/app/(admin)/admin/orders/page.tsx
/admin | src/app/(admin)/admin/page.tsx
/admin/products/:id | src/app/(admin)/admin/products/[id]/page.tsx
/admin/products/new | src/app/(admin)/admin/products/new/page.tsx
/admin/products | src/app/(admin)/admin/products/page.tsx
/admin/reports | src/app/(admin)/admin/reports/page.tsx
/admin/returns/:id | src/app/(admin)/admin/returns/[id]/page.tsx
/admin/returns | src/app/(admin)/admin/returns/page.tsx
/admin/reviews | src/app/(admin)/admin/reviews/page.tsx
/admin/settings | src/app/(admin)/admin/settings/page.tsx
/admin/users/:id | src/app/(admin)/admin/users/[id]/page.tsx
/admin/users | src/app/(admin)/admin/users/page.tsx
/about | src/app/(store)/about/page.tsx
/account/addresses | src/app/(store)/account/addresses/page.tsx
/account/orders/:id | src/app/(store)/account/orders/[id]/page.tsx
/account/orders | src/app/(store)/account/orders/page.tsx
/account | src/app/(store)/account/page.tsx
/account/profile | src/app/(store)/account/profile/page.tsx
/auth/login | src/app/(store)/auth/login/page.tsx
/auth/register | src/app/(store)/auth/register/page.tsx
/cart | src/app/(store)/cart/page.tsx
/category/:slug | src/app/(store)/category/[slug]/page.tsx
/category | src/app/(store)/category/page.tsx
/checkout | src/app/(store)/checkout/page.tsx
/compare | src/app/(store)/compare/page.tsx
/contact | src/app/(store)/contact/page.tsx
/deals | src/app/(store)/deals/page.tsx
/faq | src/app/(store)/faq/page.tsx
/help | src/app/(store)/help/page.tsx
/new-arrivals | src/app/(store)/new-arrivals/page.tsx
/order/:orderNumber/confirmation | src/app/(store)/order/[orderNumber]/confirmation/page.tsx
/ | src/app/(store)/page.tsx
/privacy | src/app/(store)/privacy/page.tsx
/products/:slug | src/app/(store)/products/[slug]/page.tsx
/returns | src/app/(store)/returns/page.tsx
/search | src/app/(store)/search/page.tsx
/shipping | src/app/(store)/shipping/page.tsx
/terms | src/app/(store)/terms/page.tsx
/track-order | src/app/(store)/track-order/page.tsx
/wishlist | src/app/(store)/wishlist/page.tsx

## API / Backend Map

api_route | file
--- | ---
/api/account/addresses/:id | src/app/api/account/addresses/[id]/route.ts
/api/account/addresses | src/app/api/account/addresses/route.ts
/api/account/profile | src/app/api/account/profile/route.ts
/api/admin/banners/:id | src/app/api/admin/banners/[id]/route.ts
/api/admin/banners | src/app/api/admin/banners/route.ts
/api/admin/categories/:id | src/app/api/admin/categories/[id]/route.ts
/api/admin/categories | src/app/api/admin/categories/route.ts
/api/admin/content/:id | src/app/api/admin/content/[id]/route.ts
/api/admin/content | src/app/api/admin/content/route.ts
/api/admin/coupons/:id | src/app/api/admin/coupons/[id]/route.ts
/api/admin/coupons | src/app/api/admin/coupons/route.ts
/api/admin/flash-sales/:id | src/app/api/admin/flash-sales/[id]/route.ts
/api/admin/flash-sales | src/app/api/admin/flash-sales/route.ts
/api/admin/inventory/products/:id | src/app/api/admin/inventory/products/[id]/route.ts
/api/admin/notifications/:id | src/app/api/admin/notifications/[id]/route.ts
/api/admin/notifications | src/app/api/admin/notifications/route.ts
/api/admin/orders/:id/payment-status | src/app/api/admin/orders/[id]/payment-status/route.ts
/api/admin/orders/:id/status | src/app/api/admin/orders/[id]/status/route.ts
/api/admin/products/:id | src/app/api/admin/products/[id]/route.ts
/api/admin/products | src/app/api/admin/products/route.ts
/api/admin/reports/export | src/app/api/admin/reports/export/route.ts
/api/admin/reports | src/app/api/admin/reports/route.ts
/api/admin/returns/:id | src/app/api/admin/returns/[id]/route.ts
/api/admin/returns | src/app/api/admin/returns/route.ts
/api/admin/reviews/:id | src/app/api/admin/reviews/[id]/route.ts
/api/admin/settings | src/app/api/admin/settings/route.ts
/api/admin/users/:id | src/app/api/admin/users/[id]/route.ts
/api/admin/users | src/app/api/admin/users/route.ts
/api/auth/:...nextauth | src/app/api/auth/[...nextauth]/route.ts
/api/auth/register | src/app/api/auth/register/route.ts
/api/contact | src/app/api/contact/route.ts
/api/coupons/validate | src/app/api/coupons/validate/route.ts
/api/newsletter | src/app/api/newsletter/route.ts
/api/orders | src/app/api/orders/route.ts
/api/products/:id/view | src/app/api/products/[id]/view/route.ts
/api/products | src/app/api/products/route.ts
/api/returns | src/app/api/returns/route.ts
/api/reviews | src/app/api/reviews/route.ts
/api/search/suggestions | src/app/api/search/suggestions/route.ts

## Database / Model Map

- Enums: Role, OrderStatus, PaymentStatus, PaymentMethod, SellerStatus, ReviewStatus, CouponType, ReturnStatus, NotificationType
- Models: User, Account, Session, VerificationToken, PasswordResetToken, Address, Seller, Category, Brand, Product, ProductView, ProductImage, ProductVariant, VariantOption, ProductAttribute, ProductSpec, FlashSale, FlashSaleItem, Cart, CartItem, Wishlist, WishlistItem, CompareItem, RecentlyViewed, Order, OrderItem, OrderStatusHistory, Payment, ReturnRequest, Review, Coupon, Banner, HomepageSection, ShippingZone, ShippingSettings, Notification, Setting, AuditLog, ContactMessage, NewsletterSubscriber
- Missing explicit shipment event, invoice, fraud, payout, and webhook event models (E051).

## Auth / Session Map

- NextAuth Google/Credentials + Prisma adapter (E004).
- Middleware cookie-prefix gate for /admin and /account (E005).
- Admin layout and API helper enforce ADMIN/SUPER_ADMIN (E006, E007).

## RBAC Map

- CUSTOMER, SELLER, ADMIN, SUPER_ADMIN are modeled (E003).
- SUPER_ADMIN protection found in user management (E028).
- Seller route/API area not found (E031).

## Buyer / Seller / Admin / Super-Admin Map

- Buyer: cart, checkout, wishlist, compare, account, orders, product/category/search.
- Admin: dashboard, products, inventory, categories, banners, flash sales, coupons, orders, returns, reviews, users, notifications, content, reports, settings.
- Seller: not found in route scan (E031).

## SEO Map

Dynamic sitemap/robots, product/category metadata, Product/Breadcrumb/Organization/WebSite JSON-LD exist (E011-E017). Search/faceted canonical policy needs work (E017, E018).

## Performance-Sensitive Files

Home, product detail, category, search, ProductCard, ProductDetailClient, sitemap, image processing (E015-E018, E027).

## Security-Sensitive Files

Auth, middleware, admin utilities/routes, rate limit, orders/reviews/returns/account APIs, .env key names (E004-E010, E019-E025, E059).

## Payment / Tracking Readiness Files

Payment config, checkout, orders, admin payment status route, schema Order/Payment/Shipping fields. No webhook route found (E019-E021, E043, E050, E051).

## Unknowns and Assumptions

1. Production build output and route compilation were not verified because build writes .next outside audit-reports. Evidence: E035.
2. Browser/mobile visual checks, accessibility scans, and Core Web Vitals were not run. Evidence: E045, E054.
3. Live payment, tracking, email, SMS, and production DB services were not called by rule. Evidence: E046.
4. Dependency advisory audit was skipped because no local audit script exists and registry access was not needed. Evidence: E047.
5. Deployment provider settings, CDN behavior, production secret stores, and real cache headers were not verified. Evidence: E055.
6. Seller onboarding/product/order dashboards were not verified because no seller route area was found. Evidence: E031.
7. Google Merchant Center feed output was not found or generated. Evidence: E043, E000.
8. Fraud/risk scoring and shipment event ingestion were not verified; schema lacks explicit event models. Evidence: E051.
9. Payment webhook signature handling was not verified because no webhook route was found. Evidence: E043.
10. No E2E buyer/seller/admin/super-admin browser journey was executed. Evidence: E044, E054.
