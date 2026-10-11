'use client'

import { useRef, useState } from 'react'
import { updateOrgMedia } from '../lib/api'
import { prepareImage, uploadOrgImage, deleteOrgImage, ACCEPT_ATTR } from '../lib/imageUpload'
import OrgAvatar from './OrgAvatar'

const GALLERY_MAX = 6

// Org dashboard → Organization tab. Every change saves immediately — no
// separate Save button — so an uploaded photo is never "lost" unsaved.
export default function OrgMediaManager({ org, onSaved }) {
  const [busy, setBusy] = useState('') // which slot is working: 'logo' | 'cover' | 'gallery' | url
  const [error, setError] = useState('')
  const [consent, setConsent] = useState(false)
  const logoInput = useRef(null)
  const coverInput = useRef(null)
  const galleryInput = useRef(null)

  async function run(slot, fn) {
    setBusy(slot)
    setError('')
    try {
      const updated = await fn()
      onSaved?.(updated)
    } catch (err) {
      setError(err.message ?? 'Something went wrong — try again.')
    }
    setBusy('')
  }

  function pickFile(e, handler) {
    const files = [...(e.target.files ?? [])]
    e.target.value = '' // let them re-pick the same file later
    if (files.length) handler(files)
  }

  const replaceLogo = ([file]) =>
    run('logo', async () => {
      const blob = await prepareImage(file, { maxSize: 512, square: true })
      const url = await uploadOrgImage(org.id, 'logo', blob)
      const updated = await updateOrgMedia(org.id, { logoUrl: url })
      deleteOrgImage(org.logoUrl)
      return updated
    })

  const replaceCover = ([file]) =>
    run('cover', async () => {
      const blob = await prepareImage(file, { maxSize: 1600 })
      const url = await uploadOrgImage(org.id, 'cover', blob)
      const updated = await updateOrgMedia(org.id, { imageUrl: url })
      deleteOrgImage(org.imageUrl)
      return updated
    })

  const addGallery = (files) =>
    run('gallery', async () => {
      const room = GALLERY_MAX - org.galleryUrls.length
      if (room <= 0) throw new Error(`You can have up to ${GALLERY_MAX} photos — remove one first.`)
      const urls = []
      for (const file of files.slice(0, room)) {
        const blob = await prepareImage(file, { maxSize: 1600 })
        urls.push(await uploadOrgImage(org.id, 'gallery', blob))
      }
      return updateOrgMedia(org.id, { galleryUrls: [...org.galleryUrls, ...urls] })
    })

  const removeField = (slot, field, url) =>
    run(slot, async () => {
      const updated = await updateOrgMedia(org.id, { [field]: null })
      deleteOrgImage(url)
      return updated
    })

  const removeGallery = (url) =>
    run(url, async () => {
      const updated = await updateOrgMedia(org.id, { galleryUrls: org.galleryUrls.filter((u) => u !== url) })
      deleteOrgImage(url)
      return updated
    })

  const btn = 'rounded-pill border border-card-border bg-card px-4 py-1.5 text-xs font-bold text-brand-green hover:bg-cream disabled:opacity-50'
  const removeBtn = 'text-xs font-bold text-coral hover:underline disabled:opacity-50'

  return (
    <section className="mt-6 flex flex-col gap-6 rounded-card border border-card-border bg-card p-5 shadow-card">
      <div>
        <h2 className="font-display text-xl font-extrabold text-brand-green">📸 Logo &amp; photos</h2>
        <p className="mt-1 text-sm text-brand-green/60">
          JPG, PNG, or WebP. We shrink them automatically and strip hidden location data from phone
          photos. Changes save right away.
        </p>
      </div>

      {/* Logo */}
      <div className="flex flex-wrap items-center gap-4">
        <OrgAvatar org={org} size="lg" />
        <div>
          <p className="text-sm font-bold text-brand-green">Logo</p>
          <p className="text-xs text-brand-green/50">Square works best — we'll crop to a circle.</p>
          <div className="mt-2 flex items-center gap-3">
            <button type="button" disabled={!!busy} onClick={() => logoInput.current.click()} className={btn}>
              {busy === 'logo' ? 'Uploading...' : org.logoUrl ? 'Change logo' : 'Upload logo'}
            </button>
            {org.logoUrl && (
              <button type="button" disabled={!!busy} onClick={() => removeField('logo', 'logoUrl', org.logoUrl)} className={removeBtn}>
                Remove
              </button>
            )}
          </div>
          <input ref={logoInput} type="file" accept={ACCEPT_ATTR} hidden onChange={(e) => pickFile(e, replaceLogo)} />
        </div>
      </div>

      {/* Cover */}
      <div>
        <p className="text-sm font-bold text-brand-green">Cover photo</p>
        <p className="text-xs text-brand-green/50">
          The wide banner at the top of your page and your listings. Landscape photos look best.
        </p>
        <div className="mt-2 flex h-36 items-center justify-center overflow-hidden rounded-card bg-cream">
          {org.imageUrl ? (
            <img src={org.imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-sm text-brand-green/40">No cover photo yet</span>
          )}
        </div>
        <div className="mt-2 flex items-center gap-3">
          <button type="button" disabled={!!busy} onClick={() => coverInput.current.click()} className={btn}>
            {busy === 'cover' ? 'Uploading...' : org.imageUrl ? 'Change cover' : 'Upload cover photo'}
          </button>
          {org.imageUrl && (
            <button type="button" disabled={!!busy} onClick={() => removeField('cover', 'imageUrl', org.imageUrl)} className={removeBtn}>
              Remove
            </button>
          )}
        </div>
        <input ref={coverInput} type="file" accept={ACCEPT_ATTR} hidden onChange={(e) => pickFile(e, replaceCover)} />
      </div>

      {/* Gallery */}
      <div>
        <p className="text-sm font-bold text-brand-green">
          Photo gallery ({org.galleryUrls.length}/{GALLERY_MAX})
        </p>
        <p className="text-xs text-brand-green/50">Show your org in action — events, your team, what you've built.</p>
        {org.galleryUrls.length > 0 && (
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {org.galleryUrls.map((url) => (
              <div key={url} className="relative overflow-hidden rounded-card bg-cream">
                <img src={url} alt="" className="aspect-[4/3] w-full object-cover" />
                <button
                  type="button"
                  disabled={!!busy}
                  onClick={() => removeGallery(url)}
                  className="absolute right-1.5 top-1.5 rounded-pill bg-card/90 px-2 py-0.5 text-[11px] font-bold text-coral shadow-soft disabled:opacity-50"
                >
                  {busy === url ? '...' : 'Remove'}
                </button>
              </div>
            ))}
          </div>
        )}
        {org.galleryUrls.length < GALLERY_MAX && (
          <>
            <label className="mt-3 flex items-start gap-2 text-xs text-brand-green">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[#1B5E38]"
              />
              <span>
                Everyone in these photos is OK with them being posted publicly — and for anyone under
                18, a parent or guardian is too.
              </span>
            </label>
            <button
              type="button"
              disabled={!!busy || !consent}
              onClick={() => galleryInput.current.click()}
              className={`mt-2 ${btn}`}
            >
              {busy === 'gallery' ? 'Uploading...' : '+ Add photos'}
            </button>
            <input
              ref={galleryInput}
              type="file"
              accept={ACCEPT_ATTR}
              multiple
              hidden
              onChange={(e) => pickFile(e, addGallery)}
            />
          </>
        )}
      </div>

      {error && <p className="text-sm font-semibold text-coral">{error}</p>}
    </section>
  )
}
