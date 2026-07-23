import React from 'react';

export default function DSACard({ resources = [], search = '', setSearch, onAction }) {
  const filtered = (resources && resources.length > 0) ? resources.filter(res => 
    (res.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (res.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase()))
  ) : [
    { id: 'res-1', title: 'Data Structures & Algorithms Cheat Sheet', tags: ['DSA', 'LeetCode', 'Interview'], type: 'pdf', url: 'https://raw.githubusercontent.com/mdirfancse2023/mdirfancse2023.github.io/main/public/sample.pdf' },
    { id: 'res-2', title: 'SOLID Design Principles Handbook', tags: ['System Design', 'Architecture'], type: 'blog', content: 'Comprehensive guide covering SRP, OCP, LSP, ISP, and DIP with real-world enterprise code examples.' }
  ];

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type="text"
            placeholder="🔍 Search DSA notes, cheat sheets, tags..."
            value={search}
            onChange={(e) => setSearch && setSearch(e.target.value)}
            className="input-field"
            style={{ width: '100%', padding: '0.8rem 1.2rem', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)', fontSize: '0.95rem' }}
          />
        </div>
      </div>

      <div className="resources-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {filtered.map((res, idx) => {
          const isBlog = res.type === 'blog' || res.isBlog;
          return (
            <div key={res.id || idx} className="glass-panel resource-card" style={{ padding: '1.5rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                  <span className={`badge ${isBlog ? 'badge-primary' : 'badge-success'}`} style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                    {isBlog ? '📝 Study Blog' : '📄 PDF Resource'}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.6rem', lineHeight: 1.3 }}>
                  {res.title}
                </h3>
                <div className="resource-tags" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.2rem' }}>
                  {(res.tags || ['Placement', 'Prep']).map((tag) => (
                    <span key={tag} className="badge badge-secondary" style={{ fontSize: '0.7rem', opacity: 0.8 }}>#{tag}</span>
                  ))}
                </div>
              </div>
              <button
                className={`btn ${isBlog ? 'btn-secondary' : 'btn-primary'}`}
                style={{ width: '100%', gap: '0.5rem', cursor: 'pointer', padding: '0.75rem', borderRadius: '10px', fontWeight: 700 }}
                onClick={() => onAction && onAction(res)}
              >
                {isBlog ? '📖 Read Study Blog' : '👁️ View PDF Resource'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
