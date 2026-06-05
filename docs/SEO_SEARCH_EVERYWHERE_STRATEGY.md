# Boilabin Search Everywhere Strategy

## What Search Everywhere Means

Search Everywhere Optimization means making Boilabin understandable across:

- Google Search;
- Google Images;
- Google Lens and product discovery;
- Bing;
- ChatGPT browsing and answers;
- Gemini-style answers;
- Perplexity-style answers;
- Claude-style web answers;
- AI crawlers and agents;
- social previews;
- product and merchant surfaces.

This is broader than old keyword SEO. The site needs crawlable pages, factual copy, consistent structured data, useful images, and stable product/category URLs.

## Official References Used

- Google product structured data: https://developers.google.com/search/docs/appearance/structured-data/product
- Google merchant listing structured data: https://developers.google.com/search/docs/appearance/structured-data/merchant-listing
- Google ecommerce SEO guides: https://developers.google.com/search/docs/specialty/ecommerce
- Google image SEO: https://developers.google.com/search/docs/appearance/google-images
- Google helpful content guidance: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Google sitemaps: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- Google robots.txt interpretation: https://developers.google.com/search/reference/robots_txt
- Next.js Image component: https://nextjs.org/docs/app/api-reference/components/image
- MDN image formats: https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Image_types
- web.dev AVIF guide: https://web.dev/learn/images/avif/

## Why Hype Copy Does Not Work

Unsupported trust, luxury, top-choice, and market-leader terms do not help if the page has no evidence. They make the page less specific and less useful.

Final rule for Boilabin: Search Everywhere Optimization means factual crawlable content plus structured data that matches visible page facts, not hype.

Better signals:

- clear product names;
- real brands/models;
- visible price and availability;
- shipping/return facts;
- product images that match the product;
- factual category descriptions;
- structured data that matches visible content.

## Crawlability Checklist

- Public product pages must be accessible without login.
- Public category pages must be accessible without login.
- Search/faceted pages should remain noindex unless deliberately approved.
- Private routes should stay blocked or noindexed.
- Images should be crawlable and not hidden behind auth.
- Canonical URLs should use `https://boilabin.com` for production/future indexing.
- Pages should not depend on client-only rendering for core product facts.

## Sitemap And Robots Checklist

- `robots.txt` should allow public pages and disallow private/admin/API routes.
- `robots.txt` should expose the sitemap URL.
- Sitemap should include public static pages, active products, and active categories.
- At scale, split sitemap output by type and count.
- Avoid including private utility routes or faceted URLs.

## Structured Data Checklist

Current useful types:

- Organization;
- WebSite with SearchAction;
- OnlineStore;
- BreadcrumbList;
- Product;
- Offer;
- ItemList;
- FAQPage.

Alignment rules:

- Product and Offer schema must come from current product inputs: name, description, image, SKU/slug, price, currency, availability, category, URL, ratings, and reviews only when those inputs exist.
- Shipping schema may include the visible base fee and Bangladesh destination. Do not add exact handling or transit timing unless the public shipping policy states the same details.
- Return schema may include the public seven-day return window. Do not add a return method, return fees, refund guarantee, or pickup guarantee until the visible returns policy states it.
- OnlineStore schema may mention Cash on Delivery. Do not add bKash, Nagad, card, or other provider support until those payment methods are live and visible in checkout.
- Do not add GTIN, MPN, brand relationship, authenticity verification, customer count, seller count, or review count unless those facts come from product data or approved visible content.

Future improvements:

- more complete Offer shipping and return fields where visible and accurate;
- brand/gtin/mpn where known;
- product variant support where variants get stable URLs or clear page-level selection;
- review snippets only when reviews are genuine and visible;
- stronger category ItemList consistency;
- merchant/feed readiness alignment.

## Merchant And Product Feed Readiness

Google supports product visibility through structured data and Merchant Center feeds. Boilabin should eventually prepare:

- product ID/SKU policy;
- title and description policy;
- image link and additional image link policy;
- availability and stock policy;
- price sync policy;
- return/shipping policy;
- feed refresh cadence;
- crawlable product URLs.

## Product Page Requirements

Each indexable product page should have:

- unique title;
- specific product description;
- primary image with alt text;
- price in BDT;
- stock/availability;
- SKU or product identifier;
- category breadcrumb;
- visible returns/shipping facts if used in schema;
- canonical URL;
- Product JSON-LD that matches visible page content.

