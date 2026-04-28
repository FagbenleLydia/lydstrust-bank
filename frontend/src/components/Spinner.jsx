export default function Spinner({ size = 'md', light = false }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' }
  return (
    <div
      className={`${sizes[size]} animate-spin rounded-full border-2 ${
        light ? 'border-white/30 border-t-white' : 'border-navy-200 border-t-navy-900'
      }`}
    />
  )
}
