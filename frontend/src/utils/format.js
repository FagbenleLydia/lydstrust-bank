export function fmt(amount) {
  if (amount == null || isNaN(amount)) return '₦0.00'
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount)
}

export function fmtDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function fmtAccNo(num) {
  if (!num) return ''
  return `${num.slice(0, 4)} ${num.slice(4, 7)} ${num.slice(7)}`
}
