import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react'
import { generateRoadmap, getJobTitles, getTopics, saveSkills } from '../api/client'
import AppShell from '../components/AppShell'
import SpotlightCard from '../components/SpotlightCard'

// ids match topics.subject (backend/sql/schema.sql). Communication has no topics yet, so ranking it changes no ratings.
const AREAS = [
  { id: 'DSA', name: 'DSA', description: 'Arrays, trees, graphs and solving coding problems.' },
  { id: 'OS', name: 'Operating Systems', description: 'Processes, memory and how a computer runs programs.' },
  { id: 'DBMS', name: 'DBMS', description: 'SQL, indexes and how databases store data.' },
  { id: 'CN', name: 'Computer Networks (CNS)', description: 'TCP/IP, HTTP and how machines talk to each other.' },
  { id: 'OOP', name: 'OOP', description: 'Classes, inheritance and designing clean code.' },
  { id: 'Communication', name: 'Communication Skills', description: 'Explaining your thinking clearly in interviews.' },
]
const CARD_COUNT = AREAS.length + 1 // plus the role-specific card

// Keyed by job_titles.slug. Every role's card has the id 'Role-specific', matching the topic subject.
const ROLE_AREAS = {
  sde: { name: 'Software Engineering', description: 'Testing, version control and shipping real projects.' },
  fde: { name: 'Customer Engineering', description: 'Working with clients and integrating systems on site.' },
  cloud: { name: 'Cloud Platforms', description: 'Compute, storage and scaling on AWS, Azure or GCP.' },
  cyber: { name: 'Security Basics', description: 'Common attacks, encryption and keeping systems safe.' },
  web: { name: 'Web Development', description: 'Browsers, APIs and building full web apps.' },
  'data-ml': { name: 'Data & Machine Learning', description: 'Statistics, data pipelines and training models.' },
  devops: { name: 'DevOps & Reliability', description: 'CI/CD, containers and keeping services running.' },
  qa: { name: 'Testing & Automation', description: 'Test design, automation tools and finding bugs early.' },
}

const TILT_DEGREES = 10
const TILT_SPRING = { stiffness: 220, damping: 18 }
const POP_SPRING = { type: 'spring', stiffness: 500, damping: 18 }
const PERSPECTIVE = 900

const button = 'rounded-full bg-indigo-500 font-medium text-white transition-colors hover:bg-indigo-400 disabled:opacity-50'
const cardWidth = 'w-[calc(50%-0.5rem)] lg:w-[calc(25%-0.75rem)]'

function ErrorMessage({ children }) {
  return <p role="alert" className="mt-6 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{children}</p>
}

// The outer div stays still and reads the pointer, so a tilting edge can't slip out from under the cursor.
function Tilt({ className = '', style, children }) {
  const reduced = useReducedMotion()
  const x = useMotionValue(0) // -0.5 (left edge) to 0.5 (right edge)
  const y = useMotionValue(0)
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-TILT_DEGREES, TILT_DEGREES]), TILT_SPRING)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [TILT_DEGREES, -TILT_DEGREES]), TILT_SPRING)

  function handleMove(e) {
    if (reduced || e.pointerType === 'touch') return
    const rect = e.currentTarget.getBoundingClientRect()
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  function handleLeave() {
    x.set(0)
    y.set(0)
  }

  return (
    <div onPointerMove={handleMove} onPointerLeave={handleLeave}>
      <motion.div
        className={`relative rounded-2xl ${className}`}
        tabIndex={-1} // whileTap would otherwise add tabindex=0, a dead tab stop before the real button
        style={{ ...style, rotateX, rotateY, transformPerspective: PERSPECTIVE, transformStyle: 'preserve-3d' }}
        whileHover={reduced ? undefined : { scale: 1.04, z: 24 }}
        whileTap={{ scale: 0.96 }}
      >
        {children}
      </motion.div>
    </div>
  )
}

