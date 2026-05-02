import { Flame, User } from 'lucide-react'
import clsx from 'clsx'

function formatTime(date) {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 animate-fade-in">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center flex-shrink-0 shadow-glow-sm">
        <Flame size={14} className="text-white" />
      </div>
      <div className="glass-card px-4 py-3 rounded-2xl rounded-bl-sm">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-brand-400 animate-bounce-dot"
              style={{ animationDelay: `${i * 0.16}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user'

  return (
    <div
      className={clsx(
        'flex items-end gap-3 animate-slide-up',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div className={clsx(
        'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-md',
        isUser
          ? 'bg-gradient-to-br from-slate-600 to-slate-700 border border-white/10'
          : 'bg-gradient-to-br from-brand-600 to-brand-800 shadow-glow-sm'
      )}>
        {isUser
          ? <User size={14} className="text-slate-300" />
          : <Flame size={14} className="text-white" />
        }
      </div>

      {/* Bubble */}
      <div className={clsx(
        'max-w-[75%] group',
        isUser ? 'items-end' : 'items-start',
        'flex flex-col gap-1'
      )}>
        <div
          className={clsx(
            'px-4 py-3 rounded-2xl text-sm leading-relaxed',
            isUser
              ? 'bg-brand-600 text-white rounded-br-sm shadow-glow-sm'
              : 'glass-card text-slate-200 rounded-bl-sm border border-white/8'
          )}
        >
          {/* Render newlines as breaks */}
          {message.content.split('\n').map((line, i) => (
            <span key={i}>
              {line}
              {i < message.content.split('\n').length - 1 && <br />}
            </span>
          ))}
        </div>

        {/* Timestamp */}
        <span className={clsx(
          'text-[10px] text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity px-1',
          isUser ? 'text-right' : 'text-left'
        )}>
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  )
}
