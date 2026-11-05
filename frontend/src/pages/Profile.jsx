import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { getCompanies, getJobTitles, saveProfile } from '../api/client'
import AppShell from '../components/AppShell'

// Values match the experience buckets in backend/sql/schema.sql.
const EXPERIENCE = [
  ['Student', [
    ['student_new', 'First-timer', 'No interviews yet'],
    ['student_interviewed', 'Interviewed before', 'Have given interviews'],
    ['student_intern', 'Interned', 'Have done an internship'],
  ]],
  ['Working professional', [
    ['work_1_2', '1-2 years', 'of experience'],
    ['work_2_4', '2-4 years', 'of experience'],
    ['work_4plus', '4+ years', 'of experience'],
  ]],
]

// Fields fade up one after another when the form appears.
const list = { show: { transition: { staggerChildren: 0.07 } } }
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }

const field = 'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-slate-100 outline-none transition-colors focus:border-indigo-400 [&_option]:bg-slate-900'
const label = 'mb-2 block text-sm font-medium text-slate-300'

export default function Profile({ token, initial, onSaved }) {
  const [jobTitles, setJobTitles] = useState([])
  const [companies, setCompanies] = useState([])
  const [form, setForm] = useState({
    experience_bucket: initial?.experience_bucket || '',
    job_title_id: initial?.job_title_id || '',
    company_id: initial?.company_id || '',
    weeks: initial?.weeks || 8,
    hours_per_day: initial?.hours_per_day || 2,
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([getJobTitles(), getCompanies()])
      .then(([titles, comps]) => { setJobTitles(titles); setCompanies(comps) })
      .catch((err) => setError(err.message))
  }, [])

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const saved = await saveProfile(token, {
        experience_bucket: form.experience_bucket,
        job_title_id: Number(form.job_title_id),
        company_id: form.company_id ? Number(form.company_id) : null,
        weeks: Number(form.weeks),
        hours_per_day: Number(form.hours_per_day),
      })
      onSaved(saved)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const totalHours = Math.round(form.weeks * 7 * form.hours_per_day)

  return (
    <AppShell>
      <div className="flex justify-center px-4 pb-16 pt-4">
        <motion.form
          onSubmit={handleSubmit} variants={list} initial="hidden" animate="show"
          className="w-full max-w-2xl space-y-8 rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl md:p-10"
        >
          <motion.div variants={item}>
            <p className="text-xs font-medium uppercase tracking-widest text-indigo-300">Step 1 of 2</p>
            <h1 className="mt-2 text-3xl font-semibold">Tell us about you</h1>
            <p className="mt-1 text-sm text-slate-400">We use this to build your week-by-week roadmap.</p>
          </motion.div>

          <motion.fieldset variants={item}>
            <legend className={label}>Where are you right now?</legend>
            <div className="space-y-4">
              {EXPERIENCE.map(([group, options]) => (
                <div key={group}>
                  <p className="mb-2 text-xs uppercase tracking-wider text-slate-500">{group}</p>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {options.map(([value, title, hint]) => {
                      const selected = form.experience_bucket === value
                      return (
                        <label
                          key={value}
                          className={`relative cursor-pointer rounded-xl border p-3 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-indigo-400 ${selected ? 'border-indigo-400' : 'border-white/10 hover:border-white/25'}`}
                        >
                          <input type="radio" name="experience" required value={value} checked={selected} onChange={set('experience_bucket')} className="sr-only" />
                          {selected && <motion.span layoutId="experience" className="absolute inset-0 rounded-xl bg-indigo-500/15" transition={{ type: 'spring', stiffness: 500, damping: 35 }} />}
                          <span className="relative block text-sm font-medium">{title}</span>
                          <span className="relative block text-xs text-slate-400">{hint}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.fieldset>

          <motion.div variants={item} className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className={label}>Target job title</span>
              <select required value={form.job_title_id} onChange={set('job_title_id')} className={field}>
                <option value="" disabled>Select…</option>
                {jobTitles.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </label>
            <label className="block">
              <span className={label}>Target company (optional)</span>
              <select value={form.company_id} onChange={set('company_id')} className={field}>
                <option value="">Any company</option>
                {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
          </motion.div>

          <motion.div variants={item} className="grid gap-6 sm:grid-cols-2">
            <label className="block">
              <span className={`${label} flex justify-between`}>Weeks to prepare <span className="font-mono text-indigo-300">{form.weeks}</span></span>
              <input type="range" required min={1} max={52} value={form.weeks} onChange={set('weeks')} className="w-full accent-indigo-400" />
            </label>
            <label className="block">
              <span className={`${label} flex justify-between`}>Hours per day <span className="font-mono text-amber-300">{form.hours_per_day}</span></span>
              <input type="range" required min={0.5} max={16} step={0.5} value={form.hours_per_day} onChange={set('hours_per_day')} className="w-full accent-amber-400" />
            </label>
            <p className="text-sm text-slate-400 sm:col-span-2">
              That's about <span className="font-semibold text-slate-100">{totalHours} hours</span> of prep in total.
            </p>
          </motion.div>

          {error && <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}

          <motion.button
            variants={item} type="submit" disabled={saving} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            className="w-full rounded-full bg-indigo-500 py-3 font-medium text-white transition-colors hover:bg-indigo-400 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save and continue →'}
          </motion.button>
        </motion.form>
      </div>
    </AppShell>
  )
}
