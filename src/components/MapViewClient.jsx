'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { CATEGORIES } from '../data/mockData'
import { opportunityPath } from '../lib/opportunityUrls'
import { groupOpportunitiesByCity } from '../lib/mapGrouping'
import { PIN_COLORS } from '../lib/mapColors'
import { fetchOpportunities } from '../lib/api'

const US_CENTER = [39.5, -98.35]

// A numbered circle instead of a plain dot — clicking it should tell you
// "12 opportunities here", not require you to already know that before
// clicking. One category filtered in → that category's color; otherwise a
// neutral brand green since the cluster is a mix.
function clusterIcon(count, color) {
  const size = count >= 10 ? 34 : count >= 3 ? 28 : 22
  return L.divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:9999px;
      background:${color};color:#fff;border:2px solid #fff;
      display:flex;align-items:center;justify-content:center;
      font-family:'Poppins',sans-serif;font-weight:800;font-size:${count >= 10 ? 13 : 12}px;
      box-shadow:0 2px 6px rgba(0,0,0,0.25);
    ">${count}</div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

export default function MapViewClient() {
  const [opportunities, setOpportunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState(null)

  useEffect(() => {
    fetchOpportunities()
      .then(setOpportunities)
      .catch(() => setOpportunities([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(
    () => opportunities.filter((o) => !activeCategory || o.category === activeCategory),
    [opportunities, activeCategory],
  )

  const groups = useMemo(() => groupOpportunitiesByCity(filtered), [filtered])
  const pinnedCount = groups.reduce((sum, g) => sum + g.items.length, 0)
  const remoteCount = filtered.filter((o) => o.isOnline || o.remote || o.org?.remote).length

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link href="/browse" className="text-sm font-semibold text-brand-green/60 hover:text-brand-green">
        ← Back to browse
      </Link>
      <h1 className="mt-2 font-display text-3xl font-extrabold text-brand-green">Map</h1>
      <p className="mt-1 text-brand-green/60">
        {loading ? 'Loading...' : `${pinnedCount} in-person opportunities across ${groups.length} areas.`}
        {!loading && remoteCount > 0 && (
          <>
            {' '}
            <Link href="/browse?remote=1" className="font-bold text-coral hover:underline">
              {remoteCount} more are remote
            </Link>{' '}
            — those don't have one fixed spot, so find them on Browse instead.
          </>
        )}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory(null)}
          className={`shrink-0 rounded-pill px-4 py-2 text-sm font-bold shadow-card transition-transform hover:scale-105 ${
            !activeCategory ? 'bg-brand-green text-cream-text' : 'bg-card text-brand-green border border-card-border'
          }`}
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(activeCategory === c.id ? null : c.id)}
            className={`shrink-0 rounded-pill px-4 py-2 text-sm font-bold shadow-card transition-transform hover:scale-105 ${
              activeCategory === c.id
                ? 'bg-brand-green text-cream-text'
                : 'bg-card text-brand-green border border-card-border'
            }`}
          >
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      <p className="mt-3 text-xs text-brand-green/50">
        Each pin is a whole area — click one to see every opportunity there, not just one at a time.
      </p>

      <div className="mt-2 h-[65vh] overflow-hidden rounded-card border border-card-border shadow-card">
        <MapContainer center={US_CENTER} zoom={4} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {groups.map((g) => {
            const color = activeCategory
              ? PIN_COLORS[activeCategory] ?? '#1B4A30'
              : g.items.length === 1
                ? PIN_COLORS[g.items[0].category] ?? '#1B4A30'
                : '#1B4A30'
            return (
              <Marker key={g.key} position={g.position} icon={clusterIcon(g.items.length, color)}>
                <Popup maxWidth={280}>
                  <div className="text-sm">
                    <p className="font-bold text-brand-green">
                      {g.city}, {g.state} · {g.items.length} opportunit{g.items.length === 1 ? 'y' : 'ies'}
                    </p>
                    <div className="mt-2 flex max-h-48 flex-col gap-2 overflow-y-auto pr-1">
                      {g.items.map((o) => (
                        <div key={o.id} className="border-t border-card-border pt-2 first:border-0 first:pt-0">
                          <Link href={opportunityPath(o)} className="font-semibold text-brand-green hover:underline">
                            {o.title}
                          </Link>
                          <p className="text-xs text-brand-green/60">{o.org?.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>
      </div>
    </div>
  )
}
