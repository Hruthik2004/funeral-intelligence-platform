import { useState } from 'react';
import { providerAPI } from '../services/api';
import { Spinner } from '../components/Loader';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const SAMPLE_URLS = [
  'https://www.dignitymemorial.com',
  'https://www.legacy.com',
  'https://www.neptunesociety.com',
];

export default function Scraper() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleScrape = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await providerAPI.scrape(url.trim());
      const data = res.data;
      setResult(data);
      if (data.already_exists) {
        toast('Provider already in database.', { icon: 'ℹ️' });
      } else {
        toast.success(`"${data.provider?.name}" added successfully!`);
      }
    } catch (err) {
      setError(err.message);
      toast.error('Scraping failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl shadow-glow mb-5">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
            </svg>
          </div>
          <h1 className="font-display text-3xl font-bold text-slate-900 mb-3">
            Add a New Provider
          </h1>
          <p className="text-slate-500 text-lg max-w-lg mx-auto leading-relaxed">
            Paste any funeral home website URL and our AI scraper will extract their information automatically.
          </p>
        </div>

        {/* Form Card */}
        <div className="card p-8 mb-6">
          <form onSubmit={handleScrape} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Website URL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.example-funeral-home.com"
                  className="input-field pl-11 py-3.5 text-base"
                  required
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Supports any funeral home, cremation service, or memorial provider website.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="btn-primary w-full justify-center text-base py-3.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Spinner size="sm" color="white" />
                  Scraping website...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Scrape & Save Provider
                </>
              )}
            </button>
          </form>

          {/* Sample URLs */}
          <div className="mt-6 pt-6 border-t border-slate-50">
            <p className="text-xs text-slate-400 mb-3 font-medium uppercase tracking-wider">Try with sample URLs</p>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_URLS.map((u) => (
                <button
                  key={u}
                  onClick={() => setUrl(u)}
                  className="text-xs px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg border border-slate-100 hover:bg-slate-100 hover:border-slate-200 transition-colors font-mono"
                >
                  {u.replace('https://', '')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="card p-5 border-red-100 bg-red-50 animate-slide-up mb-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-red-800 text-sm">Scraping Failed</p>
                <p className="text-red-600 text-sm mt-0.5">{error}</p>
                <p className="text-red-500 text-xs mt-2">
                  Some websites may block automated access. Try another URL or check the URL is correct.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Success result */}
        {result?.provider && (
          <div className="card p-6 animate-slide-up border-green-100">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-display font-semibold text-slate-900">
                  {result.already_exists ? 'Already in Database' : 'Successfully Added!'}
                </h3>
                <p className="text-sm text-slate-500">{result.message}</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-5 space-y-3">
              <h4 className="font-display font-bold text-slate-900 text-lg">{result.provider.name}</h4>
              {result.provider.phone && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {result.provider.phone}
                </div>
              )}
              {result.provider.address && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {result.provider.address}
                  {result.provider.city && `, ${result.provider.city}`}
                  {result.provider.state && `, ${result.provider.state}`}
                </div>
              )}
              {result.provider.services?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {result.provider.services.slice(0, 6).map((s, i) => (
                    <span key={i} className="badge bg-white text-slate-600 border border-slate-200 text-xs">{s}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-4">
              <Link to="/providers" className="btn-primary text-sm py-2 px-4 flex-1 justify-center">
                View All Providers
              </Link>
              <button
                onClick={() => { setUrl(''); setResult(null); }}
                className="btn-ghost text-sm py-2 px-4"
              >
                Add Another
              </button>
            </div>
          </div>
        )}

        {/* How it works */}
        <div className="mt-8 card p-6">
          <h3 className="font-display font-semibold text-slate-900 mb-4">How it works</h3>
          <div className="space-y-4">
            {[
              { step: '1', title: 'Paste URL', desc: 'Enter any funeral home website URL above' },
              { step: '2', title: 'AI Scraping', desc: 'Our scraper extracts name, phone, address, services, and pricing' },
              { step: '3', title: 'Stored & Searchable', desc: 'Data is saved to the database and instantly searchable' },
              { step: '4', title: 'AI Chat Ready', desc: 'The AI assistant can now answer questions about this provider' },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <div className="w-7 h-7 bg-brand-100 text-brand-700 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
