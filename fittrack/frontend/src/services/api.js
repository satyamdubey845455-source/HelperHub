import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fittrack_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 with Automatic Token Refresh
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config

    if (err.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/refresh')) {
        localStorage.removeItem('fittrack_token')
        localStorage.removeItem('fittrack_refresh_token')
        localStorage.removeItem('fittrack_user')
        window.location.href = '/login'
        return Promise.reject(err)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('fittrack_refresh_token')
      if (!refreshToken) {
        localStorage.removeItem('fittrack_token')
        localStorage.removeItem('fittrack_user')
        window.location.href = '/login'
        return Promise.reject(err)
      }

      try {
        const response = await axios.post('/api/auth/refresh', { refreshToken })
        const newToken = response.data.data.accessToken
        const newRefreshToken = response.data.data.refreshToken

        localStorage.setItem('fittrack_token', newToken)
        if (newRefreshToken) localStorage.setItem('fittrack_refresh_token', newRefreshToken)

        api.defaults.headers.common.Authorization = `Bearer ${newToken}`
        originalRequest.headers.Authorization = `Bearer ${newToken}`

        processQueue(null, newToken)
        return api(originalRequest)
      } catch (refreshErr) {
        processQueue(refreshErr, null)
        localStorage.removeItem('fittrack_token')
        localStorage.removeItem('fittrack_refresh_token')
        localStorage.removeItem('fittrack_user')
        window.location.href = '/login'
        return Promise.reject(refreshErr)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(err)
  }
)

export default api

// ── Auth ────────────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  logout: (refreshToken) => api.post('/auth/logout', null, { params: { refreshToken } }),
  health: () => api.get('/auth/health'),
}

// ── Profile ─────────────────────────────────────────────────
export const profileApi = {
  get: () => api.get('/profile'),
  create: (data) => api.post('/profile', data),
  update: (data) => api.put('/profile', data),
  overrideTargets: (data) => api.put('/profile/targets', data),
  recalculateTargets: () => api.post('/profile/targets/recalculate'),
}

// ── Dashboard ───────────────────────────────────────────────
export const dashboardApi = {
  get: (date) => api.get('/dashboard', { params: { date } }),
}

// ── Diet & Nutrition ─────────────────────────────────────────
export const dietApi = {
  getMeals: (date) => api.get('/meals', { params: { date } }),
  getDailySummary: (date) => api.get('/meals/summary', { params: { date } }),
  createMeal: (data) => api.post('/meals', data),
  deleteMeal: (id) => api.delete(`/meals/${id}`),
  addItem: (mealId, data) => api.post(`/meals/${mealId}/items`, data),
  updateItem: (mealId, itemId, data) => api.put(`/meals/${mealId}/items/${itemId}`, data),
  deleteItem: (mealId, itemId) => api.delete(`/meals/${mealId}/items/${itemId}`),
}

// ── Foods (Built-in, Indian, Custom, Favorites) ─────────────
export const foodApi = {
  search: (query, category) => api.get('/foods', { params: { query, category } }),
  createCustom: (data) => api.post('/foods/custom', data),
  getCustom: () => api.get('/foods/custom'),
  getFavorites: () => api.get('/foods/favorites'),
  toggleFavorite: (id) => api.post(`/foods/${id}/favorite`),
  getRecent: () => api.get('/foods/recent'),
  getCategories: () => api.get('/foods/categories'),
}

// ── Meal Templates ──────────────────────────────────────────
export const mealTemplateApi = {
  getAll: () => api.get('/meals/templates'),
  create: (data) => api.post('/meals/templates', data),
  apply: (id, date) => api.post(`/meals/templates/${id}/apply`, null, { params: { date } }),
  delete: (id) => api.delete(`/meals/templates/${id}`),
}

// ── Exercises ───────────────────────────────────────────────
export const exerciseApi = {
  search: (query, muscleGroup) => api.get('/exercises', { params: { query, muscleGroup } }),
}

// ── Water Tracker ───────────────────────────────────────────
export const waterApi = {
  get: (date) => api.get('/water', { params: { date } }),
  log: (data) => api.post('/water', data),
  delete: (id) => api.delete(`/water/${id}`),
  weekly: () => api.get('/water/weekly'),
}

// ── Workouts & Schedules ────────────────────────────────────
export const workoutApi = {
  getHistory: (page = 0, size = 20) => api.get('/workouts', { params: { page, size } }),
  getByDate: (date) => api.get('/workouts/date', { params: { date } }),
  getSession: (id) => api.get(`/workouts/${id}`),
  create: (data) => api.post('/workouts', data),
  update: (id, data) => api.put(`/workouts/${id}`, data),
  delete: (id) => api.delete(`/workouts/${id}`),
  addSet: (id, data) => api.post(`/workouts/${id}/sets`, data),
  updateSet: (id, setId, data) => api.put(`/workouts/${id}/sets/${setId}`, data),
  deleteSet: (id, setId) => api.delete(`/workouts/${id}/sets/${setId}`),
}

export const workoutScheduleApi = {
  get: () => api.get('/workouts/schedule'),
  save: (data) => api.put('/workouts/schedule', data),
}

// ── Sleep ───────────────────────────────────────────────────
export const sleepApi = {
  getRange: (from, to) => api.get('/sleep', { params: { from, to } }),
  getByDate: (date) => api.get('/sleep/date', { params: { date } }),
  log: (data) => api.post('/sleep', data),
  update: (id, data) => api.put(`/sleep/${id}`, data),
  delete: (id) => api.delete(`/sleep/${id}`),
}

// ── Progress & Body Measurements ────────────────────────────
export const progressApi = {
  getAll: () => api.get('/progress'),
  getLatest: () => api.get('/progress/latest'),
  getRange: (from, to) => api.get('/progress/range', { params: { from, to } }),
  log: (data) => api.post('/progress', data),
  delete: (id) => api.delete(`/progress/${id}`),
}

// ── Goals ───────────────────────────────────────────────────
export const goalApi = {
  getAll: () => api.get('/goals'),
  create: (data) => api.post('/goals', data),
  update: (id, data) => api.put(`/goals/${id}`, data),
  delete: (id) => api.delete(`/goals/${id}`),
}

// ── Notifications ───────────────────────────────────────────
export const notificationApi = {
  getAll: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
}

// ── Reminders ───────────────────────────────────────────────
export const reminderApi = {
  getAll: () => api.get('/reminders'),
  create: (data) => api.post('/reminders', data),
  update: (id, data) => api.put(`/reminders/${id}`, data),
  toggle: (id) => api.patch(`/reminders/${id}/toggle`),
  delete: (id) => api.delete(`/reminders/${id}`),
}

// ── Analytics & Calendar ────────────────────────────────────
export const analyticsApi = {
  get: (days = 30) => api.get('/analytics', { params: { days } }),
  getCalendar: (month) => api.get('/calendar', { params: { month } }),
}

// ── Export ──────────────────────────────────────────────────
export const exportApi = {
  downloadJson: async () => {
    const res = await api.get('/export/json')
    const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `fittrack_export_${new Date().toISOString().slice(0, 10)}.json`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  },
  downloadCsv: async () => {
    const res = await api.get('/export/csv', { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `fittrack_export_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  },
}
