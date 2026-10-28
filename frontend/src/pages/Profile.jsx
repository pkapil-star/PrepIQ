import { useEffect, useState } from 'react'
import { getCompanies, getJobTitles, saveProfile } from '../api/client'

// Values match the experience buckets in backend/sql/schema.sql.
const EXPERIENCE = [
  ['Student', [
    ['student_new', 'First-timer (no interviews yet)'],
    ['student_interviewed', 'Have given interviews'],
    ['student_intern', 'Have done an internship'],
  ]],
  ['Working professional', [
    ['work_1_2', '1-2 years of experience'],
    ['work_2_4', '2-4 years of experience'],
    ['work_4plus', '4+ years of experience'],
  ]],
]

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

  const field = 'w-full border rounded px-3 py-2 bg-white'
  const label = 'block text-sm font-medium mb-1'

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white rounded-xl shadow p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Tell us about you</h1>
        <p className="text-sm text-slate-600">We use this to build your week-by-week roadmap.</p>

        <div>
          <label className={label}>Where are you right now?</label>
          <select required value={form.experience_bucket} onChange={set('experience_bucket')} className={field}>
            <option value="" disabled>Select…</option>
            {EXPERIENCE.map(([group, options]) => (
              <optgroup key={group} label={group}>
                {options.map(([value, text]) => <option key={value} value={value}>{text}</option>)}
              </optgroup>
            ))}
          </select>
        </div>

        <div>
          <label className={label}>Target job title</label>
          <select required value={form.job_title_id} onChange={set('job_title_id')} className={field}>
            <option value="" disabled>Select…</option>
            {jobTitles.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>

        <div>
          <label className={label}>Target company (optional)</label>
          <select value={form.company_id} onChange={set('company_id')} className={field}>
            <option value="">Any company</option>
            {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Weeks to prepare</label>
            <input type="number" required min={1} max={52} value={form.weeks} onChange={set('weeks')} className={field} />
          </div>
          <div>
            <label className={label}>Hours per day</label>
            <input type="number" required min={0.5} max={16} step={0.5} value={form.hours_per_day} onChange={set('hours_per_day')} className={field} />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={saving} className="w-full bg-indigo-600 text-white rounded py-2 disabled:opacity-50">
          {saving ? 'Saving…' : 'Save and continue'}
        </button>
      </form>
    </div>
  )
}
