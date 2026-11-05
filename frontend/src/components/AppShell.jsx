// Shared dark backdrop for every screen after the landing page, so the app matches it visually.
// The glows are plain CSS (see .glow in index.css): cheap enough for every page, unlike the WebGL hero.
export default function AppShell({ children, actions }) {
  return (
    <div className="relative min-h-screen overflow-clip bg-slate-950 text-slate-100 [color-scheme:dark]">
      <div aria-hidden="true" className="glow pointer-events-none absolute -left-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-indigo-600/25 blur-3xl" />
      <div aria-hidden="true" className="glow glow-slow pointer-events-none absolute -bottom-48 -right-40 h-[32rem] w-[32rem] rounded-full bg-amber-500/10 blur-3xl" />
      <header className="relative z-10 flex items-center justify-between px-4 py-4 md:px-10">
        <span className="text-lg font-semibold tracking-tight">PrepIQ</span>
        {actions}
      </header>
      <main className="relative z-10">{children}</main>
    </div>
  )
}
