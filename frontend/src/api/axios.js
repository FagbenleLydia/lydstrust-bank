import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// If a protected request gets a 401 (token expired mid-session), clear the
// session and redirect to login. Excludes login/register so wrong-password
// errors still surface normally in those forms.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url ?? ''
    const isAuthForm = url.includes('/auth/login') || url.includes('/auth/register')
    if (error.response?.status === 401 && !isAuthForm) {
      localStorage.removeItem('token')
      window.location.replace('/login')
    }
    return Promise.reject(error)
  }
)

export default api
