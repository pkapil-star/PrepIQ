import { useEffect, useState } from 'react'
import { supabase } from './api/supabase'
import Login from './pages/Login'

function App() {
  // undefined = still checking for a saved session; null = logged out.
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  if (session === undefined) return null
  if (!session) return <Login />

  // Placeholder until the profile page exists.
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p>Logged in as {session.user.email}</p>
      <button onClick={() => supabase.auth.signOut()} className="border rounded px-3 py-1">Log out</button>
    </div>
  )
}

export default App
