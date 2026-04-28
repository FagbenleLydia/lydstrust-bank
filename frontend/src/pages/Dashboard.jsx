import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import Spinner from '../components/Spinner'
import api from '../api/axios'
import { fmt, fmtAccNo } from '../utils/format'

export default function Dashboard() {
  const { user, refreshUser } = useAuth()

  const [account, setAccount] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [balance, setBalance] = useState(null)
  const [loadingAccount, setLoadingAccount] = useState(true)
  const [loadingBalance, setLoadingBalance] = useState(false)
  const [creatingAccount, setCreatingAccount] = useState(false)
  const [balanceVisible, setBalanceVisible] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoadingAccount(true)
    setError('')
    try {
      const [accRes, txRes] = await Promise.allSettled([
        api.get('/accounts/my-account'),
        api.get('/transactions/history'),
      ])
      if (accRes.status === 'fulfilled') {
        setAccount(accRes.value.data.data)
      } else if (accRes.reason?.response?.status !== 404) {
        setError('Could not load your account. Please refresh the page.')
      }
      if (txRes.status === 'fulfilled') setTransactions(txRes.value.data.data)
    } finally {
      setLoadingAccount(false)
    }
  }

  const handleCreateAccount = async () => {
    setCreatingAccount(true)
    setError('')
    try {
      const { data } = await api.post('/accounts/create')
      setAccount(data.data)
      await refreshUser()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account.')
    } finally {
      setCreatingAccount(false)
    }
  }

  const handleRefreshBalance = async () => {
    if (!account) return
    setLoadingBalance(true)
    try {
      const { data } = await api.get('/accounts/balance')
      setBalance(data.data.balance)
    } catch {
      setBalance(account.balance)
    } finally {
      setLoadingBalance(false)
    }
  }

  const currentBalance = balance ?? account?.balance

  const monthStats = useMemo(() => {
    const now = new Date()
    const thisMonth = transactions.filter(tx => {
      const d = new Date(tx.createdAt)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    const income = thisMonth.filter(tx => tx.type === 'CREDIT').reduce((s, tx) => s + tx.amount, 0)
    const expenses = thisMonth.filter(tx => tx.type === 'DEBIT').reduce((s, tx) => s + tx.amount, 0)
    return { income, expenses }
  }, [transactions])

  const recentTxs = transactions.slice(0, 5)

  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto">

        {/* Page header */}
        <div className="flex items-start justify-between mb-7 animate-fade-in-up">
          <div>
            <h1 className="text-[22px] font-extrabold text-gray-900 tracking-tight">
              Good {getGreeting()}, {user?.firstName} 👋
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">Here's a summary of your account today.</p>
          </div>
          {user?.isVerified && (
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-1.5 mt-1">
              <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-emerald-700 text-xs font-semibold">Verified</span>
            </div>
          )}
        </div>

        {/* KYC Banner */}
        {!user?.isVerified && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4 mb-6 animate-fade-in-up">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-amber-800 font-semibold text-sm">Identity Verification Required</p>
              <p className="text-amber-600 text-xs mt-0.5">Verify your BVN or NIN to unlock account creation and transfers.</p>
            </div>
            <Link to="/verify" className="bg-amber-500 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-amber-400 transition-colors flex-shrink-0">
              Verify Now
            </Link>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {loadingAccount ? (
          <div className="flex items-center justify-center py-24">
            <Spinner size="lg" />
          </div>
        ) : account ? (
          <>
            {/* ── Bank Card ── */}
            <div
              className="rounded-3xl p-7 mb-5 relative overflow-hidden animate-fade-in-up delay-100"
              style={{ background: 'linear-gradient(135deg, #080e1c 0%, #0c1625 45%, #0f1d30 100%)' }}
            >
              {/* Dot-grid texture */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)',
                  backgroundSize: '28px 28px',
                  opacity: 0.5,
                }}
              />
              {/* Gold glow top-right */}
              <div className="absolute -right-12 -top-12 w-72 h-72 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.18) 0%, transparent 60%)' }} />
              {/* Blue glow bottom-left */}
              <div className="absolute -left-12 bottom-0 w-56 h-56 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.09) 0%, transparent 65%)' }} />

              <div className="relative z-10">
                {/* Row 1: chip + DEBIT badge | brand + eye */}
                <div className="flex items-center justify-between mb-7">
                  <div className="flex items-center gap-3">
                    {/* SIM chip */}
                    <div
                      className="w-10 h-7 rounded-md p-1 flex flex-col justify-between"
                      style={{
                        background: 'linear-gradient(135deg, rgba(232,200,74,0.3) 0%, rgba(201,168,76,0.15) 100%)',
                        border: '1px solid rgba(201,168,76,0.35)',
                      }}
                    >
                      <div className="flex gap-0.5">
                        <div className="flex-1 rounded-[2px]" style={{ height: 6, background: 'rgba(201,168,76,0.55)' }} />
                        <div className="flex-1 rounded-[2px]" style={{ height: 6, background: 'rgba(201,168,76,0.55)' }} />
                      </div>
                      <div className="rounded-[2px] w-full" style={{ height: 5, background: 'rgba(201,168,76,0.3)' }} />
                      <div className="flex gap-0.5">
                        <div className="flex-1 rounded-[2px]" style={{ height: 6, background: 'rgba(201,168,76,0.55)' }} />
                        <div className="flex-1 rounded-[2px]" style={{ height: 6, background: 'rgba(201,168,76,0.55)' }} />
                      </div>
                    </div>
                    <span
                      className="text-[10px] font-bold tracking-[0.2em] px-2 py-0.5 rounded"
                      style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      DEBIT
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Mini brand mark */}
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-5 h-5 rounded flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #c9a84c, #e8c84a)' }}
                      >
                        <svg style={{ width: 10, height: 10, color: '#080e1c' }} fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                      </div>
                      <span style={{ color: 'rgba(255,255,255,0.28)', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em' }}>
                        LydsTrust
                      </span>
                    </div>
                    {/* Eye toggle */}
                    <button
                      onClick={() => setBalanceVisible(!balanceVisible)}
                      className="transition-colors p-1 rounded-lg"
                      style={{ color: 'rgba(255,255,255,0.25)' }}
                      title={balanceVisible ? 'Hide balance' : 'Show balance'}
                      aria-label={balanceVisible ? 'Hide balance' : 'Show balance'}
                    >
                      {balanceVisible ? (
                        <svg style={{ width: 17, height: 17 }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg style={{ width: 17, height: 17 }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Row 2: balance */}
                <div className="mb-2">
                  <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>
                    Available Balance
                  </p>
                  <p className="text-[40px] font-extrabold text-white tracking-tight leading-none">
                    {balanceVisible
                      ? loadingBalance
                        ? <span style={{ opacity: 0.4, fontSize: 28 }}>calculating…</span>
                        : fmt(currentBalance ?? 0)
                      : <span className="tracking-widest">₦ ••••••</span>
                    }
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginTop: 8, fontWeight: 500 }}>
                    {account.accountName}
                  </p>
                </div>

                {/* Row 3: formatted account number */}
                <div className="mt-5 mb-5">
                  <p
                    className="font-mono tracking-[0.22em]"
                    style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, letterSpacing: '0.22em' }}
                  >
                    {fmtAccNo(account.accountNumber)}
                    <span className="ml-3 not-italic font-sans tracking-normal" style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, letterSpacing: 'normal' }}>
                      · {account.bankName}
                    </span>
                  </p>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: 18 }} />

                {/* Row 4: status + actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12, fontWeight: 500 }}>Active account</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleRefreshBalance}
                      disabled={loadingBalance}
                      aria-label="Refresh balance"
                      className="flex items-center gap-1.5 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all disabled:opacity-50"
                      style={{ background: 'rgba(255,255,255,0.09)' }}
                    >
                      {loadingBalance ? <Spinner size="sm" light /> : (
                        <svg style={{ width: 13, height: 13 }} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      )}
                      Refresh
                    </button>
                    <Link
                      to="/transfer"
                      className="flex items-center gap-1.5 font-bold text-xs px-4 py-2 rounded-xl transition-all"
                      style={{ background: 'linear-gradient(135deg, #d4aa50, #e8c84a)', color: '#06101f' }}
                    >
                      <svg style={{ width: 13, height: 13 }} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      Send Money
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Stats */}
            <div className="grid grid-cols-2 gap-4 mb-5 animate-fade-in-up delay-150">
              <div className="bg-white rounded-2xl border border-gray-100 p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Money In</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                </div>
                <p className="text-[22px] font-extrabold text-gray-900 tracking-tight">{fmt(monthStats.income)}</p>
                <p className="text-xs text-gray-400 mt-1">This month · recent 50</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Money Out</span>
                  <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  </div>
                </div>
                <p className="text-[22px] font-extrabold text-gray-900 tracking-tight">{fmt(monthStats.expenses)}</p>
                <p className="text-xs text-gray-400 mt-1">This month · recent 50</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-4 mb-6 animate-fade-in-up delay-200">
              {[
                {
                  to: '/transfer',
                  label: 'Send Money',
                  desc: 'Transfer funds instantly',
                  iconBg: 'rgba(201,168,76,0.12)',
                  iconColor: '#c9a84c',
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  ),
                },
                {
                  to: '/transactions',
                  label: 'History',
                  desc: 'View all transactions',
                  iconBg: 'rgba(59,130,246,0.1)',
                  iconColor: '#3b82f6',
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  ),
                },
                {
                  to: '/verify',
                  label: 'Verify KYC',
                  desc: 'Identity check',
                  iconBg: 'rgba(16,185,129,0.1)',
                  iconColor: '#10b981',
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  ),
                },
              ].map((action) => (
                <Link
                  key={action.to}
                  to={action.to}
                  className="group bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3 hover:-translate-y-0.5 active:scale-95 transition-all duration-150"
                  style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                >
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105"
                    style={{ background: action.iconBg, color: action.iconColor }}
                  >
                    {action.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{action.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{action.desc}</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-fade-in-up delay-300"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-bold text-gray-900 text-[15px]">Recent Transactions</h2>
                  <p className="text-gray-400 text-xs mt-0.5">Your latest activity</p>
                </div>
                <Link
                  to="/transactions"
                  className="text-sm font-semibold hover:text-navy-900 transition-colors flex items-center gap-1"
                  style={{ color: '#163a6e' }}
                >
                  View all
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {recentTxs.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-gray-400 text-sm">No transactions yet</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {recentTxs.map((tx) => (
                    <TxRow key={tx._id} tx={tx} />
                  ))}
                </div>
              )}
            </div>
          </>
        ) : !error ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center py-16"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div className="w-16 h-16 rounded-2xl bg-navy-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-navy-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Bank Account Yet</h2>
            <p className="text-gray-400 text-sm mb-7 max-w-sm mx-auto leading-relaxed">
              {user?.isVerified
                ? 'Your identity is verified. Create your account now — it comes pre-funded with ₦15,000.'
                : 'You need to verify your identity before creating a bank account.'}
            </p>
            {user?.isVerified ? (
              <button
                onClick={handleCreateAccount}
                disabled={creatingAccount}
                className="inline-flex items-center gap-2 bg-navy-900 text-white font-bold px-7 py-3 rounded-xl hover:bg-navy-800 transition-colors disabled:opacity-50"
              >
                {creatingAccount ? <Spinner size="sm" light /> : 'Create My Account'}
              </button>
            ) : (
              <Link to="/verify" className="inline-flex items-center gap-2 bg-amber-500 text-white font-bold px-7 py-3 rounded-xl hover:bg-amber-400 transition-colors">
                Verify Identity First
              </Link>
            )}
          </div>
        ) : null}
      </div>
    </Layout>
  )
}

