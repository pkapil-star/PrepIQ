const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

async function request(path, options) {
  const res = await fetch(`${API_URL}${path}`, options)
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(body.error || 'Request failed')
  }
  return res.json()
}

export const getCompanies = () => request('/companies')
export const getRoles = (companyId) => request(`/companies/${companyId}/roles`)
export const getWeightage = (roleId) => request(`/roles/${roleId}/weightage`)
export const saveSkills = (userId, ratings) =>
  request(`/users/${userId}/skills`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ratings }),
  })
export const getPlan = (userId, roleId) => request(`/users/${userId}/plan?role_id=${roleId}`)
export const markReviewed = (userId, topicId) =>
  request(`/users/${userId}/topics/${topicId}/review`, { method: 'POST' })
