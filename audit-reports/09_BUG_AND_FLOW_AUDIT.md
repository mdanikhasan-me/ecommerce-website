# Bug And Flow Audit

The clear flow failure is public confirmation PII exposure. Browser/E2E flows were not run.

flow | status | evidence_ids | risk | affected_files | recommended_fix | launch_impact
--- | --- | --- | --- | --- | --- | ---
guest browsing | partial | E012;E013;E015;E017;E018 | Source-covered, browser not clicked; SEO gaps. | store pages | Add E2E smoke and faceted URL policy. | medium
Google login | partial | E004 | Provider configured, runtime OAuth not verified. | auth config | Verify callback URLs in staging. | medium
buyer registration/profile | partial | E004;E059;E034 | Routes and validators exist; browser not verified. | auth/account APIs | Add E2E. | medium
seller registration/onboarding | not_implemented | E031 | Seller model exists but no seller route. | schema/route map | Implement before marketplace launch. | high
seller store setup | not_implemented | E031;E003 | Seller fields exist; no UI/API route. | schema | Add seller setup flow. | high
seller product upload | not_implemented | E026;E031 | Admin upload assigns first-party seller only. | product editor | Create seller-scoped APIs. | high
product SEO generation | partial | E011;E026 | Manual SEO fields and metadata exist; AI generator not verified. | SEO/product editor | Add generator tests if intended. | medium
product image upload | partial | E027 | Admin processing exists; limits need hardening. | image processing | Add MIME/size caps. | medium
inventory update | partial | E007;E049 | Admin inventory route exists; no seller ownership. | admin inventory | Add seller ownership later. | medium
product browsing | partial | E016 | Source robust; browser not verified. | product page | E2E smoke. | medium
search/filter/sort | partial | E017;E018 | Functional; SEO/perf gaps. | search/category | DB sort and canonical policy. | medium
cart | partial | E058 | Client store; server merge not verified. | stores | Hydration tests. | medium
wishlist | partial | E058 | Client store/page present. | wishlist | Decide persistence model. | low
checkout | partial | E019;E020;E021 | COD-ready; online gated. | checkout/orders | Add E2E/idempotency. | high
order creation | partial | E019;E034 | Strong server transaction; browser not verified. | orders API | E2E test. | high
admin moderation | partial | E007;E024 | Routes/pages present; browser not verified. | admin reviews | E2E test. | medium
normal admin permissions | partial | E006;E007;E028 | Admin checks exist; PII export review needed. | admin APIs | Permission matrix. | medium
super admin permissions | partial | E028 | Explicit only in user management. | users route | Define super-only map. | medium
seller product ownership | not_implemented | E031;E026 | No seller mutation routes. | product editor/schema | Implement before sellers. | high
seller inventory ownership | not_implemented | E031 | No seller inventory APIs. | route map | Implement seller inventory. | high
buyer order visibility | fail | E022;E023 | Account detail scoped; confirmation public with PII. | order pages | Fix immediately. | critical
mobile navigation | not_verified | E045;E054 | Responsive source, no browser check. | Header/mobile filters | Screenshots. | medium
broken links/routes | not_verified | E054 | No crawler run. | all pages | Run route crawler. | medium
