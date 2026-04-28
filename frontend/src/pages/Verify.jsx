import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import Spinner from '../components/Spinner'
import api from '../api/axios'

export default function Verify() {
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('BVN')
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const timerRef = useRef(null)

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const endpoint = tab === 'BVN' ? '/customers/verify-bvn' : '/customers/verify-nin'
      const payload = tab === 'BVN' ? { bvn: value } : { nin: value }
      const { data } = await api.post(endpoint, payload)
      setSuccess(data.message)
      await refreshUser()
      timerRef.current = setTimeout(() => navigate('/dashboard'), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const alreadyVerified = user?.isVerified

  return (
    <Layout>
      <div className="p-8 max-w-2xl mx-auto animate-fade-in-up">

        {/* Page header */}
        <div className="mb-7">
          <h1 className="text-[22px] font-extrabold text-gray-900 tracking-tight">Identity Verification</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Verify your identity using your BVN or NIN to unlock full banking features.
          </p>
        </div>

        {/* Already verified banner */}
        {alreadyVerified && (
          <div
            className="rounded-2xl p-5 flex items-center gap-4 mb-6"
            style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', border: '1px solid #a7f3d0' }}
          >
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="text-emerald-800 font-bold text-[15px]">Identity Verified</p>
              <p className="text-emerald-700 text-sm mt-0.5">
                Your {user.verificationMethod} has been successfully verified. You can now create a bank account.
              </p>
            </div>
          </div>
        )}

        {/* Main card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>

          {/* Tab switch */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            {['BVN', 'NIN'].map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setValue(''); setError(''); setSuccess('') }}
                disabled={alreadyVerified}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  tab === t
                    ? 'bg-white shadow-sm text-navy-900'
                    : 'text-gray-400 hover:text-gray-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {t === 'BVN' ? 'Bank Verification Number (BVN)' : 'National ID Number (NIN)'}
              </button>
            ))}
          </div>

          {/* Info box */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
            <p className="text-blue-800 text-sm font-semibold mb-1">
              {tab === 'BVN' ? 'What is a BVN?' : 'What is a NIN?'}
            </p>
            <p className="text-blue-700 text-xs leading-relaxed">
              {tab === 'BVN'
                ? 'Your Bank Verification Number (BVN) is an 11-digit number issued by the Central Bank of Nigeria to uniquely identify you across all Nigerian banks.'
                : 'Your National Identification Number (NIN) is an 11-digit number assigned to you by the National Identity Management Commission (NIMC).'}
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {success} Redirecting to dashboard…
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">{tab} Number</label>
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={`Enter your 11-digit ${tab}`}
                maxLength={11}
                minLength={11}
                pattern="\d{11}"
                required
                disabled={alreadyVerified || !!success}
                className="input"
              />
              <p className="text-xs text-gray-400 mt-1.5">Must be exactly 11 digits</p>
            </div>

            <button
              type="submit"
              disabled={loading || alreadyVerified || !!success}
              className="w-full flex items-center justify-center gap-2 bg-navy-900 text-white font-bold py-3.5 rounded-xl hover:bg-navy-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Spinner size="sm" light /> : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Verify {tab}
                </>
              )}
            </button>
          </form>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <h3 className="font-bold text-gray-900 mb-5 text-[15px]">How it works</h3>
          <div className="space-y-5">
            {[
              {
                step: '1',
                title: 'Enter your BVN or NIN',
                desc: 'Provide your 11-digit identity number.',
                color: '#c9a84c',
                bg: 'rgba(201,168,76,0.1)',
              },
              {
                step: '2',
                title: 'Verification via NIBSS',
                desc: 'Your details are checked against the NIBSS database in real time.',
                color: '#3b82f6',
                bg: 'rgba(59,130,246,0.1)',
              },
              {
                step: '3',
                title: 'Create your bank account',
                desc: 'Once verified, you can open your account and receive ₦15,000.',
                color: '#10b981',
                bg: 'rgba(16,185,129,0.1)',
              },
            ].map((s) => (
              <div key={s.step} className="flex items-start gap-4">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: s.bg, color: s.color }}
                >
                  {s.step}
                </div>
                <div className="pt-0.5">
                  <p className="text-sm font-semibold text-gray-800">{s.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust indicators */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider text-center mb-4">Security & Compliance</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ),
                label: '256-bit SSL',
                sub: 'Encrypted',
                color: '#3b82f6',
                bg: 'rgba(59,130,246,0.08)',
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                label: 'NIBSS Verified',
                sub: 'CBN Licensed',
                color: '#10b981',
                bg: 'rgba(16,185,129,0.08)',
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ),
                label: 'Privacy First',
                sub: 'Data Protected',
                color: '#c9a84c',
                bg: 'rgba(201,168,76,0.08)',
              },
            ].map((t) => (
              <div key={t.label} className="flex flex-col items-center text-center p-3 rounded-xl"
                style={{ background: t.bg }}>
                <span style={{ color: t.color }} className="mb-1.5">{t.icon}</span>
                <p className="text-xs font-bold text-gray-800">{t.label}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{t.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
