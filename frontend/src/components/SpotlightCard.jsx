import { useRef } from 'react'

// Adapted from React Bits "SpotlightCard": a radial glow that follows the pointer. Pure CSS vars, no animation library.
export default function SpotlightCard({ children, className = '' }) {
  const card = useRef()

  function handleMove(e) {
    const rect = card.current.getBoundingClientRect()
    card.current.style.setProperty('--x', `${e.clientX - rect.left}px`)
    card.current.style.setProperty('--y', `${e.clientY - rect.top}px`)
  }

  return (
    <div
      ref={card} onPointerMove={handleMove}
      className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: 'radial-gradient(320px circle at var(--x) var(--y), rgba(99,102,241,0.25), transparent 70%)' }}
      />
      <div className="relative">{children}</div>
    </div>
  )
}
