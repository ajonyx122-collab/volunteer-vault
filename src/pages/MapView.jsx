import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { CATEGORIES } from '../data/mockData'
import { cityCoordFor } from '../data/cityCoords'
import { PIN_COLORS, hashToUnit } from '../lib/mapColors'
import { fetchOpportunities } from '../lib/api'

const US_CENTER = [39.5, -98.35]

// Same-city listings would otherwise stack exactly on top of each other —
// spread them within roughly a 3-mile radius, deterministically per id so a
// pin never jumps around between renders.
function jitter(coord, seed) {
  const [lat, lng] = coord
  const dLat = (hashToUnit(seed) - 0.5) * 0.05
  const dLng = (hashToUnit(seed + '-lng') - 0.5) * 0.05
  return [lat + dLat, lng + dLng]
}

export default function MapView() {
  const [opportunities, setOpportunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState(null)

  useEffect(() => {
    fetchOpportunities()
      .then(setOpportunities)
      .catch(() => setOpportunities([]))
      .finally(() => setLoading(false))
  }, [])

  const pinned = useMemo(() => {
    return opportunities
      .filter((o) => !o.isOnline && !o.remote && !o.org?.remote)
      .map((o) => {
        const city = o.city || o.org?.city
        const state = o.state || o.org?.state
        const base = cityCoordFor(city, state)
        return base ? { ...o, position: jitter(base, o.id) } : null
      })
      .filter(Boolean)
      .filter((o) => !activeCategory || o.category === activeCategory)
  }, [opportunities, activeCategory])

  const remoteCount = opportunities.filter((o) => o.isOnline || o.remote || o.org?.remote).length

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link to="/browse" className="text-sm font-semibold text-brand-green/60 hover:text-brand-green">
        ← Back to browse
      </Link>
      <h1 className="mt-2 font-display text-3xl font-extrabold text-brand-green">Map</h1>
      <p className="mt-1 text-brand-green/60">
        {loading ? 'Loading...' : `${pinned.length} in-person opportunities near their cities.`}
        {!loading && remoteCount > 0 && (
          <>
            {' '}
            <Link to="/browse?remote=1" className="font-bold text-coral hover:underline">
              {remoteCount} more are remote
            </Link>{' '}
            — those don't have one fixed spot, so find them on Browse instead.
          </>
        )}
      </p>

      <div className="scrollbar-none mt-4 flex gap-2 overflow-x-auto pb-1">
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

      <div className="mt-4 h-[65vh] overflow-hidden rounded-card border border-card-border shadow-card">
        <MapContainer center={US_CENTER} zoom={4} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {pinned.map((o) => (
            <CircleMarker
              key={o.id}
              center={o.position}
              radius={8}
              pathOptions={{
                color: '#FFFFFF',
                weight: 2,
                fillColor: PIN_COLORS[o.category] ?? '#1B4A30',
                fillOpacity: 0.9,
              }}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-bold text-brand-green">{o.title}</p>
                  <p className="text-brand-green/70">{o.org?.name}</p>
                  <Link to={`/opportunities/${o.id}`} className="font-bold text-coral hover:underline">
                    See details →
                  </Link>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}
