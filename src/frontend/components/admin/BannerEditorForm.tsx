'use client'

import { useRef, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Eye,
  Loader2,
  Monitor,
  Save,
  Smartphone,
  Tablet,
  Trash2,
} from 'lucide-react'
import { cn } from '@/backend/utils'
import { BannerCreative } from '@/frontend/components/banner/BannerCreative'
import {
  BANNER_BUTTON_BASE_CLASS,
  BANNER_BUTTON_CLASSES,
  BANNER_BUTTON_LABELS,
  BANNER_BUTTON_STYLE_VALUES,
  BANNER_IMAGE_SHADE_LABELS,
  BANNER_TEXT_LABELS,
  BANNER_TEXT_SWATCHES,
  BANNER_TEXT_TONE_VALUES,
  BANNER_TITLE_STYLE_LABELS,
  BANNER_TITLE_STYLE_VALUES,
  normalizeBannerButtonStyle,
  normalizeBannerImageShade,
  normalizeBannerTextTone,
  normalizeBannerTitleStyle,
} from '@/shared/banner-presentation'
import { getBannerImageGuidance } from '@/shared/banner-image-specs'
import { AdminDateTimeField } from './AdminDateTimeField'
import { AdminImageField } from './AdminImageField'
import { toDateTimeLocalValue } from './form-utils'

const BANNER_IMAGE_DATA_URL_ERROR =
  'Banner images must be uploaded as files before saving. Base64 image data is not allowed.'

type BannerImageSlot = 'desktop' | 'tablet' | 'mobile'
type PreviewMode = 'desktop' | 'tablet' | 'mobile'
type BannerDestinationType = 'main-category' | 'subcategory' | 'product' | 'custom'
type ShadeColor = 'none' | 'black' | 'white'
type ShadeStrength = 'soft' | 'medium' | 'strong'

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

const ALIGNMENT_OPTIONS = [
  { value: 'left', label: 'Left', icon: AlignLeft },
  { value: 'center', label: 'Center', icon: AlignCenter },
  { value: 'right', label: 'Right', icon: AlignRight },
] as const

