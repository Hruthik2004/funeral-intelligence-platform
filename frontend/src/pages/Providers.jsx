import { useState, useEffect, useCallback, useRef } from 'react';
import { providerAPI } from '../services/api';
import ProviderCard from '../components/ProviderCard';
import { SkeletonGrid } from '../components/Loader';
import toast from 'react-hot-toast';

function EmptyState({ query }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>
      <h3 className="font-display text-xl font-semibold text-slate-700 mb-2">
        {query ? 'No results found' : 'No providers yet'}
      </h3>
      <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
        {query
          ? `No funeral providers match "${query}". Try a different search term.`
          : 'No providers have been added yet. Use the Scraper to add funeral home data.'}
      </p>
    </div>
  );
}

export default function Providers() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [total, setTotal] = useState(0);
  const debounceRef = useRef(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await providerAPI.getAll(100, 0);
      setProviders(res.data.providers);
      setTotal(res.data.total);
    } catch (err) {
      toast.error('Failed to load providers: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleSearch = useCallback((q) => {
    setSearchQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) {
      loadAll();
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await providerAPI.search(q.trim());
        setProviders(res.data.providers);
        setTotal(res.data.results);
      } catch (err) {
        toast.error('Search failed: ' + err.message);
      } finally {
        setSearching(false);
      }
    }, 350);
  }, [loadAll]);

  const isLoading = loading || searching;

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold text-slate-900">
                Funeral Providers
              </h1>
              <p className="text-slate-500 mt-1">
                {isLoading
                  ? 'Loading...'
                  : `${total} provider${total !== 1 ? 's' : ''} ${searchQuery ? `matching "${searchQuery}"` : 'in database'}`
                }
              </p>
            </div>
            <button
              onClick={loadAll}
              className="btn-ghost text-sm py-2 px-4 self-start sm:self-auto"
              disabled={loading}
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>

          {/* Search */}
          <div className="relative mt-6">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              {searching
                ? <svg className="w-4 h-4 text-brand-500 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                : <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
              }
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by name, city, state, or service..."
              className="input-field pl-11 pr-10 py-3.5 text-base"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); loadAll(); }}
                className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <SkeletonGrid count={6} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.length === 0
              ? <EmptyState query={searchQuery} />
              : providers.map((p) => <ProviderCard key={p.id} provider={p} />)
            }
          </div>
        )}
      </div>
    </div>
  );
}
