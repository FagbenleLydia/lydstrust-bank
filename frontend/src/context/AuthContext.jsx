import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { setLoading(false); return }

    api.get('/auth/me')
      .then(res => setUser(res.data.data))
      .catch((err) => {
        // Only invalidate the session on an actual auth rejection, not transient errors
        if (!err.response || err.response.status === 401) {
          localStorage.removeItem('token')
          setUser(null)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', data.data.token)
    setUser(data.data)
    return data
  }

  const register = async (formData) => {
    const { data } = await api.post('/auth/register', formData)
    localStorage.setItem('token', data.data.token)
    setUser(data.data)
    return data
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const refreshUser = async () => {
    try {
      const { data } = await api.get('/auth/me')
      setUser(data.data)
      return data.data
    } catch {
      // Token may have expired; clear session gracefully
      logout()
      return null
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
