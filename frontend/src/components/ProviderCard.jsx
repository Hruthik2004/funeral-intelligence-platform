import { useState } from 'react';

export default function ProviderCard({ provider }) {
  const [expanded, setExpanded] = useState(false);
  const services = provider.services || [];
  const visibleServices = expanded ? services : services.slice(0, 4);

  const initials = provider.name
    ? provider.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : '??';

  const hue = provider.name
    ? (provider.name.charCodeAt(0) * 37 + provider.name.charCodeAt(1 % provider.name.length) * 17) % 360
    : 220;

  return (
    <div className="card p-6 group cursor-default">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-display font-bold text-sm flex-shrink-0 shadow-sm"
          style={{ background: `hsl(${hue}, 55%, 50%)` }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-slate-900 text-base leading-snug line-clamp-2 group-hover:text-brand-700 transition-colors">
            {provider.name}
          </h3>
          {(provider.city || provider.state) && (
            <p className="text-xs text-slate-400 mt-0.5">
              {[provider.city, provider.state].filter(Boolean).join(', ')}
            </p>
          )}
        </div>
      </div>

      {/* Contact info */}
      <div className="space-y-2 mb-4">
        {provider.phone && (
          <a
            href={`tel:${provider.phone}`}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-brand-600 transition-colors group/link"
          >
            <span className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover/link:bg-green-100 transition-colors">
              <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </span>
            <span className="truncate">{provider.phone}</span>
          </a>
        )}
        {provider.address && (
          <div className="flex items-start gap-2 text-sm text-slate-600">
            <span className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </span>
            <span className="line-clamp-2 leading-relaxed">{provider.address}</span>
          </div>
        )}
        {provider.email && (
          <a
            href={`mailto:${provider.email}`}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-brand-600 transition-colors"
          >
            <span className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </span>
            <span className="truncate">{provider.email}</span>
          </a>
        )}
      </div>

      {/* Services */}
      {services.length > 0 && (
        <div className="border-t border-slate-50 pt-4">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Services</p>
          <div className="flex flex-wrap gap-1.5">
            {visibleServices.map((svc, i) => (
              <span
                key={i}
                className="badge bg-slate-50 text-slate-600 border border-slate-100"
              >
                {svc}
              </span>
            ))}
            {services.length > 4 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="badge bg-brand-50 text-brand-600 border border-brand-100 cursor-pointer hover:bg-brand-100 transition-colors"
              >
                {expanded ? 'Show less' : `+${services.length - 4} more`}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Description */}
      {provider.description && (
        <p className="mt-3 text-xs text-slate-400 line-clamp-2 leading-relaxed border-t border-slate-50 pt-3">
          {provider.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
        {provider.website && (
          <a
            href={provider.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1 transition-colors"
          >
            Visit website
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
        {provider.scraped_at && (
          <span className="text-xs text-slate-300 ml-auto">
            {new Date(provider.scraped_at).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}
