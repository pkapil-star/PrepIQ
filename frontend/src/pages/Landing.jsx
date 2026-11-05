import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'
import Lenis from 'lenis'
import { useReducedMotion } from 'motion/react'
import SpotlightCard from '../components/SpotlightCard'

// three.js is big; load it only on this page and after the text has painted.
const HeroScene = lazy(() => import('../components/HeroScene'))

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP)

const STEPS = [
  ['01', 'Tell us your target', 'Pick your job title, experience level, optional target company, and how many weeks and hours a day you have.'],
  ['02', 'Rate yourself honestly', 'A quick self-check on every topic for your role: DSA patterns, OS, DBMS, CN, OOP and role-specific skills.'],
  ['03', 'Get a ranked roadmap', 'Topics are ordered by what interviews actually ask and what you are weakest at, then packed into your weekly hours.'],
]

// [topic, interview weight, your skill]: illustrative numbers for the ranking demo.
const SAMPLE = [
  ['Graphs', 0.9, 0.2],
  ['Dynamic Programming', 0.95, 0.4],
  ['OS: Scheduling', 0.6, 0.3],
  ['DBMS: Indexing', 0.7, 0.7],
  ['Arrays', 0.8, 0.9],
].map(([name, w, s]) => ({ name, w, s, p: w * (1 - s) })).sort((a, b) => b.p - a.p)

const FEATURES = [
  ['Job-title baselines', 'Curated topic weights for each role and experience bucket, not a generic DSA sheet.'],
  ['Real interview data', 'Weights shift toward what your target company has actually asked in recent interviews.'],
  ['30-day revision flags', 'Topics you finished a month ago resurface before they fade.'],
]

