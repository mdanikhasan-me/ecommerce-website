const KNOWN_SOURCES = [
  ['facebook', ['facebook.com', 'fb.com']],
  ['instagram', ['instagram.com']],
  ['google', ['google.']],
  ['youtube', ['youtube.com', 'youtu.be']],
  ['tiktok', ['tiktok.com']],
  ['whatsapp', ['whatsapp.com', 'wa.me']],
  ['bing', ['bing.com']],
] as const

export const TRAFFIC_SOURCE_LABELS: Record<string, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  google: 'Google',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  whatsapp: 'WhatsApp',
  bing: 'Bing',
  referral: 'Other referral',
  direct: 'Direct / unknown',
}

function sourceFromText(value: string) {
  const normalized = value.trim().toLowerCase()
  if (!normalized) return null

  for (const [source, matches] of KNOWN_SOURCES) {
    if (matches.some((match) => normalized.includes(match))) return source
  }

  return null
}

function safeUrl(value: string | null | undefined) {
  if (!value || value.length > 1000) return null
  try {
    return new URL(value)
  } catch {
    return null
  }
}

export function resolveTrafficSource(input: {
  referrer?: string | null
  landingUrl?: string | null
  siteOrigin: string
}) {
  const landingUrl = safeUrl(input.landingUrl)
  const campaignSource = landingUrl?.searchParams.get('utm_source')
  const knownCampaign = campaignSource ? sourceFromText(campaignSource) : null
  if (knownCampaign) return knownCampaign

  const referrer = safeUrl(input.referrer)
  if (!referrer) return 'direct'

  const knownReferrer = sourceFromText(referrer.hostname)
  if (knownReferrer) return knownReferrer

  const siteOrigin = safeUrl(input.siteOrigin)
  if (siteOrigin && referrer.origin === siteOrigin.origin) return 'direct'

  return 'referral'
}

export function trafficSourceLabel(source: string) {
  return TRAFFIC_SOURCE_LABELS[source] ?? TRAFFIC_SOURCE_LABELS.direct
}
