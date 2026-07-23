import React from 'react';

export default function NewsCard({ article }) {
  return (
    <div style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '16px', color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '0.75rem', background: 'rgba(192, 132, 252, 0.15)', color: '#c084fc', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>{article.category || 'Tech Hiring'}</span>
        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{article.time}</span>
      </div>
      <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', color: '#f8fafc', fontWeight: 800, lineHeight: 1.3 }}>{article.title}</h4>
      <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#cbd5e1' }}>{article.summary}</p>
      <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>Source: {article.source}</span>
    </div>
  );
}
