import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';

import { STOREFRONT_ICON_ASSETS } from '../src/shared/storefront-icons';

const repoRoot = process.cwd();

function readRepoFile(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function expectStoreRoute(href: string) {
  const trimmed = href.replace(/^\/+/, '');
  const candidates = [
    path.join(repoRoot, 'src/app/(store)', trimmed, 'page.tsx'),
    path.join(repoRoot, 'src/app/(admin)', trimmed, 'page.tsx'),
  ];

  assert.equal(
    candidates.some((candidate) => existsSync(candidate)),
    true,
    `${href} should resolve to an existing App Router page`
  );
}

test('Step 307 global navbar removes promo strip and uses compact responsive controls', () => {
  const header = readRepoFile('src/frontend/components/layout/Header.tsx');

  assert.doesNotMatch(header, /Free delivery on orders over Tk 2,000/);
  assert.doesNotMatch(header, /renderSearch\('hidden flex-1 sm:block'\)/);
  assert.doesNotMatch(header, /href="\/deals"|Sale|Collections/);

  assert.match(header, /aria-label="Open search"/);
  assert.match(header, /data-search-trigger="true"/);
  assert.match(header, /aria-controls="desktop-categories-menu"/);
  assert.match(header, /useCartStore/);
  assert.match(header, /useSession/);
  assert.match(header, /signOut\(\{ callbackUrl: '\/' \}\)/);

  const mobileHeaderIndex = header.indexOf('data-testid="mobile-header"');
  const mobileMenuIndex = header.indexOf('data-testid="mobile-menu-button"', mobileHeaderIndex);
  const mobileCartIndex = header.indexOf('data-testid="mobile-cart-button"', mobileHeaderIndex);
  const mobileProfileIndex = header.indexOf('data-testid="mobile-profile-link"', mobileHeaderIndex);

  assert.ok(mobileHeaderIndex > -1, 'mobile header should be marked for regression checks');
  assert.ok(mobileMenuIndex > mobileHeaderIndex, 'mobile menu button should be inside mobile header');
  assert.ok(mobileCartIndex > mobileMenuIndex, 'mobile cart button should follow the menu/brand area');
  assert.ok(mobileProfileIndex > mobileCartIndex, 'mobile profile/sign-in link should follow cart');
});

test('Step 307 help page has the new support layout and no retired help copy', () => {
  const help = readRepoFile('src/app/(store)/help/page.tsx');

  for (const text of [
    'We&rsquo;re here to help',
    'Quick answers, helpful guides,',
    'and real support when you need it.',
    'Quick actions',
    'Track order',
    'Returns',
    'Shipping',
    'Payments',
    'Account help',
    'Reach us',
    'Contact form',
    'Call us',
    'Email us',
    'Your privacy matters.',
  ]) {
    assert.match(help, new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  for (const retiredText of [
    'Help that feels built for your order',
    'Delivery, returns, payments, and account help in one calm place',
    'Support Desk',
    'Choose the next step',
    'Need a direct reply',
    'Send the order number and issue from the contact page',
    'and real support&mdash;when you need it.',
    'Bangladesh addresses',
  ]) {
    assert.doesNotMatch(help, new RegExp(retiredText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  assert.match(help, /CONTACT_PHONE/);
  assert.match(help, /CONTACT_EMAIL/);
  assert.doesNotMatch(help, /\+880 1234-567890/);
});

test('Step 307 help and navbar links use existing routes', () => {
  for (const href of [
    '/new-arrivals',
    '/about',
    '/help',
    '/category',
    '/auth/login',
    '/account',
    '/account/orders',
    '/account/addresses',
    '/wishlist',
    '/compare',
    '/track-order',
    '/returns',
    '/shipping',
    '/faq',
    '/contact',
    '/admin',
  ]) {
    expectStoreRoute(href);
  }
});

test('Step 307 local icons used by help and navbar resolve to files', () => {
  for (const iconName of [
    'arrow-right',
    'cart',
    'category-electronics',
    'category-fashion',
    'category-home-appliances',
    'category-beauty-health',
    'category-sports-fitness',
    'category-books-stationery',
    'category-gaming',
    'category-toys-collectibles',
    'chevron-down',
    'chevron-right',
    'compare',
    'credit-card',
    'grid',
    'heart',
    'layout-dashboard',
    'life-buoy',
    'location',
    'mail',
    'menu',
    'package',
    'phone',
    'refresh-ccw',
    'search',
    'shield',
    'sparkles',
    'truck',
    'user',
  ] as const) {
    const asset = STOREFRONT_ICON_ASSETS[iconName];
    assert.ok(asset, `${iconName} should exist in STOREFRONT_ICON_ASSETS`);
    assert.equal(existsSync(path.join(repoRoot, 'public', asset.replace(/^\//, ''))), true);
  }
});
