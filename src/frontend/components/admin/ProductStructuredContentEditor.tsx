'use client'

import { useState } from 'react'
import { ImagePlus, Plus, Trash2, Upload } from 'lucide-react'

import { createRowId, readFileAsDataUrl } from './form-utils'

export interface ProductAttributeEditorValue {
  id: string
  name: string
  value: string
}

export interface ProductSpecificationEditorValue {
  id: string
  group: string
  name: string
  value: string
}

export interface ProductFaqEditorValue {
  id: string
  question: string
  answer: string
}

export interface ProductDescriptionImageEditorValue {
  id: string
  url: string
  alt: string
}

interface ProductStructuredContentEditorProps {
  description: string
  onDescriptionChange: (value: string) => void
  attributes: ProductAttributeEditorValue[]
  onAttributesChange: (value: ProductAttributeEditorValue[]) => void
  specifications: ProductSpecificationEditorValue[]
  onSpecificationsChange: (value: ProductSpecificationEditorValue[]) => void
  faqs: ProductFaqEditorValue[]
  onFaqsChange: (value: ProductFaqEditorValue[]) => void
  descriptionImages: ProductDescriptionImageEditorValue[]
  onDescriptionImagesChange: (value: ProductDescriptionImageEditorValue[]) => void
  onError: (message: string) => void
}

function updateRow<T extends { id: string }>(rows: T[], id: string, patch: Partial<T>) {
  return rows.map((row) => (row.id === id ? { ...row, ...patch } : row))
}

function EmptyRows({ children }: { children: string }) {
  return <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">{children}</p>
}

