import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

const readProjectFile = (path: string) => readFileSync(path, 'utf8')

describe('content quality marketing-copy guardrail', () => {
  it('flags unsupported generic marketplace claims', async () => {
    const { findMarketingCopyFindings } = await import('../scripts/audit-ai-marketing-copy.mjs')
    const findings = findMarketingCopyFindings(
      "Bangladesh's most trusted premium marketplace and ultimate one-stop shop.",
      'src/app/(store)/sample/page.tsx',
    )

    assert.ok(findings.some((finding: { id: string }) => finding.id === 'most-trusted'))
    assert.ok(findings.some((finding: { id: string }) => finding.id === 'premium'))
    assert.ok(findings.some((finding: { id: string }) => finding.id === 'ultimate'))
    assert.ok(findings.some((finding: { id: string }) => finding.id === 'one-stop'))
    assert.ok(findings.every((finding: { policy: string }) => finding.policy === 'hard-blocked'))
    assert.ok(findings.every((finding: { category: string }) => finding.category === 'source-visible-copy'))
  })

  it('allows factual product/category wording', async () => {
    const { findMarketingCopyFindings } = await import('../scripts/audit-ai-marketing-copy.mjs')
    const findings = findMarketingCopyFindings(
      'Browse Hot Wheels cars, multipacks, and collectible die-cast models available from sellers in Bangladesh.',
      'sample.tsx',
    )

    assert.equal(findings.length, 0)
  })

  it('keeps private env files outside content scans', async () => {
    const { shouldSkipContentPath } = await import('../scripts/audit-ai-marketing-copy.mjs')
    assert.equal(shouldSkipContentPath('.env'), true)
    assert.equal(shouldSkipContentPath('.env.local'), true)
    assert.equal(shouldSkipContentPath('public/uploads/products/example.webp'), true)
  })

  it('classifies review-only claims without weakening hard-blocked findings', async () => {
    const { findMarketingCopyFindings } = await import('../scripts/audit-ai-marketing-copy.mjs')
    const findings = findMarketingCopyFindings(
      'Fast delivery, secure checkout, and smooth checkout for authentic products.',
      'src/app/(store)/faq/page.tsx',
    )

    assert.ok(findings.some((finding: { id: string; policy: string }) => finding.id === 'fast-delivery' && finding.policy === 'review-only'))
    assert.ok(findings.some((finding: { id: string; policy: string }) => finding.id === 'secure-checkout' && finding.policy === 'review-only'))
    assert.ok(findings.some((finding: { id: string; policy: string }) => finding.id === 'smooth-checkout' && finding.policy === 'review-only'))
    assert.ok(findings.some((finding: { id: string; policy: string }) => finding.id === 'authentic' && finding.policy === 'review-only'))
    assert.ok(findings.every((finding: { category: string }) => finding.category === 'source-visible-copy'))
  })

  it('keeps functional internal labels from becoming visible-copy findings', async () => {
    const { classifyContentArea, findMarketingCopyFindings } = await import('../scripts/audit-ai-marketing-copy.mjs')

    assert.equal(classifyContentArea('src/backend/types/product.ts', 'isBestSeller: boolean'), 'internal-identifier')
    assert.deepEqual(
      findMarketingCopyFindings('const TRUSTED_FETCH_SITES = new Set(["same-origin"])', 'src/backend/security/request-guard.ts'),
      [],
    )
  })

  it('classifies schema and social-preview surfaces explicitly', async () => {
    const { classifyContentArea, findMarketingCopyFindings } = await import('../scripts/audit-ai-marketing-copy.mjs')

    assert.equal(
      classifyContentArea('src/backend/seo/structured-data.ts', 'authentic guaranteed'),
      'structured-data',
    )
    assert.equal(
      classifyContentArea('src/app/opengraph-image.tsx', 'Authentic products and smooth checkout'),
      'opengraph-social-preview',
    )

    const findings = findMarketingCopyFindings(
      'Authentic products and smooth checkout with cash on delivery.',
      'src/app/opengraph-image.tsx',
    )

    assert.ok(findings.some((finding: { id: string }) => finding.id === 'authentic'))
    assert.ok(findings.some((finding: { id: string }) => finding.id === 'smooth-checkout'))
    assert.ok(findings.every((finding: { category: string }) => finding.category === 'opengraph-social-preview'))
  })

  it('keeps the repository marketing-copy audit free of unsupported public claims', async () => {
    const { auditMarketingCopy } = await import('../scripts/audit-ai-marketing-copy.mjs')
    const result = await auditMarketingCopy()

    assert.equal(result.findings.length, 0)
  })

  it('keeps checkout, product detail, and tracking copy factual before payment/tracking integrations', () => {
    const checkoutPage = readProjectFile('src/app/(store)/checkout/page.tsx')
    const checkoutClient = readProjectFile('src/frontend/components/checkout/CheckoutClient.tsx')
    const productDetail = readProjectFile('src/frontend/components/product/ProductDetailClient.tsx')
    const paymentConfig = readProjectFile('src/backend/config/payment.ts')
    const faqPage = readProjectFile('src/app/(store)/faq/page.tsx')
    const trackOrder = readProjectFile('src/frontend/components/content/TrackOrderLookup.tsx')
    const shippingPage = readProjectFile('src/app/(store)/shipping/page.tsx')
    const contactPage = readProjectFile('src/app/(store)/contact/page.tsx')
    const contactForm = readProjectFile('src/frontend/components/content/ContactForm.tsx')
    const orderConfirmation = readProjectFile('src/app/(store)/order/[orderNumber]/confirmation/page.tsx')
    const seoConstants = readProjectFile('src/backend/seo/constants.ts')
    const seed = readProjectFile('prisma/seed.ts')

    assert.doesNotMatch(`${checkoutPage}\n${checkoutClient}\n${productDetail}`, /secure checkout/i)
    assert.doesNotMatch(paymentConfig, /coming soon|after gateway setup|checkout popup/i)
    assert.doesNotMatch(`${faqPage}\n${trackOrder}`, /tracking number via email or sms|confirmation email/i)
    assert.doesNotMatch(`${checkoutClient}\n${shippingPage}\n${orderConfirmation}`, /1 to [35] (?:business )?days|Estimated Time/i)
    assert.doesNotMatch(`${contactPage}\n${contactForm}`, /Reach out any time|reply within 24 hours|within 2 hours|Quick Response/i)
    assert.doesNotMatch(faqPage, /modified or cancelled within 1 hour/i)
    assert.doesNotMatch(seoConstants, /bkash payment online shopping/i)
    assert.doesNotMatch(seed, /Experience the future|Silence the world|Hear what matters/i)
    assert.match(productDetail, /Cash on delivery is available for eligible orders/)
    assert.match(paymentConfig, /This option is not available for the current checkout/)
  })

  it('keeps footer payment logos display-only without COD or acceptance wording', () => {
    const footer = readProjectFile('src/frontend/components/layout/Footer.tsx')

    assert.match(footer, /https:\/\/www\.youtube\.com\/@Boilabin/)
    assert.match(footer, /PAYMENT_ASSETS\.BKASH/)
    assert.match(footer, /PAYMENT_ASSETS\.NAGAD/)
    assert.match(footer, /PAYMENT_ASSETS\.VISA/)
    assert.match(footer, /PAYMENT_ASSETS\.MASTERCARD/)
    assert.doesNotMatch(footer, /PAYMENT_ASSETS\.CASH_ON_DELIVERY/)
    assert.doesNotMatch(footer, />We accept</)
    assert.match(footer, /Availability is shown at checkout/)
  })
})
