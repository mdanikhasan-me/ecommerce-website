# Step 230 - Core Web Vitals And Performance QA Plan

## Scope

Created a performance QA plan without running external PageSpeed/Lighthouse services.

## Local Vs Hosted

- Local build and browser checks can catch regressions.
- PageSpeed Insights requires hosted URLs.
- Search Console Core Web Vitals requires property verification, indexed URLs, and field data.

## Future QA

- Run PageSpeed Insights on homepage, category, product, cart, checkout/login, FAQ, and shipping pages.
- Compare mobile and desktop results.
- Track LCP, INP, CLS, image weight, render-blocking work, and layout shift.
- Record Bangladesh/mobile-network considerations.
- Use Search Console Core Web Vitals after enough traffic exists.

## Current Risks

- Image-heavy storefront pages need continued media QA.
- Derived variants/CDN remain future work.
- Visual redesign can introduce layout shift if not browser-tested.
