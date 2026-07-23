import React from 'react';

export default function JobCard({ job }) {
  return (
    <div style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '16px', color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#38bdf8', fontWeight: 800 }}>{job.title}</h4>
        <span style={{ fontSize: '0.75rem', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '4px 10px', borderRadius: '20px', fontWeight: 700 }}>{job.type || 'Full-Time'}</span>
      </div>
      <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600 }}>{job.company} • {job.location}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
        <span style={{ fontSize: '0.85rem', color: '#a7f3d0', fontWeight: 700 }}>{job.salary || 'INR Competitive'}</span>
        <a href={job.link || 'https://virtualgyans.me'} target="_blank" rel="noopener noreferrer" style={{ background: '#2563eb', color: '#fff', textDecoration: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>Quick Apply ➔</a>
      </div>
    </div>
  );
}
