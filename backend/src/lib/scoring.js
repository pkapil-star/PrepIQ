// Decay window (days) for a skill rating to fully decay to 0 since last_reviewed_at.
// TRD.md "Open Technical Decisions": linear decay, 30-day window chosen as MVP default.
const DECAY_WINDOW_DAYS = 30

function decayedSkill(selfRating, lastReviewedAt) {
  if (!lastReviewedAt) return selfRating
  const daysSince = (Date.now() - new Date(lastReviewedAt).getTime()) / 86400000
  const decayFactor = Math.max(0, 1 - daysSince / DECAY_WINDOW_DAYS)
  return selfRating * decayFactor
}

// P_t = w_t * (1 - s_t), descending, ties broken by topic name (FR-4)
function rankTopics(weightedTopics) {
  return weightedTopics
    .map((t) => {
      const s_t = decayedSkill(t.self_rating ?? 0, t.last_reviewed_at)
      return { ...t, s_t, priority: t.weight * (1 - s_t) }
    })
    .sort((a, b) => b.priority - a.priority || a.name.localeCompare(b.name))
}

module.exports = { decayedSkill, rankTopics, DECAY_WINDOW_DAYS }
