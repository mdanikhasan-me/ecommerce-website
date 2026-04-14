/**
 * Configuration — Barrel Export
 *
 * Centralized app configuration:
 *   site.ts    → Site identity, contact info, shipping & limits
 *   payment.ts → Payment gateway definitions
 */

export { siteConfig } from './site'
export { PAYMENT_GATEWAYS } from './payment'
