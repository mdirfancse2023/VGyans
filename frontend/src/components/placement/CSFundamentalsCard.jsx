import React from 'react';

export default function CSFundamentalsCard({ data }) {
  const roadmap = data?.roadmap || [
    { step: 1, title: 'OS & System Threading', timeline: 'Week 1', topics: ['Process vs Thread', 'Deadlocks', 'Paging & Memory Management'], description: 'Core operating system concepts frequently asked in technical interviews.' },
    { step: 2, title: 'DBMS, SQL & Indexing', timeline: 'Week 2', topics: ['ACID Properties', 'B-Trees', 'SQL Joins', 'Normalization'], description: 'Master relational database architecture, query optimization, and transaction safety.' }
  ];

  return (
    <div style={{ background: 'rgba(15, 23, 42, 0.65)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '24px', color: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <span style={{ fontSize: '2rem' }}>🧠</span>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>CS Core Fundamentals</h3>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>Operating Systems, DBMS, SQL, Computer Networks & System Design</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {roadmap.map((item, idx) => (
          <div key={idx} style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontWeight: 800, color: '#a7f3d0' }}>Step {item.step}: {item.title}</span>
              <span style={{ fontSize: '0.75rem', background: 'rgba(167, 243, 208, 0.15)', color: '#a7f3d0', padding: '4px 10px', borderRadius: '20px', fontWeight: 700 }}>{item.timeline}</span>
            </div>
            <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#cbd5e1' }}>{item.description}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {item.topics.map((t, tidx) => (
                <span key={tidx} style={{ fontSize: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', color: '#94a3b8', padding: '3px 8px', borderRadius: '6px' }}>#{t}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
