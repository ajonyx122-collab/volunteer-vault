'use client'

import dynamic from 'next/dynamic'

// Leaflet touches `window` at import time, which breaks the server render
// pass — load it client-only.
const MapViewClient = dynamic(() => import('../../components/MapViewClient'), { ssr: false })

export default function MapView() {
  return <MapViewClient />
}
