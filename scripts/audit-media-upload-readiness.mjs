import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

export const MEDIA_SCALE_SCENARIO = {
  vendors: 50,
  productsPerVendor: 50,
  variantsPerProduct: 20,
  imagesPerVariant: 5,
  rawBytesPerImage: 5 * 1024 * 1024,
}

export function estimateImageScale(input = MEDIA_SCALE_SCENARIO) {
  const imageCount = input.vendors * input.productsPerVendor * input.variantsPerProduct * input.imagesPerVariant
  const rawBytes = imageCount * input.rawBytesPerImage

  return {
    imageCount,
    rawBytes,
    rawGiB: rawBytes / 1024 / 1024 / 1024,
  }
}

async function readIfPresent(repoRoot, relativePath) {
  try {
    return await fs.readFile(path.join(repoRoot, relativePath), 'utf8')
  } catch {
    return ''
  }
}

export async function collectMediaUploadReadiness(repoRoot = process.cwd()) {
  const imageProcessing = await readIfPresent(repoRoot, 'src/backend/admin/image-processing.ts')
  const nextConfig = await readIfPresent(repoRoot, 'next.config.js')
  const productEditor = await readIfPresent(repoRoot, 'src/backend/admin/product-editor.ts')
  const bannerEditor = await readIfPresent(repoRoot, 'src/backend/admin/banner-editor.ts')
  const categoryEditor = await readIfPresent(repoRoot, 'src/backend/admin/category-editor.ts')
  const productForm = await readIfPresent(repoRoot, 'src/frontend/components/admin/ProductEditorForm.tsx')

  const source = [imageProcessing, nextConfig, productEditor, bannerEditor, categoryEditor, productForm].join('\n')

  return {
    checks: {
      usesSharp: /\bsharp\b/.test(imageProcessing),
      hasMaxUploadBytes: /MAX_IMAGE_UPLOAD_BYTES/.test(imageProcessing),
      hasDecodedPixelLimit: /MAX_DECODED_IMAGE_PIXELS/.test(imageProcessing),
      validatesMimeAgainstDecodedFormat: /metadata\.format !== expectedFormat/.test(imageProcessing),
      convertsToWebp: /\.webp\(/.test(imageProcessing),
      hasUploadProfiles: /IMAGE_UPLOAD_PROFILES/.test(imageProcessing),
      hasCentralLimitPolicy: /IMAGE_UPLOAD_LIMITS/.test(imageProcessing),
      hasVariantIntentPolicy: /IMAGE_UPLOAD_VARIANT_INTENTS/.test(imageProcessing),
      hasStorageBoundaryPolicy: /IMAGE_UPLOAD_STORAGE_POLICY/.test(imageProcessing),
      allowsRemoteImageHosts: /remotePatterns/.test(nextConfig),
      supportsNextImageFormats: /image\/webp/.test(nextConfig) && /image\/avif/.test(nextConfig),
      acceptsProductImageDataUrls: /data:image\//.test(productEditor),
      hasProductImageCountCap: /images: z\.array\(productImagePayloadSchema\)\.max\(20\)/.test(productEditor),
      categoryAndBannerPayloadsAllowLargeImageStrings: /500_000/.test(bannerEditor) && /500_000/.test(categoryEditor),
      generatesDerivedImageVariants: /persistOptimizedImageVariants|generatedVariantOutputs|writeImageVariantOutputs/.test(imageProcessing),
      objectStorageImplemented: /putObject|S3Client|R2|bucketName|cloudinary|uploadthing/i.test(imageProcessing),
    },
    scale: estimateImageScale(),
    scannedBytes: Buffer.byteLength(source, 'utf8'),
  }
}

async function main() {
  const readiness = await collectMediaUploadReadiness()
  console.log('Media upload readiness audit')
  for (const [key, value] of Object.entries(readiness.checks)) {
    console.log(`${key}: ${value ? 'yes' : 'no'}`)
  }
  console.log(`scaleExampleImages: ${readiness.scale.imageCount}`)
  console.log(`scaleExampleRawGiB: ${readiness.scale.rawGiB.toFixed(1)}`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : 'Media upload readiness audit failed')
    process.exitCode = 1
  })
}
