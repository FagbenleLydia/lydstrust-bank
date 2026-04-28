import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/Spinner'

export default function Landing() {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center">
      <Spinner size="lg" light />
    </div>
  )
  if (user) return <Navigate to="/dashboard" replace />

  return (
    <div className="min-h-screen bg-navy-950 text-white">
      {/* Navbar */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gold-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-navy-950" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="font-bold text-lg">LydsTrust Bank</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-white/70 hover:text-white text-sm font-medium px-4 py-2 transition-colors">
            Sign In
          </Link>
          <Link to="/register" className="bg-gold-500 text-navy-950 text-sm font-bold px-5 py-2 rounded-xl hover:bg-gold-400 transition-colors">
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-8 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-8">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm text-white/80 font-medium">Powered by NIBSS · Trusted Banking</span>
        </div>
        <h1 className="text-6xl font-extrabold leading-tight mb-6">
          Banking That Works{' '}
          <span className="text-gold-500">For You</span>
        </h1>
        <p className="text-white/60 text-xl max-w-xl mx-auto mb-10 leading-relaxed">
          Open your account in minutes with BVN or NIN verification.
          Send money instantly to any bank in Nigeria.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/register" className="bg-gold-500 text-navy-950 font-bold px-8 py-4 rounded-2xl hover:bg-gold-400 transition-colors text-base">
            Open Free Account
          </Link>
          <Link to="/login" className="border border-white/20 text-white font-semibold px-8 py-4 rounded-2xl hover:border-white/40 hover:bg-white/5 transition-colors text-base">
            Sign In
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-3xl mx-auto px-8 pb-16">
        <div className="grid grid-cols-3 gap-6">
          {[
            { value: '₦15,000', label: 'Welcome Bonus' },
            { value: '< 1 min', label: 'Account Setup' },
            { value: '24 / 7', label: 'Availability' },
          ].map((s) => (
            <div key={s.label} className="bg-white/5 rounded-2xl p-6 text-center border border-white/10">
              <p className="text-3xl font-extrabold text-gold-500 mb-1">{s.value}</p>
              <p className="text-white/50 text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-8 pb-24">
        <h2 className="text-2xl font-bold text-center mb-10">Everything you need</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: '🪪',
              title: 'KYC Verified',
              desc: 'Verify your identity with BVN or NIN to unlock full banking features securely.',
            },
            {
              icon: '⚡',
              title: 'Instant Transfers',
              desc: 'Send money to any bank in Nigeria instantly — intra-bank or inter-bank.',
            },
            {
              icon: '📊',
              title: 'Transaction History',
              desc: 'View your full transaction history with balance snapshots for every operation.',
            },
            {
              icon: '🔍',
              title: 'Name Enquiry',
              desc: 'Verify recipient account details before sending money to avoid wrong transfers.',
            },
            {
              icon: '🏦',
              title: 'Real-time Balance',
              desc: 'Get your live account balance synced directly from NIBSS at any time.',
            },
            {
              icon: '🔒',
              title: 'Secure by Design',
              desc: 'JWT authentication and bcrypt password hashing keep your account protected.',
            },
          ].map((f) => (
            <div key={f.title} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
              <div className="text-3xl mb-4" aria-hidden="true">{f.icon}</div>
              <h3 className="text-white font-semibold mb-2">{f.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-8 py-6 text-center text-white/30 text-sm">
        © {new Date().getFullYear()} LydsTrust Bank · Built on NIBSS Infrastructure
      </footer>
    </div>
  )
}
