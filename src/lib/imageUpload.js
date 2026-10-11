import { supabase } from './supabaseClient'

const BUCKET = 'org-media'
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']
export const ACCEPT_ATTR = ACCEPTED.join(',')
const MAX_INPUT_BYTES = 15 * 1024 * 1024 // before resizing; phone photos run big

// Resize + re-encode in the browser before uploading. Redrawing onto a
// canvas also strips EXIF metadata — including the GPS location phones embed
// in photos, which matters here because a lot of these orgs are run by
// minors. `square` center-crops (for logos).
export async function prepareImage(file, { maxSize, square = false }) {
  if (!ACCEPTED.includes(file.type)) throw new Error('Please pick a JPG, PNG, or WebP image.')
  if (file.size > MAX_INPUT_BYTES) throw new Error('That image is over 15 MB — try a smaller one.')

  const bitmap = await createImageBitmap(file) // applies EXIF rotation
  let sx = 0
  let sy = 0
  let sw = bitmap.width
  let sh = bitmap.height
  if (square) {
    const side = Math.min(sw, sh)
    sx = (sw - side) / 2
    sy = (sh - side) / 2
    sw = sh = side
  }
  const scale = Math.min(1, maxSize / Math.max(sw, sh))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(sw * scale)
  canvas.height = Math.round(sh * scale)
  canvas.getContext('2d').drawImage(bitmap, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)
  bitmap.close?.()

  const toBlob = (type, quality) => new Promise((resolve) => canvas.toBlob(resolve, type, quality))
  // WebP keeps logo transparency and is small. Older Safari can't encode it
  // (hands back a PNG instead), so fall back: PNG for logos, JPEG for photos.
  let blob = await toBlob('image/webp', 0.85)
  if (!blob || blob.type !== 'image/webp') {
    blob = square ? await toBlob('image/png') : await toBlob('image/jpeg', 0.85)
  }
  return blob
}

const EXT = { 'image/webp': 'webp', 'image/png': 'png', 'image/jpeg': 'jpg' }

// kind: 'logo' | 'cover' | 'gallery'. Returns the public URL.
export async function uploadOrgImage(orgId, kind, blob) {
  const path = `${orgId}/${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${EXT[blob.type] ?? 'jpg'}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: blob.type,
    cacheControl: '31536000',
  })
  if (error) throw error
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}

// Best-effort cleanup of a file we uploaded. Ignores URLs that aren't in our
// bucket (e.g. an old pasted-in logo link) and never throws — a leftover
// file is harmless, a failed save isn't.
export async function deleteOrgImage(url) {
  const marker = `/storage/v1/object/public/${BUCKET}/`
  const i = url?.indexOf(marker) ?? -1
  if (i === -1) return
  const path = decodeURIComponent(url.slice(i + marker.length))
  try {
    await supabase.storage.from(BUCKET).remove([path])
  } catch {
    // leave it
  }
}
