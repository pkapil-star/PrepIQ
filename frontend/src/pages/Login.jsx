import { lazy, Suspense, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { supabase } from '../api/supabase'
import AppShell from '../components/AppShell'

const HeroScene = lazy(() => import('../components/HeroScene'))

const MODES = [['login', 'Log in'], ['signup', 'Sign up']]
const field = 'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-slate-100 placeholder:text-slate-500 outline-none transition-colors focus:border-indigo-400 focus:bg-white/10'

export default function Login({ onBack }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)
  const noScroll = useRef(0) // HeroScene reacts to scroll progress; there is none on this page
  const reduced = useReducedMotion()
  // shortcut: checked once on mount, so resizing past 1024px won't add/remove the 3D panel; fine for a demo.
  const [wide] = useState(() => window.matchMedia('(min-width: 1024px)').matches)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setNotice('')
    setLoading(true)
    try {
      const auth = supabase.auth
      const { data, error } = mode === 'login'
        ? await auth.signInWithPassword({ email, password })
        : await auth.signUp({ email, password })
      if (error) throw error
      // With email confirmation on, signUp returns no session until the user confirms.
      if (mode === 'signup' && !data.session) setNotice('Check your email to confirm your account, then log in.')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function switchMode(next) {
    setMode(next)
    setError('')
    setNotice('')
  }

  const actions = onBack && (
    <button type="button" onClick={onBack} className="rounded-full px-4 py-2 text-sm text-slate-300 hover:bg-white/10">← Back to home</button>
  )

  return (
    <AppShell actions={actions}>
      <div className="mx-auto grid min-h-[calc(100vh-4.5rem)] max-w-6xl items-center gap-10 px-4 pb-10 lg:grid-cols-2 md:px-10">
        {wide && (
          <div className="hidden lg:block">
            <div className="relative h-[28rem]">
              <Suspense fallback={null}>
                <HeroScene progress={noScroll} reducedMotion={!!reduced} />
              </Suspense>
            </div>
            <div>
              <p className="text-sm font-medium uppercase tracking-widest text-indigo-300">Interview prep, ranked</p>
              <p className="mt-2 max-w-sm text-2xl font-semibold">Every topic, ordered by what matters for you.</p>
            </div>
          </div>
        )}

        <motion.form
          onSubmit={handleSubmit}
          className="mx-auto w-full max-w-sm space-y-5 rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-2xl shadow-indigo-950/50 backdrop-blur-xl md:p-8"
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 220, damping: 24 }}
        >
          <div>
            <h1 className="text-2xl font-semibold">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={mode} className="mt-1 text-sm text-slate-400"
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}
              >
                {mode === 'login' ? 'Log in to see your roadmap.' : 'Create an account to build your roadmap.'}
              </motion.p>
            </AnimatePresence>
          </div>

          <div role="group" aria-label="Choose log in or sign up" className="grid grid-cols-2 rounded-full bg-white/5 p-1">
            {MODES.map(([value, text]) => (
              <button
                key={value} type="button" aria-pressed={mode === value} onClick={() => switchMode(value)}
                className={`relative rounded-full py-2 text-sm transition-colors ${mode === value ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {mode === value && <motion.span layoutId="auth-mode" className="absolute inset-0 rounded-full bg-indigo-500" transition={{ type: 'spring', stiffness: 500, damping: 35 }} />}
                <span className="relative">{text}</span>
              </button>
            ))}
          </div>

          <label className="block text-sm">
            <span className="mb-1.5 block text-slate-300">Email</span>
            <input type="email" required autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-slate-300">Password</span>
            <span className="relative block">
              <input
                type={showPassword ? 'text' : 'password'} required minLength={6} placeholder="6+ characters" value={password}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                onChange={(e) => setPassword(e.target.value)} className={`${field} pr-16`}
              />
              <button
                type="button" onClick={() => setShowPassword(!showPassword)} aria-pressed={showPassword}
                className="absolute inset-y-0 right-2 my-auto h-7 rounded px-2 text-xs text-slate-400 hover:text-slate-200"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </span>
          </label>

          {error && <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
          {notice && <p role="status" className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{notice}</p>}

          <motion.button
            type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            className="w-full rounded-full bg-indigo-500 py-2.5 font-medium text-white transition-colors hover:bg-indigo-400 disabled:opacity-50"
          >
            {loading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Sign up'}
          </motion.button>
        </motion.form>
      </div>
    </AppShell>
  )
}
