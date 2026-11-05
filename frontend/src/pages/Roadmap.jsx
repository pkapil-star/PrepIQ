import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { completeTopic, uncompleteTopic } from '../api/client'
import AppShell from '../components/AppShell'
import { resourcesFor } from '../data/resources'

const LEVEL_STYLE = {
  beginner: 'bg-emerald-500/10 text-emerald-300',
  intermediate: 'bg-amber-500/10 text-amber-300',
  advanced: 'bg-rose-500/10 text-rose-300',
}
const card = 'rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl'
const ghost = 'rounded-full px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-white/10'

const TYPE_LABEL = { video: 'Video', article: 'Article', course: 'Course', practice: 'Practice', book: 'Book', tool: 'Tool' }

// Collapsed by default so the roadmap stays scannable; opens to the links for one topic.
function Resources({ topic }) {
  const [open, setOpen] = useState(false)
  const links = resourcesFor(topic)
  if (!links.length) return null
  return (
    <div className="pb-3 pl-8">
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="text-xs text-indigo-300 transition-colors hover:text-indigo-200">
        {open ? 'Hide resources' : `Where to study (${links.length})`}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.ul
            className="mt-2 space-y-1.5 overflow-hidden"
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
          >
            {links.map((r) => (
              <li key={r.url}>
                <a
                  href={r.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition-colors hover:border-indigo-400/60 hover:bg-white/10"
                >
                  <span className="flex-1">{r.title}<span className="sr-only"> (opens in a new tab)</span></span>
                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wider text-slate-400">{TYPE_LABEL[r.type]}</span>
                  {r.paid && <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] uppercase tracking-wider text-amber-300">Paid</span>}
                  <span aria-hidden="true" className="text-slate-500">↗</span>
                </a>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Roadmap({ token, roadmap, email, onEditProfile, onRedoAssessment, onLogout }) {
  const [done, setDone] = useState(() => new Set()) // topic ids ticked in this session
  const [showSkipped, setShowSkipped] = useState(false)
  const [error, setError] = useState('')

  const actions = (
    <div className="flex items-center gap-1">
      <button onClick={onEditProfile} className={ghost}>Edit profile</button>
      <button onClick={onRedoAssessment} className={ghost}>Redo assessment</button>
      <button onClick={onLogout} className={ghost}>Log out</button>
    </div>
  )

  if (!roadmap) {
    return (
      <AppShell actions={actions}>
        <div className="mx-auto max-w-xl px-4 pt-16 text-center">
          <h1 className="text-3xl font-semibold">No roadmap yet</h1>
          <p className="mt-3 text-slate-400">Rate what you already know and we'll build your week-by-week plan.</p>
          <motion.button
            onClick={onRedoAssessment} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="mt-8 rounded-full bg-indigo-500 px-6 py-3 font-medium text-white hover:bg-indigo-400"
          >
            Start self-assessment →
          </motion.button>
        </div>
      </AppShell>
    )
  }

  const { weeks, skipped, budget_hours } = roadmap.roadmap_json
  const all = weeks.flatMap((w) => w.topics)
  const doneHours = all.filter((t) => done.has(t.topic_id)).reduce((sum, t) => sum + t.hours, 0)
  const totalHours = all.reduce((sum, t) => sum + t.hours, 0)

  async function toggle(topic) {
    const wasDone = done.has(topic.topic_id)
    setError('')
    // Optimistic: tick right away, roll back if the request fails.
    setDone((prev) => {
      const next = new Set(prev)
      if (wasDone) next.delete(topic.topic_id)
      else next.add(topic.topic_id)
      return next
    })
    try {
      await (wasDone ? uncompleteTopic : completeTopic)(token, topic.topic_id)
    } catch (err) {
      setError(err.message)
      setDone((prev) => {
        const next = new Set(prev)
        if (wasDone) next.add(topic.topic_id)
        else next.delete(topic.topic_id)
        return next
      })
    }
  }

  return (
    <AppShell actions={actions}>
      <div className="mx-auto max-w-3xl px-4 pb-20 pt-4">
        <p className="text-sm text-slate-400">{email}</p>
        <h1 className="mt-1 text-3xl font-semibold md:text-4xl">Your roadmap</h1>

        <div className={`${card} mt-6 p-5`}>
          <div className="flex items-baseline justify-between">
            <p className="text-sm text-slate-300">
              <span className="font-mono text-2xl text-white">{done.size}</span>
              <span className="text-slate-400"> of {all.length} topics done</span>
            </p>
            <p className="font-mono text-xs text-slate-400">
              {doneHours}/{totalHours} h planned · {budget_hours} h available
            </p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuemin={0} aria-valuemax={all.length} aria-valuenow={done.size}>
            <motion.div
              className="h-full origin-left rounded-full bg-linear-to-r from-indigo-500 to-amber-400"
              initial={false} animate={{ scaleX: all.length ? done.size / all.length : 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 30 }}
            />
          </div>
        </div>

        {error && <p role="alert" className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}

        <ol className="mt-8 space-y-5">
          {weeks.map((w) => (
            <motion.li
              key={w.week} className={`${card} p-4 md:p-6`}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }}
            >
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="text-lg font-semibold">Week {w.week}</h2>
                <span className="font-mono text-xs text-slate-400">{w.hours} h</span>
              </div>
              <ul className="divide-y divide-white/5">
                {w.topics.map((t) => {
                  const checked = done.has(t.topic_id)
                  return (
                    <li key={t.topic_id}>
                      <label className="flex cursor-pointer items-center gap-3 py-3">
                        <input type="checkbox" checked={checked} onChange={() => toggle(t)} className="peer sr-only" />
                        <span
                          aria-hidden="true"
                          className="grid size-5 shrink-0 place-items-center rounded-md border border-white/20 text-xs text-transparent transition-colors peer-checked:border-indigo-400 peer-checked:bg-indigo-500 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-300"
                        >
                          ✓
                        </span>
                        <span className={`flex-1 text-sm transition-colors ${checked ? 'text-slate-500 line-through' : 'text-slate-100'}`}>
                          {t.name}
                          {t.revision && <span className="ml-2 rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] uppercase tracking-wider text-indigo-300">Revise</span>}
                        </span>
                        <span className="hidden rounded-full bg-white/5 px-2 py-0.5 text-xs text-slate-400 sm:inline">{t.subject}</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs ${LEVEL_STYLE[t.level]}`}>{t.level}</span>
                        <span className="w-10 text-right font-mono text-xs text-slate-400">{t.hours}h</span>
                      </label>
                      <Resources topic={t} />
                    </li>
                  )
                })}
              </ul>
            </motion.li>
          ))}
        </ol>

        {skipped.length > 0 && (
          <div className="mt-8">
            <button onClick={() => setShowSkipped(!showSkipped)} aria-expanded={showSkipped} className={ghost}>
              {showSkipped ? 'Hide' : 'Show'} {skipped.length} topics that didn't fit your time
            </button>
            <AnimatePresence initial={false}>
              {showSkipped && (
                <motion.ul
                  className="mt-3 space-y-1 overflow-hidden px-4 text-sm text-slate-400"
                  initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                >
                  {skipped.map((t) => <li key={t.topic_id}>{t.name} <span className="text-slate-600">· {t.subject}</span></li>)}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </AppShell>
  )
}
