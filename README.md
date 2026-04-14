# BoilaBin — Full Stack E-Commerce Marketplace

A production-ready, premium e-commerce platform built with Next.js 15, TypeScript, Tailwind CSS, PostgreSQL, and Prisma. Designed for Bangladesh-first commerce with global scalability.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + CSS Variables |
| Database | PostgreSQL |
| ORM | Prisma 5 |
| Auth | NextAuth v5 (Credentials + Google OAuth) |
| State | Zustand (cart, wishlist, compare) |
| Fonts | DM Sans + Sora (Google Fonts) |
| Payments | COD, bKash, Nagad, SSLCommerz (structured), Stripe (structured) |
| Images | Next.js Image Optimization |

---

## Project Structure

```
boilabin-marketplace/
├── prisma/
│   ├── schema.prisma          # Full DB schema (25+ models)
│   └── seed.ts                # 20+ products, categories, brands, banners
├── src/
│   ├── app/
│   │   ├── (store)/           # Customer-facing pages
│   │   │   ├── page.tsx              # Homepage
│   │   │   ├── products/[slug]/      # Product detail
│   │   │   ├── category/[slug]/      # Category listing
│   │   │   ├── search/               # Search + filters
│   │   │   ├── cart/                 # Shopping cart
│   │   │   ├── checkout/             # Multi-step checkout
│   │   │   ├── wishlist/             # Wishlist
│   │   │   ├── deals/                # Flash deals
│   │   │   ├── new-arrivals/         # New products
│   │   │   ├── brands/               # Brand directory
│   │   │   ├── account/              # Customer dashboard
│   │   │   ├── auth/                 # Login, Register
│   │   │   ├── order/[number]/       # Order confirmation
│   │   │   ├── seller/register/      # Seller signup
│   │   │   ├── about/                # About page
│   │   │   ├── contact/              # Contact page
│   │   │   ├── faq/                  # FAQ
│   │   │   ├── terms/                # Terms of service
│   │   │   ├── privacy/              # Privacy policy
│   │   │   └── returns/              # Return policy
│   │   ├── (admin)/           # Admin panel
│   │   │   └── admin/
│   │   │       ├── dashboard/        # Analytics overview
│   │   │       ├── products/         # Product management
│   │   │       ├── orders/           # Order management
│   │   │       ├── categories/       # Category management
│   │   │       ├── brands/           # Brand management
│   │   │       ├── coupons/          # Coupon management
│   │   │       ├── reviews/          # Review moderation
│   │   │       ├── users/            # Customer management
│   │   │       ├── inventory/        # Stock management
│   │   │       ├── reports/          # Analytics
│   │   │       └── settings/         # Platform settings
│   │   ├── (seller)/          # Seller panel foundation
│   │   │   └── seller/
│   │   │       ├── dashboard/        # Seller overview
│   │   │       ├── products/         # Seller products
│   │   │       └── orders/           # Seller orders
│   │   └── api/               # API routes
│   │       ├── auth/                 # NextAuth + register
│   │       ├── products/             # Product CRUD
│   │       ├── orders/               # Order creation
│   │       ├── reviews/              # Review submission
│   │       ├── coupons/validate/     # Coupon validation
│   │       ├── search/suggestions/   # Autocomplete
│   │       └── admin/                # Admin APIs
│   ├── components/
│   │   ├── layout/            # Header, Footer
│   │   ├── home/              # Hero, Categories, FlashSale, etc.
│   │   ├── product/           # ProductCard, Detail, Reviews, Filters
│   │   ├── cart/              # CartDrawer
│   │   ├── admin/             # AdminSidebar, AdminHeader, etc.
│   │   └── shared/            # Reusable UI
│   ├── lib/
│   │   ├── auth/              # NextAuth config
│   │   ├── db/                # Prisma client singleton
│   │   ├── store/             # Zustand stores (cart, wishlist, compare)
│   │   └── utils/             # Formatting, helpers
│   ├── types/                 # TypeScript types + NextAuth extension
│   └── middleware.ts          # Route protection
├── .env.example               # All environment variables documented
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or pnpm

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd boilabin-marketplace
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Edit `.env` and fill in:
```env
# Required
DATABASE_URL="postgresql://username:password@localhost:5432/boilabin"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

# Optional at start (can add later)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
UPLOADTHING_SECRET=...
STRIPE_SECRET_KEY=...
BKASH_APP_KEY=...
```

### 3. Database Setup

```bash
# Create and migrate the database
npx prisma migrate dev --name init

# OR push schema without migrations (faster for dev)
npx prisma db push

# Seed with sample data (20+ products, categories, brands, banners)
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Access Credentials

After seeding, use these to log in:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@boilabin.com | Admin@123 |
| Customer | customer@example.com | Customer@123 |

