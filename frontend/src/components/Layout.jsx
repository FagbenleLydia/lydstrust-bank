import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    to: '/transfer',
    label: 'Transfer',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
  },
  {
    to: '/transactions',
    label: 'Transactions',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    to: '/verify',
    label: 'Verification',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
]

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showConfirm, setShowConfirm] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : '?'

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className="w-64 flex flex-col fixed inset-y-0 left-0"
        style={{ background: 'linear-gradient(180deg, #06101f 0%, #08121e 55%, #0a141f 100%)' }}
      >
        {/* Logo */}
        <div className="px-6 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #c9a84c 0%, #e8c84a 100%)' }}
            >
              <svg style={{ width: 17, height: 17, color: '#06101f' }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-[13px] leading-tight tracking-tight">LydsTrust</p>
              <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: 10, fontWeight: 500, letterSpacing: '0.04em' }}>Digital Banking</p>
            </div>
          </div>
        </div>

        {/* Nav label */}
        <div className="px-5 pt-5 pb-2">
          <p style={{ color: 'rgba(255,255,255,0.18)', fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            Menu
          </p>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 space-y-0.5 pb-4">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className="block">
              {({ isActive }) => (
                <div
                  className={`relative flex items-center gap-3 px-3 py-[10px] rounded-xl text-[13px] font-medium transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'text-white'
                      : 'hover:text-white hover:bg-white/[0.05]'
                  }`}
                  style={isActive ? { background: 'rgba(255,255,255,0.08)' } : { color: 'rgba(255,255,255,0.42)' }}
                >
                  {isActive && (
                    <span
                      className="absolute left-0 inset-y-0 flex items-center pl-0"
                    >
                      <span
                        className="block w-[3px] h-5 rounded-r-full"
                        style={{ background: 'linear-gradient(180deg, #e8c84a, #c9a84c)' }}
                      />
                    </span>
                  )}
                  <span style={{ color: isActive ? '#d4aa50' : 'inherit' }}>
                    {item.icon}
                  </span>
                  {item.label}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom user section */}
        <div
          className="px-3 pb-5 pt-4 space-y-1"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          {/* KYC status badge */}
          {user?.isVerified ? (
            <div className="flex items-center px-3 pb-1.5">
              <div
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1"
                style={{ background: 'rgba(52,211,153,0.12)' }}
              >
                <span className="block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span style={{ color: '#34d399', fontSize: 11, fontWeight: 600 }}>KYC Verified</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center px-3 pb-1.5">
              <div
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1"
                style={{ background: 'rgba(251,191,36,0.12)' }}
              >
                <span className="block w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span style={{ color: '#fbbf24', fontSize: 11, fontWeight: 600 }}>Unverified</span>
              </div>
            </div>
          )}

          {/* User card */}
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-default">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #c9a84c, #e8c84a)', color: '#06101f' }}
            >
              {initials}
            </div>
            <div className="overflow-hidden min-w-0">
              <p className="text-white font-semibold truncate leading-tight" style={{ fontSize: 13 }}>
                {user?.firstName} {user?.lastName}
              </p>
              <p className="truncate mt-0.5" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>
                {user?.email}
              </p>
            </div>
          </div>

          {/* Sign out */}
          <button
            onClick={() => setShowConfirm(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all"
            style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}
            onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; e.currentTarget.style.background = 'transparent' }}
          >
            <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 flex-1 min-h-screen" style={{ background: '#edf0f7' }}>
        {children}
      </main>

      {/* Logout confirmation modal */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(6,16,31,0.65)', backdropFilter: 'blur(6px)' }}
        >
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-[320px] mx-4 animate-scale-in">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mx-auto mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <h3 className="text-center text-gray-900 font-bold text-lg mb-1">Sign Out</h3>
            <p className="text-center text-gray-500 text-sm mb-6">Are you sure you want to sign out?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-sm font-semibold text-white hover:bg-red-600 transition-all"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
