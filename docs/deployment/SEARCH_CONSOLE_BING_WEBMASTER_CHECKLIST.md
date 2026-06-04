# Search Console And Bing Webmaster Checklist

## Purpose

This checklist describes future Google Search Console and Bing Webmaster verification for Boilabin. It does not perform verification or submission.

## Google Search Console Later

| Step | Timing | Evidence to collect | Notes |
| --- | --- | --- | --- |
| Choose property type | After hosting/domain decision | property type selected | Domain property is broad; URL-prefix can be useful for exact host/protocol checks. |
| Verify ownership | After DNS/hosting access exists | verification method and date | Requires owner account access. |
| Submit sitemap | After production domain serves the correct sitemap | sitemap URL and status | Do not submit staging sitemap. |
| Inspect homepage | After production deploy | URL Inspection screenshot/result | Use live URL test when needed. |
| Inspect product/category pages | After representative pages exist | inspection evidence | Check canonical, indexability, crawlability, and mobile usability. |
| Monitor rich results | After indexed pages exist | enhancement report status | Eligibility does not guarantee rich result display. |
| Monitor Core Web Vitals | After indexed traffic exists | report status or no-data note | Field data may be absent early. |

## Bing Webmaster Later

| Step | Timing | Evidence to collect | Notes |
| --- | --- | --- | --- |
| Add site | After hosted URL exists | property details | Bing can also import from Google Search Console after Google verification. |
| Verify ownership | After account access exists | verification method/date | Do not paste credentials into docs. |
| Submit sitemap | After production sitemap is live | processing status | Bing supports sitemap formats including XML sitemap. |
| Inspect URLs | After production pages exist | URL Inspection results | Check index, SEO, and markup cards. |
| Submit URLs or IndexNow | After owner approval | submission history | Treat IndexNow as future work; do not implement incidentally. |

## What Not To Claim Yet

- Do not claim Google property verification is complete.
- Do not claim Bing property verification is complete.
- Do not claim URLs are indexed.
- Do not claim sitemap processing succeeded.
- Do not claim rich result eligibility or display.
- Do not claim Core Web Vitals are good until field or lab evidence exists.

## Minimum Production Evidence Package

- Production URL and deploy commit.
- `robots.txt` and `sitemap.xml` fetched from production.
- Search Console ownership method.
- Bing ownership method.
- Sitemap submission status in each tool.
- URL Inspection result for homepage.
- URL Inspection result for one product page.
- URL Inspection result for one category page.
- Screenshots or exported status summaries, with no secrets.
