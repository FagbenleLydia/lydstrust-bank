import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Verify from './pages/Verify'
import Transfer from './pages/Transfer'
import Transactions from './pages/Transactions'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
      />
      <Route
        path="/verify"
        element={<ProtectedRoute><Verify /></ProtectedRoute>}
      />
      <Route
        path="/transfer"
        element={<ProtectedRoute><Transfer /></ProtectedRoute>}
      />
      <Route
        path="/transactions"
        element={<ProtectedRoute><Transactions /></ProtectedRoute>}
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
