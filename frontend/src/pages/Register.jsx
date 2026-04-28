import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/Spinner'

const COUNTRY_CODES = [
  { code: '+234', label: '🇳🇬 +234', country: 'Nigeria' },
  { code: '+1',   label: '🇺🇸 +1',   country: 'USA/Canada' },
  { code: '+44',  label: '🇬🇧 +44',  country: 'UK' },
  { code: '+233', label: '🇬🇭 +233', country: 'Ghana' },
  { code: '+254', label: '🇰🇪 +254', country: 'Kenya' },
  { code: '+27',  label: '🇿🇦 +27',  country: 'South Africa' },
  { code: '+251', label: '🇪🇹 +251', country: 'Ethiopia' },
  { code: '+255', label: '🇹🇿 +255', country: 'Tanzania' },
  { code: '+256', label: '🇺🇬 +256', country: 'Uganda' },
  { code: '+49',  label: '🇩🇪 +49',  country: 'Germany' },
  { code: '+33',  label: '🇫🇷 +33',  country: 'France' },
  { code: '+971', label: '🇦🇪 +971', country: 'UAE' },
  { code: '+91',  label: '🇮🇳 +91',  country: 'India' },
]

const INITIAL = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  dateOfBirth: '',
  address: '',
}

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(INITIAL)
  const [countryCode, setCountryCode] = useState('+234')
  const [phoneDigits, setPhoneDigits] = useState('')
  const [showCodePicker, setShowCodePicker] = useState(false)
  const codePickerRef = useRef(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const handler = (e) => {
      if (codePickerRef.current && !codePickerRef.current.contains(e.target)) {
        setShowCodePicker(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-white/25 focus:border-white/50 transition-all'

  const getPasswordStrength = (pwd) => {
    if (!pwd) return null
    if (pwd.length < 8) return { label: 'Too short', color: '#ef4444', width: '25%' }
    const hasUpper = /[A-Z]/.test(pwd)
    const hasNum = /[0-9]/.test(pwd)
    const hasSpecial = /[^a-zA-Z0-9]/.test(pwd)
    const score = [pwd.length >= 10, hasUpper, hasNum, hasSpecial].filter(Boolean).length
    if (score <= 1) return { label: 'Weak', color: '#f59e0b', width: '40%' }
    if (score === 2) return { label: 'Fair', color: '#f59e0b', width: '60%' }
    if (score === 3) return { label: 'Good', color: '#10b981', width: '80%' }
    return { label: 'Strong', color: '#10b981', width: '100%' }
  }

  return (
    <div className="min-h-screen bg-navy-950 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-2/5 flex-col justify-between p-12 border-r border-white/10">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gold-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-navy-950" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-white font-bold text-lg">LydsTrust Bank</span>
        </Link>

        <div className="space-y-6">
          <h2 className="text-3xl font-extrabold text-white leading-tight">
            Your journey to smarter banking starts here
          </h2>
          <div className="space-y-3">
            {[
              'KYC verification via BVN or NIN',
              'One account per customer, pre-funded with ₦15,000',
              'Instant intra & inter-bank transfers',
              'Full transaction history & privacy',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-gold-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-navy-950" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-white/60 text-sm leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/20 text-xs">© {new Date().getFullYear()} LydsTrust Bank</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-6 overflow-y-auto">
        <div className="w-full max-w-lg">
          {/* Mobile logo */}
          <Link to="/" className="flex lg:hidden items-center gap-2 mb-4 justify-center">
            <div className="w-8 h-8 rounded-xl bg-gold-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-navy-950" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-white font-bold">LydsTrust Bank</span>
          </Link>

          <Link to="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-4 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to home
          </Link>

          <h1 className="text-2xl font-extrabold text-white mb-1">Create your account</h1>
          <p className="text-white/50 text-sm mb-4">Fill in your details to get started</p>

          {error && (
            <div className="bg-red-500/15 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-2.5 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">First Name <span className="text-red-400">*</span></label>
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="Lydia"
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">Last Name <span className="text-red-400">*</span></label>
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Fagbenle"
                  required
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">Email Address <span className="text-red-400">*</span></label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">Phone Number <span className="text-red-400">*</span></label>
              <div className="flex">
                {/* Custom country code picker */}
                <div className="relative flex-shrink-0" ref={codePickerRef}>
                  <button
                    type="button"
                    onClick={() => setShowCodePicker(!showCodePicker)}
                    className="flex items-center gap-1.5 pl-3 pr-2.5 py-2.5 rounded-l-xl bg-white/20 border border-r-0 border-white/30 text-white text-sm font-medium hover:bg-white/25 transition-colors"
                    style={{ minWidth: '108px' }}
                  >
                    <span>{COUNTRY_CODES.find(c => c.code === countryCode)?.label || countryCode}</span>
                    <svg className="w-3.5 h-3.5 text-white/60 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={showCodePicker ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
                    </svg>
                  </button>

                  {showCodePicker && (
                    <div className="absolute top-full left-0 mt-1 z-50 w-52 rounded-xl border border-white/20 shadow-2xl overflow-hidden" style={{ background: '#0d1526' }}>
                      <div className="max-h-56 overflow-y-auto">
                        {COUNTRY_CODES.map(({ code, label, country }) => (
                          <button
                            key={code}
                            type="button"
                            onClick={() => {
                              setCountryCode(code)
                              setForm({ ...form, phone: code + phoneDigits })
                              setShowCodePicker(false)
                            }}
                            className={`w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-white/10 transition-colors text-left ${code === countryCode ? 'bg-white/15 text-white font-semibold' : 'text-white/80'}`}
                          >
                            <span>{label}</span>
                            <span className="text-white/40 text-xs">{country}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <input
                  type="tel"
                  value={phoneDigits}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 11)
                    setPhoneDigits(digits)
                    setForm({ ...form, phone: countryCode + digits })
                  }}
                  placeholder="8012345678"
                  maxLength={11}
                  required
                  className={inputClass + ' rounded-l-none border-l-0'}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">Date of Birth <span className="text-red-400">*</span></label>
              <input
                type="date"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={handleChange}
                required
                className={inputClass + ' [color-scheme:dark]'}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">Home Address <span className="text-red-400">*</span></label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="123 Main Street, Lagos"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">Password <span className="text-red-400">*</span></label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Choose a strong password"
                  required
                  minLength={8}
                  className={inputClass + ' pr-12'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {(() => {
                const s = getPasswordStrength(form.password)
                return s ? (
                  <div className="mt-2">
                    <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-1 rounded-full transition-all duration-300" style={{ width: s.width, background: s.color }} />
                    </div>
                    <p className="text-xs mt-1 font-medium" style={{ color: s.color }}>{s.label}</p>
                  </div>
                ) : null
              })()}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gold-500 text-navy-950 font-bold py-3 rounded-xl hover:bg-gold-400 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {loading ? <Spinner size="sm" light /> : 'Create Account'}
            </button>
          </form>

          <p className="text-white/40 text-sm text-center mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-gold-500 font-medium hover:text-gold-400">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