export function ProductStructuredContentEditor({
  description,
  onDescriptionChange,
  attributes,
  onAttributesChange,
  specifications,
  onSpecificationsChange,
  faqs,
  onFaqsChange,
  descriptionImages,
  onDescriptionImagesChange,
  onError,
}: ProductStructuredContentEditorProps) {
  const [newDescriptionImageUrl, setNewDescriptionImageUrl] = useState('')

  const addDescriptionImageUrl = () => {
    const url = newDescriptionImageUrl.trim()
    if (!url) return
    onDescriptionImagesChange([...descriptionImages, { id: createRowId(), url, alt: '' }])
    setNewDescriptionImageUrl('')
  }

  const uploadDescriptionImages = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    if (!files.length) return

    try {
      const rows = await Promise.all(files.map(async (file) => ({
        id: createRowId(),
        url: await readFileAsDataUrl(file),
        alt: file.name.replace(/\.[^.]+$/, ''),
      })))
      onDescriptionImagesChange([...descriptionImages, ...rows])
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Could not process description image')
    } finally {
      event.target.value = ''
    }
  }

  return (
    <>
      <section className="admin-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold">Specifications</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Add a clear name and value for every technical specification. Group is optional and helps organise long tables.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSpecificationsChange([...specifications, { id: createRowId(), group: '', name: '', value: '' }])}
            className="btn-outline min-h-10 gap-2 px-3 text-xs"
          >
            <Plus className="h-4 w-4" aria-hidden="true" /> Add specification
          </button>
        </div>

        {specifications.length === 0 ? (
          <div className="mt-4"><EmptyRows>No specifications. Products without specifications will use a full-width description.</EmptyRows></div>
        ) : (
          <div className="mt-4 space-y-3">
            {specifications.map((specification) => (
              <div key={specification.id} className="grid gap-3 rounded-lg bg-secondary/45 p-3 lg:grid-cols-[minmax(8rem,0.28fr)_minmax(10rem,0.38fr)_minmax(0,1fr)_auto]">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Group (optional)</label>
                  <input
                    value={specification.group}
                    onChange={(event) => onSpecificationsChange(updateRow(specifications, specification.id, { group: event.target.value }))}
                    className="input-base text-sm"
                    placeholder="Display"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Specification name</label>
                  <input
                    value={specification.name}
                    onChange={(event) => onSpecificationsChange(updateRow(specifications, specification.id, { name: event.target.value }))}
                    className="input-base text-sm"
                    placeholder="Refresh rate"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Specification value</label>
                  <input
                    value={specification.value}
                    onChange={(event) => onSpecificationsChange(updateRow(specifications, specification.id, { value: event.target.value }))}
                    className="input-base text-sm"
                    placeholder="1–120Hz adaptive refresh rate"
                    required
                  />
                </div>
                <button
                  type="button"
                  aria-label="Remove specification"
                  title="Remove specification"
                  onClick={() => onSpecificationsChange(specifications.filter((row) => row.id !== specification.id))}
                  className="btn-outline min-h-11 self-end px-3 text-red-600"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="admin-card p-5">
        <h2 className="font-display text-lg font-semibold">Product description</h2>
        <p className="mt-1 max-w-3xl text-xs leading-5 text-muted-foreground">
          Write the full product story here. Formatting is supported: <strong>**bold**</strong>, <strong>## heading</strong>,
          <strong> - list item</strong>, links, quotes, and numbered lists.
        </p>
        <label className="sr-only" htmlFor="product-description">Product description</label>
        <textarea
          id="product-description"
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          className="input-base mt-4 min-h-[22rem] resize-y font-mono text-sm leading-6"
          placeholder={'## Product overview\n\nExplain the product clearly. Use **bold text** for important facts.\n\n- First benefit\n- Second benefit'}
          required
        />

        <div className="mt-6 border-t border-border pt-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-display text-base font-semibold">Description media</h3>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                These images appear inside the long description, below the written content. Use meaningful alt text.
              </p>
            </div>
            <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-foreground">
              <Upload className="h-4 w-4" aria-hidden="true" />
              Upload images
              <input type="file" accept="image/*" multiple className="hidden" onChange={uploadDescriptionImages} />
            </label>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              aria-label="Description image URL"
              value={newDescriptionImageUrl}
              onChange={(event) => setNewDescriptionImageUrl(event.target.value)}
              className="input-base min-w-0 flex-1"
              placeholder="Paste a description image URL"
            />
            <button type="button" onClick={addDescriptionImageUrl} className="btn-outline min-h-11 gap-2 whitespace-nowrap">
              <ImagePlus className="h-4 w-4" aria-hidden="true" /> Add URL
            </button>
          </div>

          {descriptionImages.length === 0 ? (
            <div className="mt-4"><EmptyRows>No description images added.</EmptyRows></div>
          ) : (
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {descriptionImages.map((image, index) => (
                <div key={image.id} className="rounded-lg bg-secondary/45 p-3">
                  <div className="aspect-[3/2] overflow-hidden rounded-md bg-card">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image.url} alt={image.alt} className="h-full w-full object-contain" />
                  </div>
                  <label className="mt-3 block text-xs font-medium text-muted-foreground" htmlFor={`description-image-alt-${image.id}`}>
                    Image {index + 1} alt text
                  </label>
                  <input
                    id={`description-image-alt-${image.id}`}
                    value={image.alt}
                    onChange={(event) => onDescriptionImagesChange(updateRow(descriptionImages, image.id, { alt: event.target.value }))}
                    className="input-base mt-1.5 text-sm"
                    placeholder="Describe what the image shows"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => onDescriptionImagesChange(descriptionImages.filter((row) => row.id !== image.id))}
                    className="btn-outline mt-3 min-h-10 gap-2 px-3 text-xs text-red-600"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" /> Remove image
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="admin-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold">Product highlights</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Compact details shown near the price as <strong>Label: Details</strong>, for example Color: Titanium Black or Network: 5G.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onAttributesChange([...attributes, { id: createRowId(), name: '', value: '' }])}
            className="btn-outline min-h-10 gap-2 px-3 text-xs"
          >
            <Plus className="h-4 w-4" aria-hidden="true" /> Add detail
          </button>
        </div>

        {attributes.length === 0 ? (
          <div className="mt-4"><EmptyRows>No product highlights. Add only details that help customers decide.</EmptyRows></div>
        ) : (
          <div className="mt-4 space-y-3">
            {attributes.map((attribute) => (
              <div key={attribute.id} className="grid gap-3 rounded-lg bg-secondary/45 p-3 sm:grid-cols-[minmax(9rem,0.42fr)_minmax(0,1fr)_auto]">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Label</label>
                  <input
                    value={attribute.name}
                    onChange={(event) => onAttributesChange(updateRow(attributes, attribute.id, { name: event.target.value }))}
                    className="input-base text-sm"
                    placeholder="Color"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Details</label>
                  <input
                    value={attribute.value}
                    onChange={(event) => onAttributesChange(updateRow(attributes, attribute.id, { value: event.target.value }))}
                    className="input-base text-sm"
                    placeholder="Titanium Black"
                    required
                  />
                </div>
                <button
                  type="button"
                  aria-label="Remove product highlight"
                  title="Remove product highlight"
                  onClick={() => onAttributesChange(attributes.filter((row) => row.id !== attribute.id))}
                  className="btn-outline min-h-11 self-end px-3 text-red-600"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="admin-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold">Customer FAQs</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Add genuine product questions and direct answers. They appear after the description and strengthen helpful on-page content.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onFaqsChange([...faqs, { id: createRowId(), question: '', answer: '' }])}
            className="btn-outline min-h-10 gap-2 px-3 text-xs"
          >
            <Plus className="h-4 w-4" aria-hidden="true" /> Add question
          </button>
        </div>

        {faqs.length === 0 ? (
          <div className="mt-4"><EmptyRows>No FAQs added.</EmptyRows></div>
        ) : (
          <div className="mt-4 space-y-3">
            {faqs.map((faq, index) => (
              <div key={faq.id} className="rounded-lg bg-secondary/45 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Question {index + 1}</p>
                  <button
                    type="button"
                    onClick={() => onFaqsChange(faqs.filter((row) => row.id !== faq.id))}
                    className="inline-flex min-h-10 items-center gap-2 px-2 text-xs font-medium text-red-600"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" /> Remove
                  </button>
                </div>
                <label className="mt-2 block text-xs font-medium text-muted-foreground">Question</label>
                <input
                  value={faq.question}
                  onChange={(event) => onFaqsChange(updateRow(faqs, faq.id, { question: event.target.value }))}
                  className="input-base mt-1.5 text-sm"
                  placeholder="Does this product support dual SIM?"
                  required
                />
                <label className="mt-3 block text-xs font-medium text-muted-foreground">Answer</label>
                <textarea
                  value={faq.answer}
                  onChange={(event) => onFaqsChange(updateRow(faqs, faq.id, { answer: event.target.value }))}
                  className="input-base mt-1.5 min-h-28 resize-y text-sm leading-6"
                  placeholder="Give a complete, factual answer."
                  required
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
