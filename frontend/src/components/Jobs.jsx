import React, { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:8000' : 'https://v-gyans.vercel.app');

const SOURCE_COLORS = {
  'LinkedIn':  { bg: 'rgba(10,102,194,0.15)',  border: 'rgba(10,102,194,0.4)',  color: '#0a66c2' },
  'Indeed':    { bg: 'rgba(0,114,235,0.12)',   border: 'rgba(0,114,235,0.35)',  color: '#0072eb' },
  'Glassdoor': { bg: 'rgba(0,163,107,0.12)',  border: 'rgba(0,163,107,0.35)',  color: '#00a36b' },
  'Naukri':    { bg: 'rgba(255,89,0,0.12)',   border: 'rgba(255,89,0,0.3)',    color: '#ff5900' },
  'Remotive':  { bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.3)', color: '#34d399' },
  'Arbeitnow': { bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.3)', color: '#60a5fa' },
  'The Muse':  { bg: 'rgba(167,139,250,0.12)',border: 'rgba(167,139,250,0.3)',color: '#a78bfa' },
  'JSearch':   { bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.3)', color: '#fbbf24' },
};

const TYPE_BADGE = {
  'Full Time':   { bg: 'rgba(52,211,153,0.1)',  color: '#34d399' },
  'Part Time':   { bg: 'rgba(251,191,36,0.1)',  color: '#fbbf24' },
  'Contract':    { bg: 'rgba(251,146,60,0.1)',  color: '#fb923c' },
  'Freelance':   { bg: 'rgba(167,139,250,0.1)', color: '#a78bfa' },
  'Internship':  { bg: 'rgba(96,165,250,0.1)',  color: '#60a5fa' },
};

function timeAgo(dateStr) {
  if (!dateStr) return '';
  try {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60)     return 'just now';
    if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  } catch { return ''; }
}

