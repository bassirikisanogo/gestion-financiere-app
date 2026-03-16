import axios from 'axios'

// En production (Railway, etc.) : définir VITE_API_URL (ex. https://votre-api.railway.app/api)
const baseURL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = localStorage.getItem('refresh')
      if (refresh) {
        try {
          const { data } = await axios.post(`${baseURL}/auth/token/refresh/`, { refresh })
          localStorage.setItem('access', data.access)
          original.headers.Authorization = `Bearer ${data.access}`
          return api(original)
        } catch (_) {
          localStorage.removeItem('access')
          localStorage.removeItem('refresh')
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(err)
  }
)

export const auth = {
  login: (username, password) =>
    api.post('/auth/token/', { username, password }).then((r) => r.data),
  register: (username, password, email) =>
    api.post('/auth/inscription/', { username, password, email }).then((r) => r.data),
}

export const tableauBord = () => api.get('/tableau-bord/').then((r) => r.data)
export const rapports = (params) => api.get('/rapports/', { params }).then((r) => r.data)

export const categories = {
  list: () => api.get('/categories/').then((r) => r.data),
  create: (data) => api.post('/categories/', data).then((r) => r.data),
  update: (id, data) => api.patch(`/categories/${id}/`, data).then((r) => r.data),
  delete: (id) => api.delete(`/categories/${id}/`),
}

export const transactions = {
  list: (params) => api.get('/transactions/', { params }).then((r) => r.data),
  create: (data) => api.post('/transactions/', data).then((r) => r.data),
  update: (id, data) => api.patch(`/transactions/${id}/`, data).then((r) => r.data),
  delete: (id) => api.delete(`/transactions/${id}/`),
}

export const budgets = {
  list: () => api.get('/budgets/').then((r) => r.data),
  create: (data) => api.post('/budgets/', data).then((r) => r.data),
  update: (id, data) => api.patch(`/budgets/${id}/`, data).then((r) => r.data),
  delete: (id) => api.delete(`/budgets/${id}/`),
}

export const dettes = {
  list: (params) => api.get('/dettes/', { params }).then((r) => r.data),
  create: (data) => api.post('/dettes/', data).then((r) => r.data),
  update: (id, data) => api.patch(`/dettes/${id}/`, data).then((r) => r.data),
  delete: (id) => api.delete(`/dettes/${id}/`),
}

export const factures = {
  list: (params) => api.get('/factures/', { params }).then((r) => r.data),
  create: (data) => api.post('/factures/', data).then((r) => r.data),
  update: (id, data) => api.patch(`/factures/${id}/`, data).then((r) => r.data),
  delete: (id) => api.delete(`/factures/${id}/`),
}

export const alertes = {
  list: () => api.get('/alertes/').then((r) => r.data),
  marquerLue: (id) => api.patch(`/alertes/${id}/marquer_lue/`).then((r) => r.data),
}

export default api
