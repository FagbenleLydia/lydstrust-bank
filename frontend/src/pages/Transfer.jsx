import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import Spinner from '../components/Spinner'
import api from '../api/axios'
import { fmt } from '../utils/format'

const BANK_CODE = '415'

export default function Transfer() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [receiverAccount, setReceiverAccount] = useState('')
  const [bankCode, setBankCode] = useState(BANK_CODE)
  const [customBankCode, setCustomBankCode] = useState('')
  const [resolvedName, setResolvedName] = useState('')
  const [resolving, setResolving] = useState(false)
  const [resolveError, setResolveError] = useState('')

  const activeBankCode = bankCode === 'other' ? customBankCode : bankCode

  const [amount, setAmount] = useState('')
  const [narration, setNarration] = useState('')
  const [transferring, setTransferring] = useState(false)
  const [transferError, setTransferError] = useState('')

  const [result, setResult] = useState(null)
  const [userBalance, setUserBalance] = useState(null)
  const [userAccountNumber, setUserAccountNumber] = useState(null)

  useEffect(() => {
    api.get('/accounts/my-account').then(({ data }) => {
      setUserBalance(data.data.balance)
      setUserAccountNumber(data.data.accountNumber)
    }).catch(() => {})
  }, [])

  const handleResolve = async (e) => {
    e.preventDefault()
    setResolveError('')
    setResolvedName('')
    setResolving(true)
    try {
      const { data } = await api.get(`/accounts/name-enquiry/${receiverAccount}`)
      const name =
        data.data?.accountName ||
        data.data?.name ||
        data.data?.beneficiaryName ||
        'Name found'
      setResolvedName(name)
    } catch (err) {
      setResolveError(err.response?.data?.message || 'Could not resolve account. Check the details.')
    } finally {
      setResolving(false)
    }
  }

  const handleTransfer = async (e) => {
    e.preventDefault()
    setTransferError('')
    if (bankCode === 'other' && !/^\d{3}$/.test(customBankCode)) {
      setTransferError('Please enter a valid 3-digit bank code.')
      return
    }
    if (userAccountNumber && receiverAccount === userAccountNumber) {
      setTransferError('You cannot transfer funds to your own account.')
      return
    }
    if (userBalance !== null && Number(amount) > userBalance) {
      setTransferError(`Insufficient funds. Available balance: ${fmt(userBalance)}.`)
      return
    }
    setTransferring(true)
    try {
      const { data } = await api.post('/transactions/transfer', {
        receiverAccountNumber: receiverAccount,
        receiverBankCode: activeBankCode,
        amount: Number(amount),
        narration: narration || 'Transfer',
      })
      setResult(data.data)
      setUserBalance(data.data.newBalance)
    } catch (err) {
      setTransferError(err.response?.data?.message || 'Transfer failed. Please try again.')
    } finally {
      setTransferring(false)
    }
  }

  const reset = () => {
    setReceiverAccount('')
    setBankCode(BANK_CODE)
    setCustomBankCode('')
    setResolvedName('')
    setResolveError('')
    setAmount('')
    setNarration('')
    setResult(null)
    setTransferError('')
  }

  if (!user?.isVerified) {
    return (
      <Layout>
        <div className="p-8 max-w-xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center py-16"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Verification Required</h2>
            <p className="text-gray-400 text-sm mb-7">You need to verify your identity before making transfers.</p>
            <button onClick={() => navigate('/verify')} className="btn-primary">
              Verify Identity
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="p-8 max-w-xl mx-auto animate-fade-in-up">

        {/* Page header */}
        <div className="mb-7">
          <h1 className="text-[22px] font-extrabold text-gray-900 tracking-tight">Send Money</h1>
          <p className="text-gray-400 text-sm mt-0.5">Transfer funds to any bank account in Nigeria.</p>
        </div>

        {/* Success Result */}
        {result ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center py-12"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Transfer Sent!</h2>
            <p className="text-gray-400 text-sm mb-7">Your transfer has been processed successfully.</p>

            <div className="bg-gray-50 rounded-2xl p-5 text-left space-y-3 mb-7 border border-gray-100">
              <Row label="Amount Sent" value={<span className="text-red-600 font-bold">{fmt(result.amount)}</span>} />
              <Row label="New Balance" value={<span className="font-bold text-gray-900">{fmt(result.newBalance)}</span>} />
              <Row label="Reference" value={<span className="font-mono text-xs text-gray-500 break-all">{result.reference}</span>} />
            </div>

            <div className="flex gap-3 justify-center">
              <button onClick={reset} className="btn-primary">New Transfer</button>
              <button onClick={() => navigate('/transactions')} className="btn-outline">View History</button>
            </div>
          </div>
        ) : (
          <>
            {/* Step progress indicator */}
            <div className="flex items-center mb-6">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                  style={resolvedName
                    ? { background: '#10b981', color: '#fff' }
                    : { background: '#0b1f3a', color: '#fff' }}
                >
                  {resolvedName ? (
                    <svg style={{ width: 13, height: 13 }} fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : '1'}
                </div>
                <span className="text-sm font-semibold text-gray-700">Recipient</span>
              </div>

              <div className="flex-1 mx-4">
                <div
                  className="h-px rounded-full transition-all duration-500"
                  style={{ background: resolvedName ? '#10b981' : '#e5e7eb' }}
                />
              </div>

              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                  style={resolvedName
                    ? { background: '#0b1f3a', color: '#fff' }
                    : { background: '#f3f4f6', color: '#9ca3af' }}
                >
                  2
                </div>
                <span className={`text-sm font-semibold transition-colors ${resolvedName ? 'text-gray-700' : 'text-gray-400'}`}>
                  Amount
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              {/* Step 1 — Account Lookup */}
              <div className="mb-6">
                <h2 className="text-[15px] font-bold text-gray-800 mb-4 flex items-center gap-2.5">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: resolvedName ? '#10b981' : '#0b1f3a' }}
                  >
                    {resolvedName ? (
                      <svg style={{ width: 11, height: 11 }} fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : '1'}
                  </span>
                  Recipient Details
                </h2>

                <form onSubmit={handleResolve} className="space-y-4">
                  <div>
                    <label className="label">Bank</label>
                    <select
                      value={bankCode}
                      onChange={(e) => { setBankCode(e.target.value); setResolvedName(''); setResolveError('') }}
                      className="input"
                    >
                      <option value="415">LYD Bank (415)</option>
                      <option value="other">Other bank (enter code manually)</option>
                      <option value="011">First Bank (011)</option>
                      <option value="044">Access Bank (044)</option>
                      <option value="058">GTBank (058)</option>
                      <option value="057">Zenith Bank (057)</option>
                      <option value="033">United Bank for Africa (033)</option>
                      <option value="232">Sterling Bank (232)</option>
                      <option value="035">Wema Bank (035)</option>
                      <option value="070">Fidelity Bank (070)</option>
                      <option value="221">Stanbic IBTC (221)</option>
                    </select>
                    {bankCode === 'other' && (
                      <input
                        value={customBankCode}
                        onChange={(e) => { setCustomBankCode(e.target.value); setResolvedName(''); setResolveError('') }}
                        placeholder="3-digit bank code (e.g. 415 for LYD Bank)"
                        className="input mt-2"
                      />
                    )}
                  </div>

                  <div>
                    <label className="label">Account Number</label>
                    <div className="flex gap-2">
                      <input
                        value={receiverAccount}
                        onChange={(e) => { setReceiverAccount(e.target.value); setResolvedName(''); setResolveError('') }}
                        placeholder="10-digit account number"
                        maxLength={10}
                        minLength={10}
                        pattern="\d{10}"
                        required
                        className="input"
                      />
                      <button
                        type="submit"
                        disabled={resolving || receiverAccount.length < 10 || (bankCode === 'other' && !/^\d{3}$/.test(customBankCode))}
                        className="flex-shrink-0 flex items-center gap-2 bg-navy-900 text-white font-semibold px-4 py-3 rounded-xl hover:bg-navy-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {resolving ? <Spinner size="sm" light /> : 'Verify'}
                      </button>
                    </div>
                  </div>

                  {resolveError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                      {resolveError}
                    </div>
                  )}

                  {resolvedName && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-emerald-600 font-semibold">Account verified</p>
                        <p className="text-sm font-bold text-emerald-900">{resolvedName}</p>
                      </div>
                    </div>
                  )}
                </form>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 my-6" />

              {/* Step 2 — Amount */}
              <div>
                <h2 className={`text-[15px] font-bold text-gray-800 mb-4 flex items-center gap-2.5 ${!resolvedName ? 'opacity-40' : ''}`}>
                  <span className="w-6 h-6 rounded-full bg-navy-900 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                    2
                  </span>
                  Transfer Amount
                </h2>

                <form onSubmit={handleTransfer} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="label mb-0">Amount (₦)</label>
                      {userBalance !== null && (
                        <span className="text-xs text-gray-400">Available: <span className="font-semibold text-gray-600">{fmt(userBalance)}</span></span>
                      )}
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">₦</span>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        min={1}
                        step={0.01}
                        required
                        disabled={!resolvedName}
                        className="input pl-8"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">
                      Narration <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <input
                      value={narration}
                      onChange={(e) => setNarration(e.target.value)}
                      placeholder="e.g. Rent, School fees…"
                      maxLength={100}
                      disabled={!resolvedName}
                      className="input"
                    />
                  </div>

                  {transferError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                      {transferError}
                    </div>
                  )}

                  {/* Summary */}
                  {resolvedName && amount && (
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2.5 text-sm border border-gray-100">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Transfer Summary</p>
                      <Row label="To" value={<span className="font-semibold text-gray-900">{resolvedName}</span>} />
                      <Row label="Account" value={<span className="font-mono text-xs">{receiverAccount}</span>} />
                      <Row label="Bank" value={activeBankCode === BANK_CODE ? 'LYD Bank' : `Bank (${activeBankCode})`} />
                      <div className="h-px bg-gray-200 my-1" />
                      <Row label="Amount" value={<span className="font-bold text-red-600 text-base">{fmt(Number(amount))}</span>} />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!resolvedName || !amount || transferring}
                    className="w-full flex items-center justify-center gap-2 bg-navy-900 text-white font-bold py-3.5 rounded-xl hover:bg-navy-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {transferring ? <Spinner size="sm" light /> : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        Send Money
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-900">{value}</span>
    </div>
  )
}