function JobCard({ job }) {
  const src  = SOURCE_COLORS[job.source] || SOURCE_COLORS['Remotive'];
  const type = TYPE_BADGE[job.type] || { bg: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' };

  return (
    <a href={job.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
      <div className="glass-card" style={{ padding: '18px 20px', transition: 'all 0.2s ease', cursor: 'pointer' }}>

        {/* Top row: logo + title + source badge */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          {/* Company logo */}
          <div style={{
            width: '46px', height: '46px', borderRadius: '10px', flexShrink: 0,
            background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-glass)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
          }}>
            {job.logo
              ? <img src={job.logo} alt={job.company}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }}
                  onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
              : null}
            <span style={{ fontSize: '1.3rem', display: job.logo ? 'none' : 'block' }}>🏢</span>
          </div>

          {/* Title + company */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, lineHeight: 1.35, whiteSpace: 'normal' }}>
              {job.title}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '3px 0 0', fontWeight: 500 }}>
              {job.company}
            </p>
          </div>

          {/* Source badge */}
          <span style={{
            background: src.bg, border: `1px solid ${src.border}`, color: src.color,
            fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: '20px',
            whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            {job.source}
          </span>
        </div>

        {/* Meta row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginTop: '12px' }}>
          {job.location && (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              📍 {job.location}
            </span>
          )}
          {job.type && (
            <span style={{
              fontSize: '0.75rem', fontWeight: 600, padding: '2px 10px', borderRadius: '20px',
              background: type.bg, color: type.color, border: `1px solid ${type.color}33`,
            }}>
              {job.type}
            </span>
          )}
          {job.remote && (
            <span className="badge badge-primary" style={{ fontSize: '0.72rem', padding: '2px 9px' }}>
              🌐 Remote
            </span>
          )}
          {job.salary && (
            <span style={{ fontSize: '0.75rem', color: '#fbbf24', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', padding: '2px 10px', borderRadius: '20px', fontWeight: 600 }}>
              💰 {job.salary}
            </span>
          )}
          {job.postedAt && (
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted, #475569)', marginLeft: 'auto' }}>
              {timeAgo(job.postedAt)}
            </span>
          )}
        </div>

        {/* Tags */}
        {job.tags && job.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
            {job.tags.map((tag, i) => (
              <span key={i} className="badge" style={{ fontSize: '0.7rem', padding: '2px 8px', background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)', border: '1px solid var(--border-glass)' }}>
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
  const [jobs, setJobs]           = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [search, setSearch]       = useState('');
  const [filterRemote, setFilterRemote] = useState('all');
  const [filterSource, setFilterSource] = useState('All');
  const [total, setTotal]         = useState(0);
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchJobs = useCallback(async () => {
    if (!search.trim()) {
      setJobs([]);
      setTotal(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('search', search.trim());
      if (filterRemote === 'remote') params.set('remote', 'true');
      if (filterRemote === 'onsite') params.set('remote', 'false');
      if (filterSource !== 'All') params.set('source', filterSource);

      const res = await fetch(`${API_URL}/api/jobs?${params}`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setJobs(data.jobs || []);
      setTotal(data.total || (data.jobs ? data.jobs.length : 0));
      setLastRefresh(new Date());
    } catch {
      setError('Could not load jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [search, filterRemote, filterSource]);

  useEffect(() => {
    if (!search.trim()) {
      setJobs([]);
      setTotal(0);
      setLoading(false);
      return;
    }
    const t = setTimeout(fetchJobs, 500);
    return () => clearTimeout(t);
  }, [fetchJobs, search]);

  const remoteFilters = [
    { id: 'all',    label: 'All Jobs' },
    { id: 'remote', label: '🌐 Remote' },
    { id: 'onsite', label: '🏢 On-site' },
  ];
  const SOURCES = ['All', 'LinkedIn', 'Indeed', 'Glassdoor', 'Naukri', 'Remotive', 'Arbeitnow', 'The Muse'];

  return (
    <div style={{ marginBottom: '3rem' }}>

      {/* Category Filters Bar & Search Box */}
      <div className="filters-wrapper" style={{ marginTop: '0.5rem' }}>
        <div className="filter-tabs">
          {remoteFilters.map(f => (
            <button
              key={f.id}
              className={`filter-tab ${filterRemote === f.id ? 'active' : ''}`}
              onClick={() => setFilterRemote(f.id)}
            >
              {f.label}
            </button>
          ))}

          <div style={{ width: '1px', background: 'var(--border-glass)', margin: '0 4px', alignSelf: 'stretch' }} />

          {SOURCES.map(s => {
            const sc = SOURCE_COLORS[s];
            return (
              <button
                key={s}
                className={`filter-tab ${filterSource === s ? 'active' : ''}`}
                onClick={() => setFilterSource(s)}
                style={filterSource === s && sc ? { color: sc.color, borderColor: sc.border } : {}}
              >
                {s}
              </button>
            );
          })}
        </div>

        {/* Search box */}
        <div className="search-box">
          <svg className="search-icon" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search jobs, skills, companies..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Count row */}
      {!loading && !error && search.trim() !== '' && (
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          Showing <strong style={{ color: 'var(--text-primary)' }}>{jobs.length}</strong> of{' '}
          <strong style={{ color: 'var(--text-primary)' }}>{total}</strong> jobs
        </p>
      )}

      {/* Loading */}
      {loading && (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <p style={{ margin: 0 }}>Searching active job listings...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>⚠️</p>
          <p style={{ color: 'var(--danger, #f87171)', marginBottom: '1rem' }}>{error}</p>
          <button className="btn btn-primary" onClick={fetchJobs}>Try Again</button>
        </div>
      )}

      {/* Empty / Initial State */}
      {!loading && !error && jobs.length === 0 && (
        <div className="glass-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>💼</p>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>
            {search.trim() ? 'No jobs found' : 'Search IT & Software Jobs'}
          </h3>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {search.trim() ? 'Try typing a different keyword or skill name.' : 'Type a job title, programming language, or company above to search live opportunities.'}
          </p>
        </div>
      )}

      {/* Job cards grid */}
      {!loading && !error && jobs.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {jobs.map(job => <JobCard key={job.id} job={job} />)}
        </div>
      )}
    </div>
  );
}
