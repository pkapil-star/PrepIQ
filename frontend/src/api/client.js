const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// token: the Supabase Auth access token (session.access_token); required for /me routes.
async function request(path, { token, method = 'GET', body } = {}) {
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`
  if (body) headers['Content-Type'] = 'application/json'

  const res = await fetch(`${API_URL}${path}`, { method, headers, body: body && JSON.stringify(body) })
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(data.error || 'Request failed')
  }
  return res.json()
}

export const getJobTitles = () => request('/job-titles')
export const getCompanies = () => request('/companies')
export const getTopics = (jobTitleId, bucket) => request(`/job-titles/${jobTitleId}/topics?bucket=${bucket}`)

export const getProfile = (token) => request('/me/profile', { token })
export const saveProfile = (token, profile) => request('/me/profile', { token, method: 'PUT', body: profile })
export const saveSkills = (token, ratings) => request('/me/skills', { token, method: 'PUT', body: { ratings } })
export const generateRoadmap = (token) => request('/me/roadmap', { token, method: 'POST' })
export const getRoadmap = (token) => request('/me/roadmap', { token })
export const completeTopic = (token, topicId) =>
  request(`/me/topics/${topicId}/complete`, { token, method: 'POST' })
export const uncompleteTopic = (token, topicId) =>
  request(`/me/topics/${topicId}/complete`, { token, method: 'DELETE' })
