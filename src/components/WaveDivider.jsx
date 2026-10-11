// A wavy edge between two differently-colored sections. Put it at the very
// top (or, with flip, bottom) of a section; `className` sets the wave's
// color via text-* (it fills with currentColor) — use the color of the
// section it's poking INTO.
export default function WaveDivider({ className = 'text-cream', flip = false }) {
  return (
    <div className={`pointer-events-none relative h-6 w-full overflow-hidden leading-none sm:h-10 ${className}`} aria-hidden>
      <svg
        viewBox="0 0 1200 40"
        preserveAspectRatio="none"
        className={`absolute inset-0 h-full w-full ${flip ? 'rotate-180' : ''}`}
        fill="currentColor"
      >
        <path d="M0 40V18c80 14 160 20 240 12S400 4 480 6s160 22 240 22 160-20 240-22 160 10 240 18V40z" />
      </svg>
    </div>
  )
}