function TxRow({ tx }) {
  const isCredit = tx.type === 'CREDIT'
  const label = tx.narration || (isCredit ? 'Credit' : 'Debit')
  const initial = label.trim()[0]?.toUpperCase() ?? '?'

  const statusStyle = tx.status === 'SUCCESS'
    ? 'bg-emerald-50 text-emerald-700'
    : tx.status === 'PENDING'
    ? 'bg-amber-50 text-amber-700'
    : 'bg-red-50 text-red-700'

  return (
    <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
      {/* Initial avatar with credit/debit badge */}
      <div className="relative flex-shrink-0">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
          style={{ background: '#f3f4f6', color: '#374151' }}
        >
          {initial}
        </div>
        <div
          className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center"
          style={{ background: isCredit ? '#10b981' : '#ef4444' }}
        >
          <svg style={{ width: 7, height: 7 }} fill="none" stroke="white" strokeWidth={3} viewBox="0 0 24 24">
            {isCredit
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />}
          </svg>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate capitalize">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {new Date(tx.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      </div>

      <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
        <p className="text-sm font-bold" style={{ color: isCredit ? '#059669' : '#dc2626' }}>
          {isCredit ? '+' : '-'}{fmt(tx.amount)}
        </p>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusStyle}`}>
          {tx.status}
        </span>
      </div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Morning'
  if (h < 17) return 'Afternoon'
  return 'Evening'
}
