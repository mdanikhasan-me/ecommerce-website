# Step 221 - Local Verification Before Staging Matrix

| Check | Can verify locally? | Needs staging URL? | Needs production domain? | Needs Google/Bing account? | Needs DB? | Safe command | Expected evidence | Blocker | Owner action |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Build | yes | no | no | no | maybe during static generation | `npm run build` | successful build output | DB if unavailable | keep local DB ready |
| Robots source | yes | no | no | no | no | `npm test` / source review | robots tests pass | none | review policy |
| Sitemap source | partial | no | no | no | dynamic part uses DB | `npm test` / build | static sitemap tests and build | full product/category sitemap needs DB | verify hosted sitemap later |
| Metadata helpers | yes | no | no | no | no | SEO tests | canonical/noindex metadata pass | none | review final domain |
| JSON-LD helpers | yes | no | no | no | no | SEO tests | schema tests pass | URL validators need hosted pages | run validators later |
| Open Graph image source | yes | partial | production final later | no | no | source/tests/build | route builds | social tools need hosted URL | preview later |
| Content scan | yes | no | no | no | no | `node scripts/audit-ai-marketing-copy.mjs` | findings count | remaining protected findings | owner prioritize cleanup |
| Search readiness scan | yes | no | no | no | no | `node scripts/audit-search-verification-readiness.mjs` | readiness summary | missing docs/files | keep docs current |
| Image alt/media policy | partial | yes | production final later | no | no | docs/tests/source | policy and source presence | visual QA needs browser | run later |
| Core Web Vitals approximation | partial | yes | production field data later | no for PSI, yes for GSC | no | build/later PSI | lab evidence | hosted URL | run later |
| Rich Results Test | no | yes | production preferred | no account for public URL test | no | manual external tool | validator result | hosted public URL | run later |
| Search Console URL Inspection | no | no | yes | yes | no | manual external tool | inspection result | ownership | verify later |
| Bing URL Inspection | no | no | yes | yes | no | manual external tool | inspection result | ownership | verify later |
| Merchant feed | partial planning | yes | yes | yes | yes/exports | no command now | feed readiness notes | data/account policy | decide later |
| AI answer testing | no | yes/production | yes | tool-dependent | no | manual prompts later | answer/citation observations | crawl/discovery time | run later |

## Result

Local checks can prove repository readiness, but not external ownership, indexing, rich-result display, social-preview cache behavior, Merchant Center status, or AI recommendations.
