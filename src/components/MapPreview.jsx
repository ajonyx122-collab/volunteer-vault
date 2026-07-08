const PIN_COLORS = {
  environment: '#0F5132',
  sports: '#8A5410',
  food: '#8A6D00',
  art: '#94305C',
  music: '#1D5B9E',
  medicine: '#A03A28',
  animals: '#5B3E9E',
  education: '#0B6E64',
  community: '#3A5068',
  seniors: '#8A5A24',
  tech: '#3D4A9E',
  faith: '#6B5138',
  veterans: '#3E6B2F',
  disaster: '#B04A22',
  gardening: '#55701F',
}

// Deterministic pseudo-position so the same opportunity always lands in the
// same spot instead of jumping around on every render. Plain FNV-1a doesn't
// avalanche small differences (ids like "opp-1" vs "opp-2" differ by one
// byte, which barely moves the final hash), so we run the result through
// MurmurHash3's finalizer to spread that difference across all the bits.
function fmix32(h) {
  h ^= h >>> 16
  h = Math.imul(h, 0x85ebca6b)
  h ^= h >>> 13
  h = Math.imul(h, 0xc2b2ae35)
  h ^= h >>> 16
  return h >>> 0
}

function hashToUnit(str) {
  let hash = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return fmix32(hash) / 4294967295
}

export default function MapPreview({ opportunities }) {
  const shown = opportunities.slice(0, 8)

  return (
    <svg viewBox="0 0 300 180" className="h-40 w-full rounded-card bg-cream">
      <rect width="300" height="180" fill="#FDF8EE" />
      <path d="M0 40 Q 100 10, 300 60" stroke="#EDE6D4" strokeWidth="6" fill="none" />
      <path d="M0 140 Q 150 170, 300 120" stroke="#EDE6D4" strokeWidth="6" fill="none" />
      <path d="M60 0 Q 90 90, 40 180" stroke="#EDE6D4" strokeWidth="5" fill="none" />
      <path d="M240 0 Q 210 90, 260 180" stroke="#EDE6D4" strokeWidth="5" fill="none" />

      {shown.map((opp, i) => {
        const x = 24 + hashToUnit(opp.id) * 252
        const y = 24 + hashToUnit(opp.id + i) * 132
        const color = PIN_COLORS[opp.category] ?? '#1B4A30'
        return (
          <g key={opp.id} transform={`translate(${x}, ${y})`}>
            <title>{opp.title}</title>
            <circle r="7" fill={color} opacity="0.18" />
            <circle r="4" fill={color} stroke="#FFFFFF" strokeWidth="1.5" />
          </g>
        )
      })}
    </svg>
  )
}
