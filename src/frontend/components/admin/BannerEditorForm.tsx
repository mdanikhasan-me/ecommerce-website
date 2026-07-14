'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, Loader2, Monitor, Save, Smartphone, Tablet, Trash2 } from 'lucide-react'
import { cn } from '@/backend/utils'
import { AdminImageField } from './AdminImageField'
import { toDateTimeLocalValue } from './form-utils'
import { AdminDateTimeField } from './AdminDateTimeField'
import {
  BANNER_BUTTON_CLASSES,
  BANNER_BUTTON_LABELS,
  BANNER_BUTTON_STYLE_VALUES,
  BANNER_TEXT_CLASSES,
  BANNER_TEXT_LABELS,
  BANNER_TEXT_TONE_VALUES,
  BANNER_TITLE_STYLE_CLASSES,
  BANNER_TITLE_STYLE_LABELS,
  BANNER_TITLE_STYLE_VALUES,
  bannerToneUsesLightBackdrop,
  normalizeBannerButtonStyle,
  normalizeBannerTextTone,
  normalizeBannerTitleStyle,
} from '@/shared/banner-presentation'

const BANNER_IMAGE_DATA_URL_ERROR =
  'Banner images must be uploaded as files before saving. Base64 image data is not allowed.'

type BannerImageSlot = 'desktop' | 'tablet' | 'mobile'
type PreviewMode = 'desktop' | 'tablet' | 'mobile'
type BannerDestinationType = 'main-category' | 'subcategory' | 'product' | 'custom'

interface BannerDestinationOption {
  id: string
  name: string
  slug: string
  parentId: string | null
  parent: { name: string } | null
}

interface EditableBanner {
  id: string
  title: string
  subtitle: string | null
  imageUrl: string
  tabletImageUrl: string | null
  mobileImageUrl: string | null
  linkUrl: string | null
  buttonLabel: string | null
  buttonStyle: string
  titleStyle: string
  textPosition: string
  textTone: string
  overlayStrength: string
  textShadow: boolean
  sortOrder: number
  isActive: boolean
  startsAt: string | Date | null
  endsAt: string | Date | null
}

interface BannerEditorFormProps {
  banner?: EditableBanner
  destinations?: BannerDestinationOption[]
  redirectTo?: string
}

function isBannerImageDataUrl(value: string | null | undefined) {
  return value?.trim().toLowerCase().startsWith('data:image/') ?? false
}

function getCategoryDestination(slug: string) {
  return `/category/${slug}`
}

