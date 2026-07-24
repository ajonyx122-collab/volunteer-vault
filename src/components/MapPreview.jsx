'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { groupOpportunitiesByCity } from '../lib/mapGrouping'
import { PIN_COLORS } from '../lib/mapColors'

const US_CENTER = [39.5, -98.35]

// Reactively re-fits the view whenever the filtered pin set changes (state,
// zip, category...) — a plain `bounds` prop on MapContainer only applies
// once on mount, so this is the react-leaflet way to keep it live.
function FitBounds({ positions }) {
  const map = useMap()
  useEffect(() => {
    if (positions.length === 0) {
      map.setView(US_CENTER, 3)
    } else if (positions.length === 1) {
      map.setView(positions[0], 9)
    } else {
      map.fitBounds(positions, { padding: [24, 24], maxZoom: 9 })
    }
  }, [positions, map])
  return null
}

// A real (non-interactive) preview of where the currently filtered
// opportunities actually are — not a mock — so it moves with state/zip/
// category filters exactly the way "Open full map" does.
export default function MapPreview({ opportunities }) {
  const groups = groupOpportunitiesByCity(opportunities)
  const positions = groups.map((g) => g.position)

  return (
    <div className="h-40 w-full overflow-hidden rounded-card">
      <MapContainer
        center={US_CENTER}
        zoom={3}
        style={{ height: '100%', width: '100%' }}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FitBounds positions={positions} />
        {groups.map((g) => {
          const color = g.items.length === 1 ? PIN_COLORS[g.items[0].category] ?? '#1B4A30' : '#1B4A30'
          return (
            <CircleMarker
              key={g.key}
              center={g.position}
              radius={g.items.length > 1 ? 7 : 5}
              pathOptions={{ color: '#FFFFFF', weight: 1.5, fillColor: color, fillOpacity: 0.9 }}
            >
              <Tooltip direction="top">
                {g.city}, {g.state} · {g.items.length}
              </Tooltip>
            </CircleMarker>
          )
        })}
      </MapContainer>
    </div>
  )
}
