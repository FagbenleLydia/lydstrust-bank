import { useState, useEffect, useMemo } from 'react'
import Layout from '../components/Layout'
import Spinner from '../components/Spinner'
import api from '../api/axios'
import { fmt, fmtDate } from '../utils/format'

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [selected, setSelected] = useState(null)

  const [txRef, setTxRef] = useState('')
  const [checking, setChecking] = useState(false)
  const [statusResult, setStatusResult] = useState(null)
  const [statusError, setStatusError] = useState('')

  useEffect(() => {
    api.get('/transactions/history')
      .then(res => setTransactions(res.data.data))
      .catch(err => setError(err.response?.data?.message || 'Failed to load transactions.'))
      .finally(() => setLoading(false))
  }, [])

  const handleCheckStatus = async (e) => {
    e.preventDefault()
    setStatusResult(null)
    setStatusError('')
    setChecking(true)
    try {
      const { data } = await api.get(`/transactions/status/${txRef.trim()}`)
      setStatusResult(data.data)
    } catch (err) {
      setStatusError(err.response?.data?.message || 'Transaction not found.')
    } finally {
      setChecking(false)
    }
  }

  const filtered = filter === 'ALL'
    ? transactions
    : transactions.filter(tx => tx.type === filter)

  const summary = useMemo(() => {
    const totalIn = filtered.filter(t => t.type === 'CREDIT').reduce((s, t) => s + t.amount, 0)
    const totalOut = filtered.filter(t => t.type === 'DEBIT').reduce((s, t) => s + t.amount, 0)
    return { totalIn, totalOut, count: filtered.length }
  }, [filtered])

  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto animate-fade-in-up">

        {/* Page header */}
        <div className="mb-7">
          <h1 className="text-[22px] font-extrabold text-gray-900 tracking-tight">Transaction History</h1>
          <p className="text-gray-400 text-sm mt-0.5">Your last 50 transactions, most recent first.</p>
        </div>

        {/* Summary stats */}
        {!loading && transactions.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Transactions</p>
              <p className="text-2xl font-extrabold text-gray-900">{summary.count}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2">Total In</p>
              <p className="text-xl font-extrabold text-gray-900">{fmt(summary.totalIn)}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-2">Total Out</p>
              <p className="text-xl font-extrabold text-gray-900">{fmt(summary.totalOut)}</p>
            </div>
          </div>
        )}

        {/* Status Checker */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-navy-50 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-navy-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h2 className="text-sm font-bold text-gray-800">Check Transaction Status</h2>
          </div>
          <form onSubmit={handleCheckStatus} className="flex gap-2">
            <input
              value={txRef}
              onChange={e => { setTxRef(e.target.value); setStatusResult(null); setStatusError('') }}
              placeholder="Paste reference e.g. LYD-1234567890-ABCD1234"
              className="input flex-1 font-mono text-xs"
              required
            />
            <button
              type="submit"
              disabled={checking}
              className="flex-shrink-0 flex items-center gap-2 bg-navy-900 text-white font-semibold px-5 py-3 rounded-xl hover:bg-navy-800 transition-colors disabled:opacity-50 text-sm"
            >
              {checking ? <Spinner size="sm" light /> : 'Check'}
            </button>
          </form>

          {statusError && (
            <div className="mt-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {statusError}
            </div>
          )}

          {statusResult && (
            <div className="mt-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-gray-800">Result</span>
                <StatusBadge status={statusResult.status} />
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Detail label="Reference" value={<span className="font-mono text-xs break-all">{statusResult.reference}</span>} />
                <Detail label="Amount" value={
                  <span className={statusResult.type === 'CREDIT' ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}>
                    {statusResult.type === 'CREDIT' ? '+' : '-'}{fmt(statusResult.amount)}
                  </span>
                } />
                <Detail label="Type" value={<span className={statusResult.type === 'CREDIT' ? 'badge-credit' : 'badge-debit'}>{statusResult.type}</span>} />
                <Detail label="Date" value={fmtDate(statusResult.createdAt)} />
                <Detail label="From" value={statusResult.senderAccount} />
                <Detail label="To" value={statusResult.receiverAccount} />
                <Detail label="Balance Before" value={fmt(statusResult.balanceBefore)} />
                <Detail label="Balance After" value={fmt(statusResult.balanceAfter)} />
                {statusResult.nibssReference && (
                  <Detail label="NIBSS Ref" value={<span className="font-mono text-xs break-all">{statusResult.nibssReference}</span>} />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-5">
          {[
            { key: 'ALL', label: 'All' },
            { key: 'CREDIT', label: '↓ Credits' },
            { key: 'DEBIT', label: '↑ Debits' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                filter === f.key
                  ? 'bg-navy-900 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          ))}
          <span className="ml-auto text-sm text-gray-400 font-medium">{summary.count} results</span>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5">
            {error}
          </div>
        )}

        {/* Transaction list */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Spinner size="lg" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center py-16"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-400 text-sm font-medium">
              No {filter !== 'ALL' ? filter.toLowerCase() + ' ' : ''}transactions found.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((tx) => (
              <TxCard
                key={tx._id}
                tx={tx}
                isSelected={selected?._id === tx._id}
                onClick={() => setSelected(selected?._id === tx._id ? null : tx)}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

function TxCard({ tx, isSelected, onClick }) {
  const isCredit = tx.type === 'CREDIT'
  const label = tx.narration || (isCredit ? 'Incoming Transfer' : 'Outgoing Transfer')
  const initial = label.trim()[0]?.toUpperCase() ?? '?'

  return (
    <div
      role="button"
      tabIndex={0}
      aria-expanded={isSelected}
      className={`bg-white border rounded-2xl overflow-hidden transition-all cursor-pointer ${
        isSelected ? 'border-navy-300 shadow-md' : 'border-gray-100 hover:shadow-sm'
      }`}
      style={{ boxShadow: isSelected ? '0 4px 12px rgba(11,31,58,0.08)' : '0 1px 3px rgba(0,0,0,0.04)' }}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } }}
    >
      {/* Summary row */}
      <div className="flex items-center gap-4 p-4">
        <div className="relative flex-shrink-0">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm"
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
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-gray-800 truncate">{label}</p>
            <StatusBadge status={tx.status} />
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {isCredit ? `From ${tx.senderAccount}` : `To ${tx.receiverAccount}`}
          </p>
        </div>

        <div className="text-right flex-shrink-0">
          <p className="text-[15px] font-bold" style={{ color: isCredit ? '#059669' : '#dc2626' }}>
            {isCredit ? '+' : '-'}{fmt(tx.amount)}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {new Date(tx.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
          </p>
        </div>

        <svg
          className={`w-4 h-4 text-gray-300 flex-shrink-0 transition-transform ${isSelected ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Expanded details */}
      {isSelected && (
        <div className="border-t border-gray-100 bg-gray-50/60 px-5 py-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Detail label="Reference" value={<span className="font-mono text-xs break-all">{tx.reference}</span>} />
            <Detail label="Date & Time" value={fmtDate(tx.createdAt)} />
            <Detail label="Type" value={<span className={isCredit ? 'badge-credit' : 'badge-debit'}>{tx.type}</span>} />
            <Detail label="Status" value={<StatusBadge status={tx.status} />} />
            <Detail label="Balance Before" value={fmt(tx.balanceBefore)} />
            <Detail label="Balance After" value={fmt(tx.balanceAfter)} />
            <Detail label="From" value={tx.senderAccount} />
            <Detail label="To" value={tx.receiverAccount} />
            {tx.receiverName && <Detail label="Recipient Name" value={tx.receiverName} />}
            {tx.receiverBankCode && <Detail label="Bank Code" value={tx.receiverBankCode} />}
            {tx.nibssReference && (
              <Detail label="NIBSS Ref" value={<span className="font-mono text-xs break-all">{tx.nibssReference}</span>} />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5 font-medium">{label}</p>
      <p className="text-gray-800 font-semibold text-sm">{value}</p>
    </div>
  )
}

function StatusBadge({ status }) {
  const classes = {
    SUCCESS: 'badge-success',
    PENDING: 'badge-pending',
    FAILED: 'badge-failed',
  }
  return <span className={classes[status] || 'badge-pending'}>{status}</span>
}