function getProductDestination(value: string | null | undefined) {
  const trimmed = value?.trim()
  if (!trimmed) return ''

  try {
    const url = new URL(trimmed, 'https://boilabin.local')
    const pathname = url.pathname.replace(/\/+$/, '')
    if (!/^\/products\/[^/?#]+$/i.test(pathname)) return ''
    return `${pathname}${url.search}${url.hash}`
  } catch {
    return ''
  }
}

export function BannerEditorForm({ banner, destinations = [], redirectTo = '/admin/banners' }: BannerEditorFormProps) {
  const router = useRouter()
  const isEditing = Boolean(banner)
  const initialDestination = destinations.find((destination) => getCategoryDestination(destination.slug) === banner?.linkUrl)
  const initialProductDestination = getProductDestination(banner?.linkUrl)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop')
  const [destinationType, setDestinationType] = useState<BannerDestinationType>(
    initialDestination
      ? (initialDestination.parentId ? 'subcategory' : 'main-category')
      : initialProductDestination
        ? 'product'
        : banner?.linkUrl
          ? 'custom'
          : 'main-category',
  )
  const hasNoEndDateRef = useRef(!banner?.endsAt)
  const [hasNoEndDate, setHasNoEndDate] = useState(hasNoEndDateRef.current)
  const [form, setForm] = useState({
    title: banner?.title ?? '',
    subtitle: banner?.subtitle ?? '',
    imageUrl: banner?.imageUrl ?? '',
    tabletImageUrl: banner?.tabletImageUrl ?? '',
    mobileImageUrl: banner?.mobileImageUrl ?? '',
    linkUrl: banner?.linkUrl ?? '',
    buttonLabel: banner?.buttonLabel ?? '',
    buttonStyle: normalizeBannerButtonStyle(banner?.buttonStyle),
    titleStyle: normalizeBannerTitleStyle(banner?.titleStyle),
    textPosition: banner?.textPosition ?? 'left',
    textTone: normalizeBannerTextTone(banner?.textTone),
    overlayStrength: banner?.overlayStrength ?? 'medium',
    textShadow: banner?.textShadow ?? true,
    sortOrder: String(banner?.sortOrder ?? 0),
    isActive: banner?.isActive ?? true,
    startsAt: toDateTimeLocalValue(banner?.startsAt),
    endsAt: toDateTimeLocalValue(banner?.endsAt),
  })
  const fieldIdPrefix = banner ? `banner-${banner.id}` : 'banner-new'
  const updateField = (field: keyof typeof form, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }))
  }
  const buildPayload = () => ({
    title: form.title.trim(),
    subtitle: form.subtitle.trim() || null,
    imageUrl: form.imageUrl.trim(),
    tabletImageUrl: form.tabletImageUrl.trim() || null,
    mobileImageUrl: form.mobileImageUrl.trim() || null,
    linkUrl: (destinationType === 'product' ? getProductDestination(form.linkUrl) : form.linkUrl.trim()) || null,
    buttonLabel: form.buttonLabel.trim() || null,
    buttonStyle: form.buttonStyle,
    titleStyle: form.titleStyle,
    textPosition: form.textPosition,
    textTone: form.textTone,
    overlayStrength: form.overlayStrength,
    textShadow: form.textShadow,
    position: 'hero',
    sortOrder: Number(form.sortOrder || 0),
    isActive: form.isActive,
    unlimitedDuration: hasNoEndDateRef.current,
    startsAt: form.startsAt || null,
    endsAt: hasNoEndDateRef.current ? null : form.endsAt || null,
  })
  const uploadBannerImage = async (slot: BannerImageSlot, file: File, previousUrl: string) => {
    const uploadForm = new FormData()
    uploadForm.set('file', file)
    uploadForm.set('slot', slot)
    uploadForm.set('owner', banner?.id || form.title.trim() || 'banner')
    if (previousUrl.trim()) uploadForm.set('previousUrl', previousUrl.trim())
    const response = await fetch('/api/admin/banners/upload', { method: 'POST', body: uploadForm })
    const data = await response.json().catch(() => null)
    if (!response.ok || typeof data?.url !== 'string') {
      throw new Error(data?.error || 'Could not upload banner image')
    }
    return data.url
  }
  const removeBannerImage = async (url: string) => {
    if (!url.startsWith('/uploads/admin/banners/')) return

    const response = await fetch('/api/admin/banners/upload', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    })
    const data = await response.json().catch(() => null)
    if (!response.ok) throw new Error(data?.error || 'Could not remove banner image')
  }
  const cleanupTransientBannerImages = async () => {
    const originalUrls = new Set([
      banner?.imageUrl,
      banner?.tabletImageUrl,
      banner?.mobileImageUrl,
    ].filter((url): url is string => Boolean(url)))
    const transientUrls = new Set([
      form.imageUrl,
      form.tabletImageUrl,
      form.mobileImageUrl,
    ].filter((url) => url.startsWith('/uploads/admin/banners/') && !originalUrls.has(url)))

    await Promise.all([...transientUrls].map((url) => removeBannerImage(url)))
  }
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    if (isBannerImageDataUrl(form.imageUrl) || isBannerImageDataUrl(form.tabletImageUrl) || isBannerImageDataUrl(form.mobileImageUrl)) {
      setError(BANNER_IMAGE_DATA_URL_ERROR)
      return
    }
    if (!hasNoEndDate && !form.endsAt) {
      setError('Choose an end date or enable Unlimited duration.')
      return
    }
    if (destinationType === 'product' && !getProductDestination(form.linkUrl)) {
      setError('Paste a valid Boilabin product page link, such as /products/product-slug.')
      return
    }
    setIsSaving(true)
    try {
      const response = await fetch(isEditing ? `/api/admin/banners/${banner!.id}` : '/api/admin/banners', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Could not save banner')
      router.push(redirectTo)
      router.refresh()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not save banner')
    } finally {
      setIsSaving(false)
    }
  }
  const handleDelete = async () => {
    if (!banner || !window.confirm('Delete this banner?')) return
    setIsDeleting(true)
    setError('')
    try {
      const response = await fetch(`/api/admin/banners/${banner.id}`, { method: 'DELETE' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Could not delete banner')
      router.push(redirectTo)
      router.refresh()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Could not delete banner')
    } finally {
      setIsDeleting(false)
    }
  }
  const handleCancel = async () => {
    await cleanupTransientBannerImages().catch(() => undefined)
    router.push(redirectTo)
  }

  const previewImage = previewMode === 'mobile'
    ? form.mobileImageUrl || form.tabletImageUrl || form.imageUrl
    : previewMode === 'tablet'
      ? form.tabletImageUrl || form.imageUrl || form.mobileImageUrl
      : form.imageUrl || form.tabletImageUrl || form.mobileImageUrl
  const previewFrameClass = previewMode === 'mobile'
    ? 'mx-auto aspect-[5/4] max-w-56'
    : previewMode === 'tablet'
      ? 'mx-auto aspect-video max-w-[28rem]'
      : 'aspect-[21/9]'
  const overlayAlpha = ({ none: 0, soft: 0.24, medium: 0.46, strong: 0.68 } as Record<string, number>)[form.overlayStrength] ?? 0.46
  const previewTextTone = normalizeBannerTextTone(form.textTone)
  const previewButtonStyle = normalizeBannerButtonStyle(form.buttonStyle)
  const previewTitleStyle = normalizeBannerTitleStyle(form.titleStyle)
  const usesLightBackdrop = bannerToneUsesLightBackdrop(previewTextTone)
  const overlayRgb = usesLightBackdrop ? '255,255,255' : '15,23,42'
  const overlayDirection = form.textPosition === 'right' ? '270deg' : '90deg'
  const previewOverlay = overlayAlpha
    ? form.textPosition === 'center'
      ? `rgba(${overlayRgb},${Math.max(0.12, overlayAlpha * 0.55)})`
      : `linear-gradient(${overlayDirection}, rgba(${overlayRgb},${overlayAlpha}), rgba(${overlayRgb},${overlayAlpha * 0.42}) 48%, rgba(${overlayRgb},0))`
    : 'transparent'
  const previewPosition = form.textPosition === 'center'
    ? 'items-center text-center'
    : form.textPosition === 'right'
      ? 'items-end text-right'
      : 'items-start text-left'
  const previewTone = BANNER_TEXT_CLASSES[previewTextTone]
  const previewButton = previewButtonStyle === 'outline'
    ? 'border border-current bg-transparent text-current'
    : BANNER_BUTTON_CLASSES[previewButtonStyle]
  const previewTitleClass = BANNER_TITLE_STYLE_CLASSES[previewTitleStyle]
  const previewTextShadow = form.textShadow
    ? usesLightBackdrop ? '0 1px 1px rgba(255,255,255,0.9)' : '0 1px 2px rgba(0,0,0,0.72)'
    : 'none'
  const mainDestinations = destinations.filter((destination) => !destination.parentId)
  const subcategoryDestinations = destinations.filter((destination) => destination.parentId)
  const destinationOptions = destinationType === 'subcategory' ? subcategoryDestinations : mainDestinations
  const selectedDestination = destinationOptions.find(
    (destination) => getCategoryDestination(destination.slug) === form.linkUrl,
  )?.id ?? ''
  const changeDestinationType = (nextType: BannerDestinationType) => {
    setDestinationType(nextType)
    if (nextType === 'main-category' || nextType === 'subcategory') updateField('linkUrl', '')
    if (nextType === 'product' && form.linkUrl && !getProductDestination(form.linkUrl)) updateField('linkUrl', '')
  }
  const changeCategoryDestination = (destinationId: string) => {
    const destination = destinations.find((option) => option.id === destinationId)
    updateField('linkUrl', destination ? getCategoryDestination(destination.slug) : '')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pb-20 sm:pb-0">
      {error ? <div className="rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div> : null}

      <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_23rem]">
        <div className="space-y-5">
          <section className="admin-card p-5 sm:p-6">
            <h2 className="admin-section-title">Content</h2>
            <p className="mt-1 text-xs text-muted-foreground">Headline, supporting copy, and call to action.</p>
            <div className="mt-4 grid gap-4">
              <div>
                <label htmlFor={`${fieldIdPrefix}-title`} className="mb-1.5 block text-sm font-medium">Title</label>
                <input id={`${fieldIdPrefix}-title`} value={form.title} onChange={(event) => updateField('title', event.target.value)} className="input-base" placeholder="Optional banner title" />
              </div>
              <div>
                <label htmlFor={`${fieldIdPrefix}-subtitle`} className="mb-1.5 block text-sm font-medium">Subtitle</label>
                <textarea id={`${fieldIdPrefix}-subtitle`} value={form.subtitle} onChange={(event) => updateField('subtitle', event.target.value)} className="input-base min-h-24 resize-y" placeholder="Optional supporting text" />
              </div>
              <div className="grid gap-4 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
                <div>
                  <label htmlFor={`${fieldIdPrefix}-button-label`} className="mb-1.5 block text-sm font-medium">Button label</label>
                  <input id={`${fieldIdPrefix}-button-label`} value={form.buttonLabel} onChange={(event) => updateField('buttonLabel', event.target.value)} className="input-base" placeholder="Explore collection" />
                </div>
                <div>
                  <span className="mb-1.5 block text-sm font-medium">Button destination</span>
                  <div className="grid gap-2 lg:grid-cols-[10.5rem_minmax(0,1fr)]">
                    <div>
                      <label htmlFor={`${fieldIdPrefix}-destination-type`} className="sr-only">Destination type</label>
                      <select id={`${fieldIdPrefix}-destination-type`} value={destinationType} onChange={(event) => changeDestinationType(event.target.value as BannerDestinationType)} className="input-base">
                        <option value="main-category">Main category</option>
                        <option value="subcategory">Subcategory</option>
                        <option value="product">Product link</option>
                        <option value="custom">Custom link</option>
                      </select>
                    </div>
                    {destinationType === 'custom' || destinationType === 'product' ? (
                      <div>
                        <label htmlFor={`${fieldIdPrefix}-link`} className="sr-only">
                          {destinationType === 'product' ? 'Product destination' : 'Custom destination'}
                        </label>
                        <input
                          id={`${fieldIdPrefix}-link`}
                          value={form.linkUrl}
                          onChange={(event) => updateField('linkUrl', event.target.value)}
                          onBlur={() => {
                            if (destinationType !== 'product') return
                            const normalized = getProductDestination(form.linkUrl)
                            if (normalized) updateField('linkUrl', normalized)
                          }}
                          className="input-base"
                          placeholder={destinationType === 'product' ? '/products/product-slug' : '/help or https://example.com'}
                          inputMode="url"
                          autoComplete="off"
                          spellCheck={false}
                          aria-describedby={destinationType === 'product' ? `${fieldIdPrefix}-product-link-help` : undefined}
                        />
                        {destinationType === 'product' ? (
                          <p id={`${fieldIdPrefix}-product-link-help`} className="mt-1 text-xs leading-5 text-muted-foreground">
                            Paste a Boilabin product page URL. It is saved as a fast internal product path.
                          </p>
                        ) : null}
                      </div>
                    ) : (
                      <div>
                        <label htmlFor={`${fieldIdPrefix}-category-destination`} className="sr-only">Category destination</label>
                        <select id={`${fieldIdPrefix}-category-destination`} value={selectedDestination} onChange={(event) => changeCategoryDestination(event.target.value)} className="input-base">
                          <option value="">Select {destinationType === 'subcategory' ? 'a subcategory' : 'a main category'}</option>
                          {destinationOptions.map((destination) => (
                            <option key={destination.id} value={destination.id}>
                              {destination.parent ? `${destination.parent.name} / ${destination.name}` : destination.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="admin-card p-5 sm:p-6">
            <h2 className="admin-section-title">Presentation</h2>
            <p className="mt-1 text-xs text-muted-foreground">Control contrast and placement without editing the artwork.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor={`${fieldIdPrefix}-text-position`} className="mb-1.5 block text-sm font-medium">Content alignment</label>
                <select id={`${fieldIdPrefix}-text-position`} value={form.textPosition} onChange={(event) => updateField('textPosition', event.target.value)} className="input-base">
                  <option value="left">Left</option><option value="center">Center</option><option value="right">Right</option>
                </select>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">Aligns the title, description, and button together.</p>
              </div>
              <div>
                <label htmlFor={`${fieldIdPrefix}-title-style`} className="mb-1.5 block text-sm font-medium">Title style</label>
                <select id={`${fieldIdPrefix}-title-style`} value={form.titleStyle} onChange={(event) => updateField('titleStyle', event.target.value)} className="input-base">
                  {BANNER_TITLE_STYLE_VALUES.map((value) => <option key={value} value={value}>{BANNER_TITLE_STYLE_LABELS[value]}</option>)}
                </select>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">Four focused typography treatments without loading extra fonts.</p>
              </div>
              <div>
                <label htmlFor={`${fieldIdPrefix}-text-tone`} className="mb-1.5 block text-sm font-medium">Title and description color</label>
                <select id={`${fieldIdPrefix}-text-tone`} value={form.textTone} onChange={(event) => updateField('textTone', event.target.value)} className="input-base">
                  {BANNER_TEXT_TONE_VALUES.map((value) => <option key={value} value={value}>{BANNER_TEXT_LABELS[value]}</option>)}
                </select>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">Rich contrast presets designed for campaign artwork.</p>
              </div>
              <div>
                <label htmlFor={`${fieldIdPrefix}-button-style`} className="mb-1.5 block text-sm font-medium">Button style</label>
                <select id={`${fieldIdPrefix}-button-style`} value={form.buttonStyle} onChange={(event) => updateField('buttonStyle', event.target.value)} className="input-base">
                  {BANNER_BUTTON_STYLE_VALUES.map((value) => <option key={value} value={value}>{BANNER_BUTTON_LABELS[value]}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor={`${fieldIdPrefix}-overlay`} className="mb-1.5 block text-sm font-medium">Image shading</label>
                <select id={`${fieldIdPrefix}-overlay`} value={form.overlayStrength} onChange={(event) => updateField('overlayStrength', event.target.value)} className="input-base">
                  <option value="none">None</option><option value="soft">Soft</option><option value="medium">Medium</option><option value="strong">Strong</option>
                </select>
              </div>
            </div>
            <label htmlFor={`${fieldIdPrefix}-text-shadow`} className="mt-4 flex items-center justify-between gap-4 rounded-md bg-secondary/55 px-4 py-3 text-sm">
              <span><span className="block font-semibold">Text edge</span><span className="block text-xs text-muted-foreground">Adds a crisp contrast edge without blur.</span></span>
              <input id={`${fieldIdPrefix}-text-shadow`} type="checkbox" checked={form.textShadow} onChange={(event) => updateField('textShadow', event.target.checked)} className="size-4 rounded border-input" />
            </label>
          </section>

          <section className="admin-card p-5 sm:p-6">
            <h2 className="admin-section-title">Responsive artwork</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">Use the required ratio preset for each screen. Pixel dimensions are balanced recommendations for sharp output and lightweight delivery; larger source files are accepted.</p>
            <div className="mt-4 grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
              <AdminImageField label="Desktop image" value={form.imageUrl} onChange={(value) => updateField('imageUrl', value)} helperText="Required ratio: Ultrawide 21:9. Recommended export: 2048 × 864 px, WebP, under 500 KB. Stored at q90." previewClassName="aspect-[21/9]" uploadImage={(file) => uploadBannerImage('desktop', file, form.imageUrl)} removeImage={removeBannerImage} rejectDataUrls dataUrlErrorMessage={BANNER_IMAGE_DATA_URL_ERROR} />
              <AdminImageField label="Tablet / iPad image" value={form.tabletImageUrl} onChange={(value) => updateField('tabletImageUrl', value)} helperText="Required ratio: 16:9. Recommended export: 1376 × 768 px, WebP, under 400 KB. Stored at q90." previewClassName="aspect-video" uploadImage={(file) => uploadBannerImage('tablet', file, form.tabletImageUrl)} removeImage={removeBannerImage} rejectDataUrls dataUrlErrorMessage={BANNER_IMAGE_DATA_URL_ERROR} />
              <AdminImageField label="Mobile image" value={form.mobileImageUrl} onChange={(value) => updateField('mobileImageUrl', value)} helperText="Required ratio: landscape 5:4. Recommended export: 1152 × 928 px, WebP, under 300 KB. Stored at q90." previewClassName="aspect-[5/4]" uploadImage={(file) => uploadBannerImage('mobile', file, form.mobileImageUrl)} removeImage={removeBannerImage} rejectDataUrls dataUrlErrorMessage={BANNER_IMAGE_DATA_URL_ERROR} />
            </div>
          </section>
        </div>

        <aside className="space-y-5 2xl:sticky 2xl:top-0 2xl:self-start">
          <section className="admin-card p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-sm font-semibold"><Eye className="h-4 w-4" /> Live preview</span>
              <div className="flex rounded-md bg-secondary p-1">
                <button type="button" aria-label="Desktop preview" aria-pressed={previewMode === 'desktop'} onClick={() => setPreviewMode('desktop')} className={cn('flex h-8 w-8 items-center justify-center rounded', previewMode === 'desktop' && 'bg-card text-primary')}><Monitor className="h-4 w-4" /></button>
                <button type="button" aria-label="Tablet preview" aria-pressed={previewMode === 'tablet'} onClick={() => setPreviewMode('tablet')} className={cn('flex h-8 w-8 items-center justify-center rounded', previewMode === 'tablet' && 'bg-card text-primary')}><Tablet className="h-4 w-4" /></button>
                <button type="button" aria-label="Mobile preview" aria-pressed={previewMode === 'mobile'} onClick={() => setPreviewMode('mobile')} className={cn('flex h-8 w-8 items-center justify-center rounded', previewMode === 'mobile' && 'bg-card text-primary')}><Smartphone className="h-4 w-4" /></button>
              </div>
            </div>
            <div className={cn('relative mt-3 overflow-hidden rounded-md bg-[#111827] bg-cover bg-center', previewFrameClass)} style={previewImage ? { backgroundImage: `url("${previewImage.replace(/"/g, '%22')}")` } : undefined}>
              {!previewImage ? <div className="absolute inset-0 flex items-center justify-center text-xs text-white/60">Choose an image to preview</div> : null}
              <div className="absolute inset-0" style={{ background: previewOverlay }} />
              <div className={cn('absolute inset-0 flex flex-col justify-center p-4', previewPosition, previewTone)} style={{ textShadow: previewTextShadow }}>
                <p className={cn('max-w-[85%] text-lg leading-tight', previewTitleClass)}>{form.title || 'Banner title'}</p>
                <p className="mt-1 max-w-[85%] text-[10px] leading-4 opacity-90">{form.subtitle || 'Supporting banner text appears here.'}</p>
                {form.linkUrl || form.buttonLabel ? <span className={cn('mt-3 inline-flex min-h-7 items-center rounded-full px-3 text-[9px] font-semibold', previewButton)}>{form.buttonLabel || 'Explore collection'}</span> : null}
              </div>
            </div>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">Preview approximates storefront composition; saved artwork remains unchanged.</p>
          </section>

          <section className="admin-card p-5 sm:p-6">
            <h2 className="admin-section-title">Publishing</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor={`${fieldIdPrefix}-sort-order`} className="mb-1.5 block text-sm font-medium">Priority</label>
                <input id={`${fieldIdPrefix}-sort-order`} type="number" value={form.sortOrder} onChange={(event) => updateField('sortOrder', event.target.value)} className="input-base" />
                <p className="mt-1 text-xs text-muted-foreground">Lowest number becomes the homepage hero.</p>
              </div>
              <AdminDateTimeField
                id={`${fieldIdPrefix}-starts-at`}
                label="Starts at"
                value={form.startsAt}
                onChange={(value) => updateField('startsAt', value)}
                helperText="Leave empty to publish immediately."
                allowNow
              />
              <label htmlFor={`${fieldIdPrefix}-unlimited`} className="flex items-start gap-3 rounded-md bg-secondary/55 px-4 py-3 text-sm">
                <input
                  id={`${fieldIdPrefix}-unlimited`}
                  type="checkbox"
                  checked={hasNoEndDate}
                  onChange={(event) => {
                    const isUnlimited = event.target.checked
                    hasNoEndDateRef.current = isUnlimited
                    setHasNoEndDate(isUnlimited)
                    if (isUnlimited) updateField('endsAt', '')
                  }}
                  className="mt-0.5 size-4 rounded border-input"
                />
                <span>
                  <span className="block font-semibold">Unlimited duration</span>
                  <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">No end date. The banner remains available until you disable it.</span>
                </span>
              </label>
              {!hasNoEndDate ? (
                <AdminDateTimeField
                  id={`${fieldIdPrefix}-ends-at`}
                  label="Ends at"
                  value={form.endsAt}
                  onChange={(value) => updateField('endsAt', value)}
                  helperText="Choose when this banner should stop publishing."
                />
              ) : null}
              <label htmlFor={`${fieldIdPrefix}-active`} className="flex items-center justify-between rounded-md bg-secondary/55 px-4 py-3 text-sm font-semibold">
                Active
                <input id={`${fieldIdPrefix}-active`} type="checkbox" checked={form.isActive} onChange={(event) => updateField('isActive', event.target.checked)} className="size-4 rounded border-input" />
              </label>
            </div>
          </section>
        </aside>
      </div>

      <div className="admin-form-actions admin-card flex flex-wrap items-center justify-between gap-3 p-3">
        <div>{isEditing ? <button type="button" onClick={handleDelete} disabled={isDeleting || isSaving} className="btn-outline gap-2 text-red-600">{isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}Delete banner</button> : null}</div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={handleCancel} className="btn-outline">Cancel</button>
          <button type="submit" disabled={isSaving || isDeleting} className="btn-primary gap-2">{isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{isEditing ? 'Save banner' : 'Create banner'}</button>
        </div>
      </div>
    </form>
  )
}
