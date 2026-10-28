import { useState } from 'react'
import { supabase } from '../api/supabase'

export default function Login() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white rounded-xl shadow p-6 space-y-4">
        <h1 className="text-2xl font-semibold">PrepIQ</h1>
        <p className="text-sm text-slate-600">
          {mode === 'login' ? 'Log in to see your roadmap.' : 'Create an account to build your roadmap.'}
        </p>

        <input
          type="email" required placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="password" required minLength={6} placeholder="Password (6+ characters)" value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}
        {notice && <p className="text-sm text-green-700">{notice}</p>}

        <button
          type="submit" disabled={loading}
          className="w-full bg-indigo-600 text-white rounded py-2 disabled:opacity-50"
        >
          {loading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Sign up'}
        </button>

        <button
          type="button"
          onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setNotice('') }}
          className="w-full text-sm text-indigo-600"
        >
          {mode === 'login' ? 'New here? Create an account' : 'Have an account? Log in'}
        </button>
      </form>
    </div>
  )
}
