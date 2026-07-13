'use client'

import { useRef, useState } from 'react'
import { ImagePlus, Loader2, Trash2 } from 'lucide-react'
import { readFileAsDataUrl } from './form-utils'

interface AdminImageFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  helperText?: string
  previewClassName?: string
  uploadImage?: (file: File) => Promise<string>
  rejectDataUrls?: boolean
  dataUrlErrorMessage?: string
}

const DEFAULT_DATA_URL_ERROR = 'Upload the image file instead of pasting base64 image data.'

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

function isImageDataUrl(value: string) {
  return value.trim().toLowerCase().startsWith('data:image/')
}

export function AdminImageField({
  label,
  value,
  onChange,
  helperText,
  previewClassName,
  uploadImage,
  rejectDataUrls = false,
  dataUrlErrorMessage = DEFAULT_DATA_URL_ERROR,
}: AdminImageFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError('')
    setIsUploading(true)

    try {
      const nextValue = uploadImage ? await uploadImage(file) : await readFileAsDataUrl(file)
      if (rejectDataUrls && isImageDataUrl(nextValue)) {
        throw new Error(dataUrlErrorMessage)
      }

      onChange(nextValue)
    } catch (uploadError) {
      setError(getErrorMessage(uploadError, 'Could not load image'))
    } finally {
      setIsUploading(false)
      event.target.value = ''
    }
  }

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value
    if (rejectDataUrls && isImageDataUrl(nextValue)) {
      setError(dataUrlErrorMessage)
      return
    }

    setError('')
    onChange(nextValue)
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1.5 block text-sm font-medium">{label}</label>
        {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}
      </div>

      <div className="rounded-md bg-secondary/45 p-3">
        <div className={`overflow-hidden rounded-md bg-card ${previewClassName ?? 'aspect-[16/10]'}`}>
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No image selected
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="btn-outline gap-2 px-3 py-2 text-xs"
          >
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
            Upload image
          </button>
          {value && (
            <button
              type="button"
              onClick={() => {
                setError('')
                onChange('')
              }}
              className="btn-outline gap-2 px-3 py-2 text-xs text-red-600"
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </button>
          )}
          <input aria-label="Form input" title="Form input"
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <div className="mt-3">
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Or use an image URL</label>
          <input aria-label="Form input" title="Form input"
            value={value}
            onChange={handleUrlChange}
            className="input-base text-sm"
            placeholder="Paste image URL"
          />
        </div>

        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      </div>
    </div>
  )
}
