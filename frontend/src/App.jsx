import { useEffect, useState } from 'react'
import { supabase } from './api/supabase'
import { getProfile } from './api/client'
import Login from './pages/Login'
import Profile from './pages/Profile'

function App() {
  // undefined = still checking for a saved session; null = logged out.
  const [session, setSession] = useState(undefined)
  // undefined = not loaded yet; null = logged in but no profile saved.
  const [profile, setProfile] = useState(undefined)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      if (!s) setProfile(undefined) // don't show a previous user's profile after logout
    })
    return () => data.subscription.unsubscribe()
  }, [])

  const token = session?.access_token
  useEffect(() => {
    if (!token) return
    getProfile(token).then(setProfile).catch((err) => setError(err.message))
  }, [token])

  if (session === undefined) return null
  if (!session) return <Login />
  if (error) return <p className="p-6 text-red-600">Could not load your profile: {error}</p>
  if (profile === undefined) return null
  if (profile === null || editing) {
    return <Profile token={token} initial={profile} onSaved={(p) => { setProfile(p); setEditing(false) }} />
  }

  // Placeholder until the self-assessment and roadmap pages exist.
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p>Logged in as {session.user.email}</p>
      <p className="text-sm text-slate-600">
        Profile saved: {profile.weeks} weeks, {profile.hours_per_day} h/day.
      </p>
      <button onClick={() => setEditing(true)} className="border rounded px-3 py-1">Edit profile</button>
      <button onClick={() => supabase.auth.signOut()} className="border rounded px-3 py-1">Log out</button>
    </div>
  )
}

export default App