export default function Landing({ onStart }) {
  const root = useRef()
  const heroProgress = useRef(0) // 0-1 scroll through the hero, read every frame by the 3D scene
  const reduced = useReducedMotion()
  const [weight, setWeight] = useState(0.8)
  const [skill, setSkill] = useState(0.3)

  // Lenis drives scrolling here only; GSAP's ticker runs it so ScrollTrigger and Lenis share one frame loop.
  useEffect(() => {
    if (reduced) return
    const lenis = new Lenis()
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(tick)
      gsap.ticker.lagSmoothing(500, 33)
      lenis.destroy()
    }
  }, [reduced])

  useGSAP(() => {
    ScrollTrigger.create({
      trigger: '.hero', start: 'top top', end: 'bottom top',
      onUpdate: (self) => { heroProgress.current = self.progress },
    })

    const mm = gsap.matchMedia()
    mm.add({ desktop: '(min-width: 768px)', motion: '(prefers-reduced-motion: no-preference)' }, ({ conditions }) => {
      if (!conditions.motion) return

      const split = SplitText.create('.hero-title', { type: 'words', mask: 'words' })
      gsap.from(split.words, { yPercent: 110, duration: 0.9, stagger: 0.07, ease: 'power3.out' })
      gsap.from('.hero-fade', { opacity: 0, y: 20, duration: 0.8, delay: 0.5, stagger: 0.1 })
      gsap.to('.hero-copy', {
        yPercent: -25, opacity: 0, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
      })

      const steps = gsap.utils.toArray('.step')
      if (conditions.desktop) {
        const tl = gsap.timeline({ scrollTrigger: { trigger: '.steps', start: 'top top', end: '+=200%', pin: true, scrub: 0.8 } })
        steps.forEach((step, i) => {
          // Previous step leaves before the next arrives, so the two never overlap mid-scroll.
          if (i > 0) tl.to(steps[i - 1], { opacity: 0, y: -60 }).from(step, { opacity: 0, y: 60 })
        })
        tl.fromTo('.steps-progress', { scaleX: 1 / steps.length }, { scaleX: 1, ease: 'none', duration: tl.duration() }, 0)
      } else {
        steps.forEach((step) => gsap.from(step, { opacity: 0, y: 40, scrollTrigger: { trigger: step, start: 'top 85%' } }))
      }

      gsap.from('.rank-bar', {
        scaleX: 0, stagger: 0.15, ease: 'none',
        scrollTrigger: { trigger: '.ranking', start: 'top 80%', end: 'center 45%', scrub: true },
      })
      gsap.from('.feature', {
        opacity: 0, y: 50, stagger: 0.12, duration: 0.8, ease: 'power2.out',
        scrollTrigger: { trigger: '.features', start: 'top 80%' },
      })
      return () => split.revert()
    })
    return () => mm.revert()
  }, { scope: root })

  const priority = weight * (1 - skill)
  const button = 'rounded-full px-6 py-3 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400'

  return (
    <div ref={root} className="bg-slate-950 text-slate-100">
      <header className="fixed inset-x-0 top-0 z-20 flex items-center justify-between bg-slate-950/70 px-4 py-4 backdrop-blur md:bg-transparent md:px-10 md:backdrop-blur-none">
        <span className="text-lg font-semibold tracking-tight">PrepIQ</span>
        <button onClick={onStart} className={`${button} bg-white/10 py-2 text-sm backdrop-blur hover:bg-white/20`}>Log in</button>
      </header>

      <main>
        <section className="hero relative h-[100svh] overflow-hidden">
          <Suspense fallback={null}>
            <HeroScene progress={heroProgress} reducedMotion={!!reduced} />
          </Suspense>
          <div className="pointer-events-none absolute inset-0 bg-slate-950/60 md:bg-transparent md:bg-linear-to-r md:from-slate-950 md:via-slate-950/40 md:to-transparent" />
          <div className="hero-copy pointer-events-none relative flex h-full max-w-6xl flex-col justify-center px-4 md:px-10">
            <p className="hero-fade mb-4 text-sm font-medium uppercase tracking-widest text-indigo-300">Interview prep, ranked</p>
            <h1 className="hero-title max-w-2xl text-4xl font-semibold leading-tight md:text-6xl">
              Study what your interview will actually ask.
            </h1>
            <p className="hero-fade mt-6 max-w-lg text-base text-slate-300 md:text-lg">
              PrepIQ turns your target role, your skills and real interview data into a week-by-week roadmap.
            </p>
            <div className="hero-fade pointer-events-auto mt-8 flex flex-wrap gap-3">
              <button onClick={onStart} className={`${button} bg-indigo-500 text-white hover:bg-indigo-400`}>Build my roadmap</button>
              <a href="#how" className={`${button} border border-white/20 hover:bg-white/10`}>How it works</a>
            </div>
          </div>
        </section>

        <section id="how" className="steps relative overflow-hidden px-4 py-24 md:px-10 md:motion-safe:flex md:motion-safe:h-screen md:motion-safe:items-center md:motion-safe:py-0">
          <div className="mx-auto w-full max-w-4xl">
            <h2 className="mb-10 text-sm font-medium uppercase tracking-widest text-indigo-300">How it works</h2>
            <div className="relative space-y-12 md:motion-safe:h-64 md:motion-safe:space-y-0">
              {STEPS.map(([num, title, text]) => (
                <div key={num} className="step md:motion-safe:absolute md:motion-safe:inset-0">
                  <span className="font-mono text-5xl text-indigo-400/60 md:text-7xl">{num}</span>
                  <h3 className="mt-2 text-2xl font-semibold md:text-4xl">{title}</h3>
                  <p className="mt-3 max-w-xl text-slate-300">{text}</p>
                </div>
              ))}
            </div>
            <div className="mt-10 hidden h-1 overflow-hidden rounded-full bg-white/10 md:motion-safe:block">
              <div className="steps-progress h-full origin-left bg-indigo-400" />
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-12 px-4 py-24 md:grid-cols-2 md:px-10">
          <div>
            <h2 className="text-3xl font-semibold md:text-4xl">The formula behind your plan</h2>
            <p className="mt-4 text-slate-300">No black box. Every topic gets a priority, and the roadmap is built in that order.</p>
            <p className="mt-6 rounded-xl bg-white/5 p-4 font-mono text-lg md:text-xl">
              priority = <span className="text-amber-300">weight</span> × (1 − <span className="text-indigo-300">skill</span>)
            </p>
            <div className="mt-6 space-y-4">
              <label className="block text-sm">
                <span className="flex justify-between"><span className="text-amber-300">Interview weight</span>{weight.toFixed(2)}</span>
                <input type="range" min={0} max={1} step={0.05} value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="mt-2 w-full accent-amber-400" />
              </label>
              <label className="block text-sm">
                <span className="flex justify-between"><span className="text-indigo-300">Your skill</span>{skill.toFixed(2)}</span>
                <input type="range" min={0} max={1} step={0.05} value={skill} onChange={(e) => setSkill(Number(e.target.value))} className="mt-2 w-full accent-indigo-400" />
              </label>
              <div>
                <div className="flex justify-between text-sm"><span>Priority</span><output aria-live="polite">{priority.toFixed(2)}</output></div>
                <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-linear-to-r from-indigo-500 to-amber-400 transition-[width] duration-300" style={{ width: `${priority * 100}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="ranking self-center rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h3 className="mb-4 text-sm font-medium uppercase tracking-widest text-slate-400">Example ranking</h3>
            <ol className="space-y-4">
              {SAMPLE.map((t, i) => (
                <li key={t.name}>
                  <div className="flex justify-between gap-2 text-sm">
                    <span>{i + 1}. {t.name}</span>
                    <span className="shrink-0 font-mono text-slate-400"><span className="hidden sm:inline">{t.w} × (1 − {t.s}) = </span>{t.p.toFixed(2)}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="rank-bar h-full origin-left rounded-full bg-linear-to-r from-indigo-500 to-amber-400" style={{ width: `${t.p * 100}%` }} />
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="features mx-auto grid max-w-6xl gap-4 px-4 pb-24 md:grid-cols-3 md:px-10">
          {FEATURES.map(([title, text]) => (
            <SpotlightCard key={title} className="feature">
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-slate-300">{text}</p>
            </SpotlightCard>
          ))}
        </section>

        <section className="px-4 pb-32 text-center">
          <h2 className="text-3xl font-semibold md:text-5xl">Your roadmap is two minutes away.</h2>
          <button onClick={onStart} className={`${button} mt-8 bg-indigo-500 text-white hover:bg-indigo-400`}>Get started free</button>
        </section>
      </main>
    </div>
  )
}