Product descriptions should prioritize model, category, variant, size, color, compatibility, included items, price, availability, and known policy notes. Do not add marketplace trust claims, official brand relationship claims, delivery speed, or authenticity language unless those facts are approved and visible.

## Category Page Requirements

Each important category should have:

- unique intro copy;
- subcategory links;
- visible product count;
- crawlable pagination;
- ItemList JSON-LD for visible products;
- noindex on filtered/faceted combinations unless approved.

Category intros should explain what the category contains, how subcategories are organized, and which product details buyers can compare. Avoid selection-superiority or luxury-collection wording unless it is backed by documented merchandising criteria.

## Brand And Collection Page Requirements

Future brand/collection pages should include:

- brand facts;
- product list;
- Bangladesh availability;
- links to related categories;
- no unsupported authenticity claims.

## Buying Guide Requirements

Useful future guides:

- Where to buy Hot Wheels in Bangladesh.
- How to review die-cast model source and condition details.
- Hot Wheels gift guide in Bangladesh.
- How to compare phone storage and warranty in Bangladesh.
- Cash on delivery and return guide for online shopping in Bangladesh.

Buying guides should link to categories/products and answer real buyer questions.

Buying guides should be written as factual help content. They can explain comparison points, care notes, compatibility, gift-use cases, delivery/return reading tips, and how to use filters. They should not invent product guarantees or market leadership.

## Image Alt Text And Visual Discovery

Image alt text should name the visible product, category, or banner subject. For product images, include the product name and meaningful variant details when known. For category images, name the category rather than using broad promotional text. This helps Google Images, Lens-style discovery, accessibility tools, and AI answer systems understand the media without adding unsupported claims.

## Social Preview And AI Answer Readability

Open Graph and Twitter descriptions should use the same calm factual wording as page metadata. AI answer systems can quote or summarize previews, so previews should state the page type and content clearly:

- product detail, price, category, and availability;
- category page with visible listings;
- help page with policy or support steps;
- brand or collection page only when the page actually exists.

Open Graph image copy follows the same rule. It should not promise authenticity verification, delivery-speed guarantees, checkout-safety guarantees, customer trust, or payment-provider support unless those facts are visible and current.

## Schema Matching Rule

Structured data must match visible facts. Do not add brand, GTIN, MPN, review, shipping, return, seller, payment, or offer properties unless the page or approved policy provides the same fact. Schema should clarify the page, not make claims the buyer cannot verify.

## AI-Readable Business Facts Page

Add a future public page with factual business details:

- Boilabin name;
- country served;
- categories sold;
- support contact;
- shipping/returns summary;
- payment methods that are actually enabled;
- marketplace/seller status if and when approved.

This page should help search engines and AI answer systems cite accurate facts.

## Optional llms.txt Strategy

An `llms.txt` or Markdown summary can help some tools, but it is not a ranking shortcut. Treat it as an optional helper after the main site content, schema, sitemap, robots, and product data are correct.

## Bangladesh Trust Signals

Use visible, honest signals:

- clear contact information;
- shipping areas;
- return/refund policy;
- available payment methods;
- stock and availability;
- seller/product source information when approved.

## First Implementation Priorities

1. Harden image upload/media performance.
2. Add content-quality guardrails and remove unsupported hype.
3. Improve product/category metadata wording.
4. Add more complete product/offer schema where page content supports it.
5. Plan merchant feed readiness after product data policy is stable.

## Verification Workflow

Before hosting exists, Boilabin can verify repository-level search readiness through local tests, content scans, schema helper tests, and build output. After staging exists, Boilabin can inspect hosted robots, sitemap, metadata, JSON-LD, Open Graph previews, and page performance without submitting staging URLs to search engines.

After the production domain points to hosting, run the production-only verification sequence:

- verify Search Console and Bing Webmaster ownership;
- submit the production sitemap;
- inspect representative homepage, product, category, FAQ, shipping, and returns URLs;
- validate structured data with Google Rich Results Test and Schema.org Validator;
- inspect social previews from production URLs;
- review Core Web Vitals and PageSpeed evidence;
- document AI discovery checks as manual observations, not ranking guarantees.

Do not submit staging URLs to search engines, and do not claim external verification is complete until the external tool has actually confirmed it.
