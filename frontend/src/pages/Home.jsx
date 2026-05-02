import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { providerAPI } from '../services/api';

const FEATURES = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    title: 'Smart Search',
    desc: 'Find funeral providers by name, city, or service type instantly with full-text search.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
      </svg>
    ),
    title: 'AI-Powered Scraping',
    desc: 'Extract provider details from any funeral home website automatically.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
    title: 'AI Chat Assistant',
    desc: 'Ask natural language questions and get intelligent answers from our GPT-4 assistant.',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Compare Providers',
    desc: 'View services, pricing, and contact details side by side across all providers.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    ),
    title: 'Structured Data',
    desc: 'All provider data is stored in a structured PostgreSQL database for fast querying.',
    color: 'bg-sky-50 text-sky-600',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: 'REST API',
    desc: 'Full REST API backend with FastAPI — ready for integration with any system.',
    color: 'bg-rose-50 text-rose-600',
  },
];

const STATS = [
  { value: '500+', label: 'Providers Indexed' },
  { value: 'GPT-4', label: 'AI Model' },
  { value: '< 1s', label: 'Search Speed' },
  { value: '24/7', label: 'Availability' },
];

export default function Home() {
  const [providerCount, setProviderCount] = useState(null);

  useEffect(() => {
    providerAPI.getAll(1, 0).then(res => {
      setProviderCount(res.data.total);
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 pt-32 pb-24">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl" />
          <div className="absolute top-20 -left-20 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm text-white/80 mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            AI-Powered Platform · Built with FastAPI + GPT-4
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6 animate-slide-up">
            Funeral Intelligence
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-blue-300">
              Platform
            </span>
          </h1>

          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Discover, compare, and interact with funeral service providers using
            the power of AI. Search thousands of providers or ask our assistant
            anything about funeral services.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link to="/providers" className="btn-primary text-base px-8 py-3.5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search Providers
            </Link>
            <Link to="/chat" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white/10 backdrop-blur-sm text-white font-medium rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-200 text-base">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Start AI Chat
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-16 pt-12 border-t border-white/10 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            {STATS.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="font-display text-3xl font-bold text-white mb-1">
                  {i === 0 && providerCount !== null ? `${providerCount}+` : stat.value}
                </div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">Everything you need</h2>
            <p className="section-sub">A complete platform for funeral service intelligence</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="card p-6 hover:-translate-y-1 transition-transform duration-300"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className={`w-10 h-10 rounded-xl ${f.color} flex items-center justify-center mb-4`}>
                  {f.icon}
                </div>
                <h3 className="font-display font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-brand-600 to-brand-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-4xl font-bold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-brand-100 text-lg mb-8 max-w-xl mx-auto">
            Add your first funeral provider by scraping their website, or start searching our existing database.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/scraper" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-brand-700 font-semibold rounded-xl hover:bg-brand-50 transition-colors duration-200 shadow-sm">
              Add a Provider
            </Link>
            <Link to="/providers" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white/10 text-white font-medium rounded-xl border border-white/30 hover:bg-white/20 transition-colors duration-200">
              Browse All Providers
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
