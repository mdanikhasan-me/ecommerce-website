# Step 214 - Rich Result And AI Discovery QA Plan

## Scope

Created a later QA plan for rich result, structured-data, social-preview, and AI discovery validation.

## Safe QA Performed Now

- Static/code-level SEO tests were run.
- Content scanner was run.
- No browser automation requiring DB/auth was run.

## Manual QA Plan For Later

1. Open a representative product page after local DB and storefront data are ready.
2. Inspect rendered JSON-LD in browser devtools.
3. Validate product page HTML with Google Rich Results Test.
4. Validate schema with Schema.org Validator.
5. Validate FAQ page JSON-LD.
6. Validate category page ItemList schema.
7. Inspect `/opengraph-image` social preview output.
8. Check Open Graph metadata with a social preview/debugger tool once hosted.
9. Confirm visible shipping/returns/payment content matches Product Offer schema.
10. Register the site in Google Search Console after hosting is connected.
11. Register the site in Bing Webmaster Tools after hosting is connected.
12. Test AI answer/manual prompts only after public hosting is available and facts are finalized.
13. Verify product/category images in Google Images/Lens-style discovery after indexing.

## Why Browser QA Was Not Run

The available storefront browser checks can require DB-backed routes. This batch did not query the database or require authenticated flows.

## Result

QA is planned but deferred until local DB/service or hosting readiness makes browser validation safe and meaningful.