function AreaCard({ area, rank, index, disabled, onToggle }) {
  const reduced = useReducedMotion()
  // Same indigo-to-amber scale as the HeroScene nodes: weakest indigo, strongest amber.
  const color = rank && `color-mix(in oklab, #818cf8, #fbbf24 ${((rank - 1) / (CARD_COUNT - 1)) * 100}%)`

  return (
    <motion.div
      className={cardWidth}
      style={{ transformPerspective: PERSPECTIVE }}
      initial={{ opacity: 0, y: 40, rotateX: -45 }} animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 22, delay: reduced ? 0 : index * 0.07 }}
    >
      <Tilt className={rank ? 'shadow-[0_0_36px_-6px_var(--rank)]' : ''} style={{ '--rank': color }}>
        {/* The button goes inside SpotlightCard because SpotlightCard is a div, which a button can't validly contain. */}
        <SpotlightCard className={`bg-slate-900/60! p-0! backdrop-blur-xl transition-colors ${rank ? 'border-(--rank)!' : 'hover:border-white/25!'}`}>
          <button
            type="button" onClick={onToggle} disabled={disabled} aria-pressed={!!rank}
            aria-label={`${area.name}, ${rank ? `ranked ${rank}` : 'not ranked'}`} aria-describedby={`area-${area.id}`}
            className="flex h-44 w-full cursor-pointer flex-col justify-end rounded-2xl p-4 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-300 disabled:cursor-default md:p-5"
          >
            <span className="font-semibold leading-snug md:text-lg">{area.name}</span>
            <span id={`area-${area.id}`} className="mt-1 text-xs text-slate-400 md:text-sm">{area.description}</span>
          </button>
        </SpotlightCard>

        {/* A sibling of the card: SpotlightCard's overflow-hidden would flatten it and lose the 3D float. */}
        <AnimatePresence initial={false}>
          {rank && (
            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-3 flex h-12 w-12 items-center justify-center rounded-full bg-(--rank) font-mono text-2xl font-bold text-slate-950 shadow-lg shadow-slate-950/60"
              initial={{ scale: 0, z: 40 }} animate={{ scale: 1, z: 40 }} exit={{ scale: 0, z: 40 }} transition={POP_SPRING}
            >
              {rank}
            </motion.span>
          )}
        </AnimatePresence>
      </Tilt>
    </motion.div>
  )
}