**Admin Panel:** [http://localhost:3000/admin](http://localhost:3000/admin)

---

## Database Commands

```bash
# Open Prisma Studio (visual DB browser)
npm run db:studio

# Create a new migration
npm run db:migrate

# Reset DB and re-seed (WARNING: deletes all data)
npm run db:reset

# Generate Prisma client after schema changes
npx prisma generate
```

---

## Key Features

### Customer Experience
- Premium homepage with hero banner, flash sales, featured products
- Category tree with nested subcategories
- Advanced product search with 6+ filters + sort
- Product detail with image gallery, zoom, variant selection
- Real-time cart drawer with quantity management
- 3-step checkout (Address → Payment → Review)
- Guest checkout support
- Order confirmation + tracking page
- Wishlist and product comparison
- Customer account dashboard
- Order history

### Product System
- Full variant support (size, color, storage, etc.)
- Product attributes and specifications table
- Sale pricing with percentage badge calculation
- Stock tracking with low-stock indicators
- Recently viewed, related products
- Flash sale with countdown timer and sold quantity bar
- Coupon system (percentage + fixed amount)

### Review System
- Verified purchase badge (auto-detected from delivered orders)
- Star rating with distribution chart
- Admin moderation queue
- Auto-updates product rating after approval

### Admin Panel
- Real-time dashboard with revenue/order KPIs
- Order management with status updates + customer notifications
- Product and inventory management
- Category tree management
- Coupon creation and tracking
- Review moderation (approve/reject)
- Customer management
- Analytics and top product reports
- Feature flag system (enable/disable seller marketplace)

### Seller Foundation (Marketplace-Ready)
- Seller registration page with feature flag (disabled by default)
- `isFirstParty` flag on Seller model for own store
- Seller dashboard with revenue overview
- Approval workflow from admin
- `seller_mode` setting to enable marketplace without code changes

### Payment Architecture
The payment module is structured for easy integration:
```typescript
// Payment methods defined in src/types/index.ts
PAYMENT_GATEWAYS = [
  { id: 'CASH_ON_DELIVERY', ... },  // ✅ Active
  { id: 'BKASH', ... },             // ✅ UI ready, needs API keys
  { id: 'NAGAD', ... },             // ✅ UI ready, needs API keys
  { id: 'SSLCOMMERZ', ... },        // ✅ UI ready, needs API keys
  { id: 'STRIPE', ... },            // ⏳ Disabled until needed
]
```

To activate a gateway:
1. Add API keys to `.env`
2. Create `src/app/api/payments/[gateway]/route.ts`
3. Implement the webhook handler
4. Set gateway `isAvailable: true` in types

---

## Enabling Marketplace Mode

When ready to onboard third-party sellers (~6 months):

1. **Enable in Admin Settings:**
   Admin → Settings → Feature Flags → Enable Seller Marketplace ✓

2. **Seller registration becomes live** at `/seller/register`

3. **Admin approves sellers** via Admin → Sellers panel

4. **Sellers access** `/seller/dashboard` after approval

No code changes required — the entire architecture is already in place.

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | ✅ | Random 32+ char secret |
| `NEXTAUTH_URL` | ✅ | Your site URL |
| `GOOGLE_CLIENT_ID` | ⚡ | For Google OAuth |
| `GOOGLE_CLIENT_SECRET` | ⚡ | For Google OAuth |
| `UPLOADTHING_SECRET` | ⚡ | For file/image uploads |
| `STRIPE_SECRET_KEY` | ⚡ | For Stripe payments |
| `BKASH_APP_KEY` | ⚡ | For bKash integration |
| `NAGAD_MERCHANT_ID` | ⚡ | For Nagad integration |
| `SSLCOMMERZ_STORE_ID` | ⚡ | For SSLCommerz |

✅ Required | ⚡ Optional (can add later)

---

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Run migrations against your production DB
npx prisma migrate deploy
```

### Self-Hosted (Ubuntu/Nginx)

```bash
# Build
npm run build

# Start
npm start

# PM2
pm2 start npm --name "boilabin" -- start
pm2 save
```

**Nginx config:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Database (Production)

Use [Neon](https://neon.tech), [Supabase](https://supabase.com), or a VPS PostgreSQL instance.

```bash
# After setting production DATABASE_URL
npx prisma migrate deploy
npm run db:seed
```

---

## Customization Guide

### Changing Brand Colors
Edit `src/app/globals.css`:
```css
:root {
  --primary: 23 83% 55%;  /* Change HSL values */
}
```

### Adding a New Payment Gateway
1. Add env keys to `.env`
2. Add gateway to `PAYMENT_GATEWAYS` in `src/types/index.ts`
3. Create API route: `src/app/api/payments/[gateway]/route.ts`
4. Handle webhook at: `src/app/api/payments/[gateway]/webhook/route.ts`

### Adding a New Admin Feature
1. Create page: `src/app/(admin)/admin/[feature]/page.tsx`
2. Add to sidebar: `src/components/admin/AdminSidebar.tsx`
3. Create API: `src/app/api/admin/[feature]/route.ts`

---

## Security Notes

- All passwords hashed with bcrypt (12 rounds)
- JWT sessions with NEXTAUTH_SECRET
- Admin routes protected by middleware + session role check
- Input validation with Zod on all API routes
- SQL injection prevented by Prisma's parameterized queries
- CSRF protection built into NextAuth

---

## Sample Data Included

After seeding (`npm run db:seed`):
- **9 brands:** Apple, Samsung, Sony, Xiaomi, Dell, HP, Bose, Nike, Anker
- **15 categories:** Electronics, Mobile, Laptops, Audio, Wearables, Fashion, Home, Beauty, Sports, Gaming, Baby, Books
- **21 products:** iPhone 15 Pro, Galaxy S24 Ultra, Sony WH-1000XM5, PS5, Apple Watch, AirPods Pro, Dell XPS 15, and more
- **3 banners:** Hero carousel
- **1 flash sale:** Active with countdown
- **3 coupons:** WELCOME10, SAVE500, TECH20
- **4 reviews:** Approved reviews with verified purchase status
- **1 sample order:** Delivered order for demo customer
- **4 shipping zones:** Dhaka City, Dhaka Division, Chittagong, Others

---

## License

MIT — Build freely, customize fully.
Bash _Pointer main feact add react to jeson