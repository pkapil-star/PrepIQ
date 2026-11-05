import { lazy, Suspense, useEffect, useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { supabase } from './api/supabase'
import { getProfile, getRoadmap } from './api/client'
import AppShell from './components/AppShell'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Ranking from './pages/Ranking'
import Roadmap from './pages/Roadmap'

// Landing pulls in three.js + GSAP; logged-in users never download it.
const Landing = lazy(() => import('./pages/Landing'))

function App() {
  // undefined = still checking for a saved session; null = logged out.
  const [session, setSession] = useState(undefined)
  // undefined = not loaded yet; null = logged in but no profile saved.
  const [profile, setProfile] = useState(undefined)
  const [view, setView] = useState('home') // 'home' | 'profile' | 'rank'
  // undefined = not loaded yet; null = no roadmap generated yet.
  const [roadmap, setRoadmap] = useState(undefined)
  const [error, setError] = useState('')
  const [showLogin, setShowLogin] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      if (!s) { setProfile(undefined); setRoadmap(undefined); setView('home') } // don't leak a previous user's data after logout
    })
    return () => data.subscription.unsubscribe()
  }, [])

  const token = session?.access_token
  useEffect(() => {
    if (!token) return
    Promise.all([getProfile(token), getRoadmap(token)])
      .then(([p, r]) => { setProfile(p); setRoadmap(r) })
      .catch((err) => setError(err.message))
  }, [token])

  // { key, content }: the key drives the page transition.
  function screen() {
    if (session === undefined) return { key: 'loading', content: null }
    if (!session) {
      return showLogin
        ? { key: 'login', content: <Login onBack={() => setShowLogin(false)} /> }
        : { key: 'landing', content: <Suspense fallback={null}><Landing onStart={() => { window.scrollTo(0, 0); setShowLogin(true) }} /></Suspense> }
    }
    if (error) {
      return {
        key: 'error',
        content: <AppShell><p role="alert" className="mx-auto mt-10 max-w-md rounded-lg bg-red-500/10 px-4 py-3 text-red-300">Could not load your profile: {error}</p></AppShell>,
      }
    }
    if (profile === undefined || roadmap === undefined) return { key: 'loading', content: null }
    if (profile === null || view === 'profile') {
      return { key: 'profile', content: <Profile token={token} initial={profile} onSaved={(p) => { setProfile(p); setView('rank') }} /> }
    }
    if (view === 'rank') {
      return { key: 'rank', content: <Ranking token={token} profile={profile} onDone={(r) => { setRoadmap(r); setView('home') }} /> }
    }
    return { key: 'home', content: home }
  }

  const home = session && profile && (
    <Roadmap
      token={token} roadmap={roadmap} email={session.user.email}
      onEditProfile={() => setView('profile')} onRedoAssessment={() => setView('rank')}
      onLogout={() => supabase.auth.signOut()}
    />
  )

  const { key, content } = screen()
  // Landing fades only: a transform on its wrapper would break GSAP's pinned section.
  const offset = key === 'landing' ? 0 : 16
  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait">
        <motion.div
          key={key}
          initial={{ opacity: 0, y: offset }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -offset }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          {content}
        </motion.div>
      </AnimatePresence>
    </MotionConfig>
  )
}

export default App