export default function Ranking({ token, profile, onDone }) {
  const [started, setStarted] = useState(false)
  const [topics, setTopics] = useState(null)
  const [roleArea, setRoleArea] = useState(null)
  const [order, setOrder] = useState([]) // area ids, weakest first, so a card's rank is its index + 1
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([getTopics(profile.job_title_id, profile.experience_bucket), getJobTitles()])
      .then(([loadedTopics, titles]) => {
        const title = titles.find((t) => t.id === profile.job_title_id)
        const role = ROLE_AREAS[title?.slug] ?? { name: title?.name ?? 'Role skills', description: 'Skills specific to your target role.' }
        setTopics(loadedTopics)
        setRoleArea({ id: 'Role-specific', ...role })
      })
      .catch((err) => setError(err.message))
  }, [profile.job_title_id, profile.experience_bucket])

  const allRanked = order.length === CARD_COUNT

  function toggle(id) {
    setOrder(order.includes(id) ? order.filter((area) => area !== id) : [...order, id])
  }

  function ratingForSubject(subject) {
    const id = AREAS.some((area) => area.id === subject) ? subject : 'Role-specific'
    return order.indexOf(id) / (CARD_COUNT - 1)
  }

  async function submit(skip = false) {
    setError('')
    setSaving(true)
    try {
      // PUT /me/skills rejects an empty list, and tracks without a seeded baseline have no topics yet.
      if (topics.length) {
        await saveSkills(token, topics.map((t) => ({ topic_id: t.id, self_rating: skip ? 0 : ratingForSubject(t.subject) })))
      }
      onDone(await generateRoadmap(token))
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <AppShell>
      <AnimatePresence mode="wait">
        {!started ? (
          <motion.div
            key="intro" className="flex min-h-[calc(100vh-4.5rem)] items-center justify-center px-4 pb-16"
            exit={{ opacity: 0, scale: 0.9, y: -24 }} transition={{ duration: 0.25 }}
          >
            <div className="w-full max-w-xl">
              <Tilt>
                <SpotlightCard className="bg-slate-900/60! p-8! text-center shadow-2xl shadow-indigo-950/50 backdrop-blur-xl md:p-12!">
                  <p className="text-xs font-medium uppercase tracking-widest text-indigo-300">Step 2 of 2</p>
                  <h1 className="mt-3 text-3xl font-semibold md:text-4xl">Where do you stand?</h1>
                  <p className="mt-3 text-slate-400">Rank your areas from weakest to strongest</p>
                  <button type="button" onClick={() => setStarted(true)} className={`${button} mt-8 px-8 py-3`}>
                    Let's do it →
                  </button>
                </SpotlightCard>
              </Tilt>
            </div>
          </motion.div>
        ) : (
          <motion.div key="board" className="mx-auto max-w-5xl px-4 pb-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="sticky top-3 z-20 mb-6 rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl">
              <p className="text-xs font-medium uppercase tracking-widest text-indigo-300">Step 2 of 2</p>
              <h1 className="mt-1 text-2xl font-semibold md:text-3xl">Rank your areas</h1>
              <div className="mt-3 flex items-center gap-3">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full origin-left rounded-full bg-linear-to-r from-indigo-500 to-amber-400"
                    initial={false} animate={{ scaleX: order.length / CARD_COUNT }} transition={{ type: 'spring', stiffness: 200, damping: 30 }}
                  />
                </div>
                <span className="font-mono text-xs text-slate-400" aria-live="polite">{order.length}/{CARD_COUNT} ranked</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-sm text-slate-400">Tap your weakest area first</p>
                <button
                  type="button" onClick={() => setOrder([])} disabled={saving || order.length === 0}
                  className="rounded-full px-3 py-1 text-sm text-slate-300 hover:bg-white/10 disabled:opacity-40"
                >
                  Reset
                </button>
              </div>
            </div>

            {roleArea ? (
              <>
                <div className="flex flex-wrap justify-center gap-4">
                  {[...AREAS, roleArea].map((area, i) => {
                    const position = order.indexOf(area.id)
                    return (
                      <AreaCard
                        key={area.id} area={area} index={i} disabled={saving}
                        rank={position === -1 ? null : position + 1} onToggle={() => toggle(area.id)}
                      />
                    )
                  })}
                </div>

                {error && <ErrorMessage>{error}</ErrorMessage>}

                <motion.button
                  type="button" onClick={() => submit()} disabled={saving || !allRanked}
                  whileHover={allRanked ? { scale: 1.01 } : undefined} whileTap={allRanked ? { scale: 0.98 } : undefined}
                  className={`${button} mx-auto mt-8 block w-full max-w-md py-3`}
                >
                  {saving ? 'Building your roadmap…' : 'Build my roadmap →'}
                </motion.button>
                <div className="mt-4 text-center">
                  <button type="button" onClick={() => submit(true)} disabled={saving} className="rounded-full px-3 py-1.5 text-sm text-slate-400 hover:bg-white/10 disabled:opacity-50">
                    Skip, I'm starting from scratch
                  </button>
                </div>
              </>
            ) : error ? (
              <ErrorMessage>{error}</ErrorMessage>
            ) : (
              <div className="flex flex-wrap justify-center gap-4" aria-busy="true">
                {Array.from({ length: CARD_COUNT }, (_, i) => (
                  <div key={i} className={`h-44 animate-pulse rounded-2xl bg-white/5 ${cardWidth}`} />
                ))}
                <span className="sr-only">Loading your areas…</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  )
}
