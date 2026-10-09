// Roadmap builder (TRD.md "Algorithm Requirements"). Pure functions, no DB or LLM calls.

const REVISION_WINDOW_DAYS = 30
const COMPANY_BLEND = 0.5 // share of the final weight taken from company interview data
const LEVEL_ORDER = { beginner: 0, intermediate: 1, advanced: 2 }

// w_t = baseline, or a 50/50 blend with the company weight when interview data exists.
function blendWeight(baseline, companyWeight) {
  if (companyWeight == null) return baseline
  return (1 - COMPANY_BLEND) * baseline + COMPANY_BLEND * companyWeight
}

function needsRevision(completedAt, now = Date.now()) {
  if (!completedAt) return false
  return (now - new Date(completedAt).getTime()) / 86400000 > REVISION_WINDOW_DAYS
}

// topics: [{ topic_id, name, subject, level, est_hours, weight, self_rating, completed_at }]
// Returns { weeks: [{ week, hours, topics }], skipped, budget_hours }.
function buildRoadmap(topics, { weeks, hoursPerDay }) {
  const weekCapacity = 7 * hoursPerDay
  const budget = weeks * weekCapacity

  // Done topics stay out until their revision flag trips; then they come back as revision.
  const candidates = topics
    .filter((t) => t.weight > 0 && (!t.completed_at || needsRevision(t.completed_at)))
    .map((t) => {
      const s = t.self_rating ?? 0
      return {
        ...t,
        revision: Boolean(t.completed_at),
        priority: t.weight * (1 - s), // P_t = w_t * (1 - s_t)
        hours: Math.round(t.est_hours * (1 - s) * 2) / 2 || 0.5, // less time on what they know
      }
    })

  // Keep the highest-priority topics that fit the time budget.
  const byPriority = [...candidates].sort((a, b) => b.priority - a.priority || a.name.localeCompare(b.name))
  const kept = new Set()
  let used = 0
  for (const t of byPriority) {
    if (used + t.hours <= budget) {
      kept.add(t.topic_id)
      used += t.hours
    }
  }

  // Lay kept topics out beginner -> advanced, highest priority first within a level.
  const ordered = byPriority
    .filter((t) => kept.has(t.topic_id))
    .sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level] || b.priority - a.priority)

  const plan = []
  let current = { week: 1, hours: 0, topics: [] }
  for (const t of ordered) {
    if (current.hours + t.hours > weekCapacity && current.topics.length > 0) {
      plan.push(current)
      current = { week: current.week + 1, hours: 0, topics: [] }
    }
    current.topics.push(t)
    current.hours += t.hours
  }
  if (current.topics.length > 0) plan.push(current)

  return {
    budget_hours: budget,
    weeks: plan,
    skipped: byPriority.filter((t) => !kept.has(t.topic_id)),
  }
}

module.exports = { blendWeight, needsRevision, buildRoadmap, REVISION_WINDOW_DAYS }
