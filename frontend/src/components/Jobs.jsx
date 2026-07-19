import React, { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:8000' : 'https://v-gyans.vercel.app');

const SOURCE_COLORS = {
  'Remotive': { bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.3)', color: '#34d399' },
  'Arbeitnow': { bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.3)', color: '#60a5fa' },
  'The Muse': { bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.3)', color: '#a78bfa' },
};

function timeAgo(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff/86400)}d ago`;
    return d.toLocaleDateString('en-IN', { day:'numeric', month:'short' });
  } catch { return ''; }
}

function JobCard({ job }) {
  const src = SOURCE_COLORS[job.source] || SOURCE_COLORS['Remotive'];
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={job.url} target="_blank" rel="noopener noreferrer"
      style={{ textDecoration: 'none' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        background: hovered ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${hovered ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: '14px',
        padding: '18px 20px',
        transition: 'all 0.2s ease',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered ? '0 8px 32px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.15)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          {/* Logo */}
          <div style={{
            width: '44px', height: '44px', borderRadius: '10px', flexShrink: 0,
            background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
          }}>
            {job.logo
              ? <img src={job.logo} alt={job.company} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }} onError={e => { e.target.style.display='none'; e.target.parentElement.innerHTML='<span style="font-size:1.4rem">🏢</span>'; }} />
              : <span style={{ fontSize: '1.4rem' }}>🏢</span>
            }
          </div>
          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.97rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '4px', lineHeight: 1.3 }}>
              {job.title}
            </div>
            <div style={{ fontSize: '0.83rem', color: '#94a3b8', fontWeight: 500 }}>
              {job.company}
            </div>
          </div>
          {/* Source badge */}
          <div style={{ background: src.bg, border: `1px solid ${src.border}`, color: src.color, fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', whiteSpace: 'nowrap', flexShrink: 0 }}>
            {job.source}
          </div>
        </div>

        {/* Meta row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          {job.location && (
            <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
              📍 {job.location}
            </span>
          )}
          {job.type && (
            <span style={{ fontSize: '0.78rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', padding: '2px 10px', borderRadius: '20px' }}>
              {job.type}
            </span>
          )}
          {job.remote && (
            <span style={{ fontSize: '0.78rem', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399', padding: '2px 10px', borderRadius: '20px' }}>
              🌐 Remote
            </span>
          )}
          {job.salary && (
            <span style={{ fontSize: '0.78rem', color: '#fbbf24', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', padding: '2px 10px', borderRadius: '20px' }}>
              💰 {job.salary}
            </span>
          )}
          {job.postedAt && (
            <span style={{ fontSize: '0.76rem', color: '#475569', marginLeft: 'auto' }}>
              {timeAgo(job.postedAt)}
            </span>
          )}
        </div>

        {/* Tags */}
        {job.tags && job.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {job.tags.map((tag, i) => (
              <span key={i} style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b', padding: '2px 9px', borderRadius: '6px' }}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </a>
  );
}

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filterRemote, setFilterRemote] = useState(null);
  const [filterSource, setFilterSource] = useState('All');
  const [total, setTotal] = useState(0);
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (filterRemote !== null) params.set('remote', filterRemote);
      if (filterSource !== 'All') params.set('source', filterSource);
      const res = await fetch(`${API_URL}/api/jobs?${params}`);
      if (!res.ok) throw new Error('Failed to fetch jobs');
      const data = await res.json();
      setJobs(data.jobs || []);
      setTotal(data.total || 0);
      setLastRefresh(new Date());
    } catch (err) {
      setError('Could not load jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [search, filterRemote, filterSource]);

  useEffect(() => {
    const timer = setTimeout(fetchJobs, search ? 600 : 0);
    return () => clearTimeout(timer);
  }, [fetchJobs]);

  const SOURCES = ['All', 'Remotive', 'Arbeitnow', 'The Muse'];

  return (
    <div style={{ minHeight: '100vh', padding: '2rem 1rem', maxWidth: '900px', margin: '0 auto', fontFamily: 'inherit' }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#f8fafc', margin: 0, letterSpacing: '-0.03em' }}>
          IT Jobs Board
        </h1>
        <p style={{ color: '#64748b', marginTop: '6px', fontSize: '0.9rem' }}>
          Real-time listings aggregated from Remotive, Arbeitnow & The Muse
          {lastRefresh && <span style={{ marginLeft: '12px', color: '#475569' }}>• refreshed {timeAgo(lastRefresh.toISOString())}</span>}
        </p>
      </div>

      {/* Search + Filters */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '1rem', pointerEvents: 'none' }}>🔍</span>
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search jobs, companies, skills..."
            style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px 12px 42px', color: '#f1f5f9', fontSize: '0.92rem', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
            onFocus={e => e.target.style.borderColor='rgba(255,255,255,0.25)'}
            onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
          )}
        </div>

        {/* Filter row */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Remote filter */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {[{label: 'All Jobs', val: null}, {label: '🌐 Remote Only', val: true}, {label: '🏢 On-site', val: false}].map(opt => (
              <button key={String(opt.val)} onClick={() => setFilterRemote(opt.val)}
                style={{ background: filterRemote === opt.val ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${filterRemote === opt.val ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)'}`, color: filterRemote === opt.val ? '#f1f5f9' : '#64748b', borderRadius: '20px', padding: '6px 14px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                {opt.label}
              </button>
            ))}
          </div>

          {/* Source filter */}
          <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto' }}>
            {SOURCES.map(s => {
              const sc = SOURCE_COLORS[s];
              const active = filterSource === s;
              return (
                <button key={s} onClick={() => setFilterSource(s)}
                  style={{ background: active && sc ? sc.bg : (active ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)'), border: `1px solid ${active && sc ? sc.border : (active ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.07)')}`, color: active && sc ? sc.color : (active ? '#f1f5f9' : '#64748b'), borderRadius: '20px', padding: '6px 14px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      {!loading && !error && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
          <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
            Showing <span style={{ color: '#f1f5f9', fontWeight: 700 }}>{jobs.length}</span> of <span style={{ color: '#f1f5f9', fontWeight: 700 }}>{total}</span> jobs
          </div>
          <button onClick={fetchJobs} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#64748b', borderRadius: '8px', padding: '5px 14px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '5px', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.color='#f1f5f9'; e.currentTarget.style.borderColor='rgba(255,255,255,0.25)'; }}
            onMouseLeave={e => { e.currentTarget.style.color='#64748b'; e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'; }}>
            ↺ Refresh
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: '2rem', marginBottom: '16px', animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</div>
          <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Fetching latest IT jobs...</div>
          <div style={{ color: '#475569', fontSize: '0.8rem', marginTop: '6px' }}>Aggregating from 3 sources</div>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⚠️</div>
          <div style={{ color: '#f87171', fontSize: '0.9rem', marginBottom: '16px' }}>{error}</div>
          <button onClick={fetchJobs} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#f1f5f9', borderRadius: '10px', padding: '10px 24px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Try Again</button>
        </div>
      )}

      {/* No results */}
      {!loading && !error && jobs.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔍</div>
          <div style={{ color: '#64748b', fontSize: '0.9rem' }}>No jobs found matching your filters.</div>
          <button onClick={() => { setSearch(''); setFilterRemote(null); setFilterSource('All'); }} style={{ marginTop: '16px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#f1f5f9', borderRadius: '10px', padding: '9px 20px', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}>Clear Filters</button>
        </div>
      )}

      {/* Job cards */}
      {!loading && !error && jobs.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {jobs.map(job => <JobCard key={job.id} job={job} />)}
        </div>
      )}

      {/* Footer note */}
      {!loading && jobs.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: '2.5rem', padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ color: '#475569', fontSize: '0.8rem' }}>
            Jobs sourced from Remotive · Arbeitnow · The Muse • Click any card to apply
          </div>
        </div>
      )}
    </div>
  );
}
