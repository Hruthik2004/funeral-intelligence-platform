import { Loader2 } from 'lucide-react'
import clsx from 'clsx'

// ── Button ──────────────────────────────────────────────────────────────────
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  ...props
}) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500/50 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white shadow-glow-sm hover:shadow-glow',
    ghost: 'bg-transparent border border-white/15 hover:border-white/30 hover:bg-white/5 text-slate-300 hover:text-white',
    danger: 'bg-red-600 hover:bg-red-500 text-white',
    outline: 'border border-brand-500/40 hover:border-brand-400 text-brand-400 hover:text-brand-300 hover:bg-brand-500/5',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
    xl: 'px-8 py-4 text-base',
  }

  return (
    <button
      disabled={disabled || loading}
      className={clsx(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {loading && <Loader2 size={16} className="animate-spin flex-shrink-0" />}
      {children}
    </button>
  )
}

// ── Input ────────────────────────────────────────────────────────────────────
export function Input({
  label,
  error,
  hint,
  className = '',
  containerClassName = '',
  ...props
}) {
  return (
    <div className={clsx('flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label className="text-sm font-medium text-slate-300">{label}</label>
      )}
      <input
        className={clsx(
          'w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-slate-500',
          'focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500/60',
          'transition-all duration-200',
          error
            ? 'border-red-500/50 focus:ring-red-500/30'
            : 'border-white/10 hover:border-white/20',
          className
        )}
        {...props}
      />
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

// ── Loader ───────────────────────────────────────────────────────────────────
export function Loader({ size = 'md', className = '' }) {
  const sizes = { sm: 16, md: 24, lg: 40 }
  return (
    <div className={clsx('flex items-center justify-center', className)}>
      <Loader2
        size={sizes[size]}
        className="animate-spin text-brand-400"
      />
    </div>
  )
}

// ── SkeletonCard ─────────────────────────────────────────────────────────────
export function SkeletonCard() {
  return (
    <div className="glass-card p-5 flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="w-2 h-2 rounded-full skeleton mt-2 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-5 skeleton rounded-lg w-3/4" />
          <div className="h-3 skeleton rounded w-full" />
          <div className="h-3 skeleton rounded w-2/3" />
        </div>
      </div>
      <div className="space-y-2.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2.5">
            <div className="w-7 h-7 skeleton rounded-lg flex-shrink-0" />
            <div className="h-3 skeleton rounded flex-1" />
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-5 w-16 skeleton rounded-md" />
        ))}
      </div>
    </div>
  )
}

// ── EmptyState ───────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5">
          <Icon size={28} className="text-slate-600" />
        </div>
      )}
      <h3 className="font-display text-xl text-slate-300 mb-2">{title}</h3>
      <p className="text-slate-500 text-sm max-w-xs leading-relaxed mb-6">{description}</p>
      {action}
    </div>
  )
}

// ── Badge ─────────────────────────────────────────────────────────────────────
export function Badge({ children, variant = 'default' }) {
  const variants = {
    default: 'bg-slate-800 text-slate-300 border-slate-700/50',
    brand: 'bg-brand-500/10 text-brand-400 border-brand-500/20',
    gold: 'bg-gold-500/10 text-gold-400 border-gold-500/20',
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
  }
  return (
    <span className={clsx(
      'inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-semibold',
      variants[variant]
    )}>
      {children}
    </span>
  )
}

// ── SectionHeader ─────────────────────────────────────────────────────────────
export function SectionHeader({ eyebrow, title, description }) {
  return (
    <div className="text-center mb-12">
      {eyebrow && (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold uppercase tracking-wider mb-4">
          {eyebrow}
        </div>
      )}
      <h2 className="font-display text-3xl md:text-4xl text-white mb-4">{title}</h2>
      {description && (
        <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">{description}</p>
      )}
    </div>
  )
}