const SHADE_COLOR_OPTIONS: ShadeColor[] = ['none', 'black', 'white']
const SHADE_STRENGTH_OPTIONS: ShadeStrength[] = ['soft', 'medium', 'strong']

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
  const initialTextTone = normalizeBannerTextTone(banner?.textTone)
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
    textTone: initialTextTone,
    overlayStrength: normalizeBannerImageShade(banner?.overlayStrength, initialTextTone),
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

  const handleSubmit = async (event: FormEvent) => {
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

  const previewFrameClass = previewMode === 'mobile'
    ? 'mx-auto max-w-[24.375rem]'
    : previewMode === 'tablet'
      ? 'mx-auto max-w-[34rem]'
      : 'w-full'
  const previewTextTone = normalizeBannerTextTone(form.textTone)
  const previewButtonStyle = normalizeBannerButtonStyle(form.buttonStyle)
  const previewImageShade = normalizeBannerImageShade(form.overlayStrength, previewTextTone)
  const shadeParts = previewImageShade.split('-')
  const shadeColor = (previewImageShade === 'none' ? 'none' : shadeParts[0]) as ShadeColor
  const shadeStrength = (previewImageShade === 'none' ? 'medium' : shadeParts[1]) as ShadeStrength
  const buttonPreviewUsesDarkSurface = previewButtonStyle.includes('white')

  const setShadeColor = (color: ShadeColor) => {
    updateField('overlayStrength', color === 'none' ? 'none' : `${color}-${shadeStrength}`)
  }

  const setShadeStrength = (strength: ShadeStrength) => {
    updateField('overlayStrength', `${shadeColor === 'none' ? 'black' : shadeColor}-${strength}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pb-20 sm:pb-0" data-banner-editor>
      {error ? <div className="rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div> : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,28rem)]">
        <section data-banner-editor-section="content" className="admin-card order-1 p-5 sm:p-6 xl:col-start-1 xl:row-start-1">
          <h2 className="admin-section-title">Content</h2>
          <p className="mt-1 text-xs text-muted-foreground">Write the message and choose exactly where the call to action goes.</p>
          <div className="mt-5 grid gap-4">
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

        <section data-banner-editor-section="preview" className="admin-card order-2 p-4 sm:p-5 xl:col-start-2 xl:row-start-1 xl:self-start">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-sm font-semibold"><Eye className="h-4 w-4" /> Live storefront preview</span>
            <div className="flex rounded-md bg-secondary p-1" aria-label="Preview viewport">
              <button type="button" aria-label="Desktop preview" aria-pressed={previewMode === 'desktop'} onClick={() => setPreviewMode('desktop')} className={cn('flex h-8 w-8 items-center justify-center rounded', previewMode === 'desktop' && 'bg-card text-primary')}><Monitor className="h-4 w-4" /></button>
              <button type="button" aria-label="Tablet preview" aria-pressed={previewMode === 'tablet'} onClick={() => setPreviewMode('tablet')} className={cn('flex h-8 w-8 items-center justify-center rounded', previewMode === 'tablet' && 'bg-card text-primary')}><Tablet className="h-4 w-4" /></button>
              <button type="button" aria-label="Mobile preview" aria-pressed={previewMode === 'mobile'} onClick={() => setPreviewMode('mobile')} className={cn('flex h-8 w-8 items-center justify-center rounded', previewMode === 'mobile' && 'bg-card text-primary')}><Smartphone className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="mt-4 rounded-md bg-secondary/45 p-3">
            <BannerCreative
              title={form.title || 'Banner title'}
              subtitle={form.subtitle || 'Supporting banner text appears here.'}
              desktopImageUrl={form.imageUrl}
              tabletImageUrl={form.tabletImageUrl}
              mobileImageUrl={form.mobileImageUrl}
              linkUrl={form.linkUrl}
              buttonLabel={form.buttonLabel || 'Explore collection'}
              buttonStyle={form.buttonStyle}
              titleStyle={form.titleStyle}
              textPosition={form.textPosition}
              textTone={form.textTone}
              imageShade={form.overlayStrength}
              textEdge={form.textShadow}
              mode={previewMode}
              preview
              className={cn('rounded-md', previewFrameClass)}
            />
          </div>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">This uses the same renderer, wrapping rules, alignment, and ratio as the homepage.</p>
        </section>

        <section data-banner-editor-section="design" className="admin-card order-3 p-5 sm:p-6 xl:col-start-1 xl:row-start-2">
          <h2 className="admin-section-title">Banner design</h2>
          <p className="mt-1 text-xs text-muted-foreground">Control composition, contrast, and the call to action without editing the artwork.</p>

          <div className="mt-5 space-y-4">
            <div className="rounded-md bg-secondary/45 p-4">
              <h3 className="text-sm font-semibold">Composition</h3>
              <div className="mt-3 grid gap-4 lg:grid-cols-2">
                <div>
                  <span className="mb-1.5 block text-sm font-medium">Content alignment</span>
                  <div className="grid grid-cols-3 gap-2">
                    {ALIGNMENT_OPTIONS.map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        type="button"
                        data-banner-alignment={value}
                        aria-pressed={form.textPosition === value}
                        onClick={() => updateField('textPosition', value)}
                        className={cn(
                          'flex min-h-11 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium',
                          form.textPosition === value ? 'border-foreground bg-card text-foreground' : 'border-transparent bg-background text-muted-foreground',
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {label}
                      </button>
                    ))}
                  </div>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">The same horizontal and vertical placement is used on every device.</p>
                </div>
                <div>
                  <label htmlFor={`${fieldIdPrefix}-title-style`} className="mb-1.5 block text-sm font-medium">Title and subtitle typography</label>
                  <select data-banner-typography id={`${fieldIdPrefix}-title-style`} value={form.titleStyle} onChange={(event) => updateField('titleStyle', event.target.value)} className="input-base">
                    {BANNER_TITLE_STYLE_VALUES.map((value) => <option key={value} value={value}>{BANNER_TITLE_STYLE_LABELS[value]}</option>)}
                  </select>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">Eight lightweight presets; each applies one font family to both title and subtitle.</p>
                </div>
              </div>
            </div>

            <div className="rounded-md bg-secondary/45 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold">Text contrast</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">Text color never changes the image shade.</p>
                </div>
                <span className="text-xs font-medium text-muted-foreground">{BANNER_TEXT_LABELS[previewTextTone]}</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
                {BANNER_TEXT_TONE_VALUES.map((value) => (
                  <button
                    key={value}
                    type="button"
                    data-banner-text-tone={value}
                    aria-pressed={previewTextTone === value}
                    onClick={() => updateField('textTone', value)}
                    className={cn(
                      'flex min-h-11 items-center gap-2 rounded-md border px-3 text-left text-xs font-medium',
                      previewTextTone === value ? 'border-foreground bg-card text-foreground' : 'border-transparent bg-background text-muted-foreground',
                    )}
                  >
                    <span className="h-4 w-4 shrink-0 rounded-full border border-black/20" style={{ backgroundColor: BANNER_TEXT_SWATCHES[value] }} />
                    <span className="min-w-0 break-words leading-tight">{BANNER_TEXT_LABELS[value]}</span>
                  </button>
                ))}
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium">Image shade</span>
                    <span className="text-xs text-muted-foreground">{BANNER_IMAGE_SHADE_LABELS[previewImageShade]}</span>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {SHADE_COLOR_OPTIONS.map((value) => (
                      <button
                        key={value}
                        type="button"
                        data-banner-shade-color={value}
                        aria-pressed={shadeColor === value}
                        onClick={() => setShadeColor(value)}
                        className={cn(
                          'min-h-10 rounded-md border px-3 text-xs font-medium capitalize',
                          shadeColor === value ? 'border-foreground bg-card text-foreground' : 'border-transparent bg-background text-muted-foreground',
                        )}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium">Shade intensity</span>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {SHADE_STRENGTH_OPTIONS.map((value) => (
                      <button
                        key={value}
                        type="button"
                        data-banner-shade-strength={value}
                        disabled={shadeColor === 'none'}
                        aria-pressed={shadeColor !== 'none' && shadeStrength === value}
                        onClick={() => setShadeStrength(value)}
                        className={cn(
                          'min-h-10 rounded-md border px-3 text-xs font-medium capitalize disabled:cursor-not-allowed disabled:opacity-40',
                          shadeColor !== 'none' && shadeStrength === value ? 'border-foreground bg-card text-foreground' : 'border-transparent bg-background text-muted-foreground',
                        )}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <label htmlFor={`${fieldIdPrefix}-text-shadow`} className="mt-4 flex items-center justify-between gap-4 rounded-md bg-background px-4 py-3 text-sm">
                <span><span className="block font-semibold">Crisp text edge</span><span className="block text-xs text-muted-foreground">Adds a one-pixel contrast edge without blur or filter effects.</span></span>
                <input id={`${fieldIdPrefix}-text-shadow`} type="checkbox" checked={form.textShadow} onChange={(event) => updateField('textShadow', event.target.checked)} className="size-4 rounded border-input" />
              </label>
            </div>

            <div className="rounded-md bg-secondary/45 p-4">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(14rem,0.7fr)] lg:items-end">
                <div>
                  <label htmlFor={`${fieldIdPrefix}-button-style`} className="mb-1.5 block text-sm font-medium">Button template</label>
                  <select data-banner-button-template id={`${fieldIdPrefix}-button-style`} value={form.buttonStyle} onChange={(event) => updateField('buttonStyle', event.target.value)} className="input-base">
                    {BANNER_BUTTON_STYLE_VALUES.map((value) => <option key={value} value={value}>{BANNER_BUTTON_LABELS[value]}</option>)}
                  </select>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">Twelve static templates change shape, emphasis, type treatment, and color with CSS only.</p>
                </div>
                <div className={cn('flex min-h-20 items-center justify-center rounded-md px-4', buttonPreviewUsesDarkSurface ? 'bg-[#172033]' : 'bg-[#f4f1eb]')}>
                  <span className={cn(BANNER_BUTTON_BASE_CLASS, BANNER_BUTTON_CLASSES[previewButtonStyle])}>{form.buttonLabel || 'Explore collection'}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section data-banner-editor-section="artwork" className="admin-card order-4 p-5 sm:p-6 xl:col-span-2 xl:row-start-3">
          <h2 className="admin-section-title">Responsive artwork</h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">Each upload is checked against its required ratio. Pixel dimensions are balanced recommendations, not fixed resolution requirements.</p>
          <div className="mt-5 grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
            <AdminImageField label="Desktop image" value={form.imageUrl} onChange={(value) => updateField('imageUrl', value)} helperText={getBannerImageGuidance('desktop')} previewClassName="aspect-[21/9]" uploadImage={(file) => uploadBannerImage('desktop', file, form.imageUrl)} removeImage={removeBannerImage} rejectDataUrls dataUrlErrorMessage={BANNER_IMAGE_DATA_URL_ERROR} />
            <AdminImageField label="Tablet / iPad image" value={form.tabletImageUrl} onChange={(value) => updateField('tabletImageUrl', value)} helperText={getBannerImageGuidance('tablet')} previewClassName="aspect-video" uploadImage={(file) => uploadBannerImage('tablet', file, form.tabletImageUrl)} removeImage={removeBannerImage} rejectDataUrls dataUrlErrorMessage={BANNER_IMAGE_DATA_URL_ERROR} />
            <AdminImageField label="Mobile image" value={form.mobileImageUrl} onChange={(value) => updateField('mobileImageUrl', value)} helperText={getBannerImageGuidance('mobile')} previewClassName="aspect-[5/4]" uploadImage={(file) => uploadBannerImage('mobile', file, form.mobileImageUrl)} removeImage={removeBannerImage} rejectDataUrls dataUrlErrorMessage={BANNER_IMAGE_DATA_URL_ERROR} />
          </div>
        </section>

        <section data-banner-editor-section="publishing" className="admin-card order-5 p-5 sm:p-6 xl:col-start-2 xl:row-start-2 xl:self-start">
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
