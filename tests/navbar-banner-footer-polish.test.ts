import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';

import { STOREFRONT_ICON_ASSETS } from '../src/shared/storefront-icons';

const repoRoot = process.cwd();

function readRepoFile(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function assertLocalUiIcon(iconName: keyof typeof STOREFRONT_ICON_ASSETS) {
  const asset = STOREFRONT_ICON_ASSETS[iconName];
  assert.match(asset, /^\/assets\/icons\/ui\/.+\.svg$/);
  assert.equal(existsSync(path.join(repoRoot, 'public', asset.replace(/^\//, ''))), true);
}

test('Step 308 mobile navbar has balanced local-icon controls', () => {
  const header = readRepoFile('src/frontend/components/layout/Header.tsx');

  assert.match(header, /data-testid="mobile-header"/);
  assert.match(header, /grid-cols-\[7\.5rem_minmax\(0,1fr\)_7\.5rem\]/);
  assert.match(header, /data-testid="mobile-menu-button"/);
  assert.match(header, /data-testid="mobile-brand-link"/);
  assert.match(header, /data-testid="mobile-search-button"/);
  assert.match(header, /aria-label="Search products"/);
  assert.match(header, /data-testid="mobile-cart-button"/);
  assert.match(header, /data-testid="mobile-profile-link"/);
  assert.doesNotMatch(header, /Free delivery on orders over Tk 2,000/);
  assert.doesNotMatch(header, /renderSearch\('hidden flex-1 sm:block'\)/);

  const mobileHeaderIndex = header.indexOf('data-testid="mobile-header"');
  const menuIndex = header.indexOf('data-testid="mobile-menu-button"', mobileHeaderIndex);
  const brandIndex = header.indexOf('data-testid="mobile-brand-link"', mobileHeaderIndex);
  const searchIndex = header.indexOf('data-testid="mobile-search-button"', mobileHeaderIndex);
  const cartIndex = header.indexOf('data-testid="mobile-cart-button"', mobileHeaderIndex);
  const profileIndex = header.indexOf('data-testid="mobile-profile-link"', mobileHeaderIndex);

  assert.ok(menuIndex > mobileHeaderIndex);
  assert.ok(brandIndex > menuIndex);
  assert.ok(searchIndex > brandIndex);
  assert.ok(cartIndex > searchIndex);
  assert.ok(profileIndex > cartIndex);

  for (const icon of ['menu', 'search', 'cart', 'user', 'chevron-down', 'chevron-right'] as const) {
    assert.match(header, new RegExp(`LocalIcon[\\s\\S]*?name="${icon}"`));
    assertLocalUiIcon(icon);
  }
});

test('Step 308 footer is compacted while payment logos remain', () => {
  const footer = readRepoFile('src/frontend/components/layout/Footer.tsx');

  assert.doesNotMatch(footer, /About Boilabin/);
  assert.doesNotMatch(footer, /label: 'FAQ'/);
  assert.doesNotMatch(footer, /Availability is shown at checkout\./);

  assert.match(footer, /Help center/);
  assert.match(footer, /Track order/);
  assert.match(footer, /Shipping/);
  assert.match(footer, /Returns/);
  assert.match(footer, /Contact/);
  assert.match(footer, /PAYMENT_ASSETS\.BKASH/);
  assert.match(footer, /PAYMENT_ASSETS\.NAGAD/);
  assert.match(footer, /PAYMENT_ASSETS\.VISA/);
  assert.match(footer, /PAYMENT_ASSETS\.MASTERCARD/);
  assert.match(footer, /FOOTER_PAYMENT_LOGOS\.map/);
  assert.match(footer, /<div className="container-site">/);
  assert.match(footer, /className="w-full py-5/);
  assert.match(footer, /className="w-full border-t border-black\/6 py-3/);
  assert.doesNotMatch(footer, /max-w-6xl/);
});

test('Step 308 homepage banner source and multi-banner controls are route-safe', () => {
  const homePage = readRepoFile('src/app/(store)/page.tsx');
  const heroBanner = readRepoFile('src/frontend/components/home/HeroBanner.tsx');
  const seed = readRepoFile('prisma/seed.ts');

  assert.match(homePage, /db\.banner\.findMany\(\{ where: \{ isActive: true, position: 'hero' \}/);
  assert.match(heroBanner, /banners\.length > 1/);
  assert.match(heroBanner, /aria-label="Previous slide"/);
  assert.match(heroBanner, /aria-label="Next slide"/);
  assert.match(heroBanner, /onTouchStart=\{handleTouchStart\}/);
  assert.match(heroBanner, /onTouchEnd=\{handleTouchEnd\}/);
  assert.match(heroBanner, /aria-roledescription="carousel"/);
  assert.match(heroBanner, /setInterval\(next, 5000\)/);

  for (const bannerAsset of [
    '/assets/banners/home-hero-iphone-15-pro.jpg',
    '/assets/banners/home-hero-galaxy-s24-ultra.jpg',
  ]) {
    assert.match(seed, new RegExp(bannerAsset.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.equal(existsSync(path.join(repoRoot, 'public', bannerAsset.replace(/^\//, ''))), true);
  }
});

test('Step 308 does not add fake storefront routes or remote navbar icons', () => {
  const changedSources = [
    readRepoFile('src/frontend/components/layout/Header.tsx'),
    readRepoFile('src/frontend/components/layout/Footer.tsx'),
    readRepoFile('src/frontend/components/home/HeroBanner.tsx'),
    readRepoFile('src/app/(store)/page.tsx'),
  ].join('\n');

  assert.doesNotMatch(changedSources, /href="\/deals"|href: '\/deals'/);
  assert.doesNotMatch(changedSources, /href="\/collections"|href: '\/collections'/);
  assert.doesNotMatch(changedSources, /href="\/payments"|href: '\/payments'/);
  assert.doesNotMatch(changedSources, /api\/admin\/flash-sales/);
  assert.doesNotMatch(changedSources, /https?:\/\/.*(icon|svg)/i);
});
