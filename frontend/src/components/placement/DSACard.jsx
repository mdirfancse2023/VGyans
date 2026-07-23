import React from 'react';

export default function DSACard({ data }) {
  const roadmap = data?.roadmap || [
    { step: 1, title: 'Array & String Patterns', timeline: 'Week 1-2', topics: ['Two Pointers', 'Sliding Window', 'Prefix Sum'], description: 'Master foundational array manipulation techniques required by top recruiters.' },
    { step: 2, title: 'Trees, Graphs & Dynamic Programming', timeline: 'Week 3-6', topics: ['Binary Search Trees', 'Graph Traversal (BFS/DFS)', 'DP Memoization'], description: 'Conquer medium-to-hard graph algorithms and state transitions.' }
  ];

  const resources = data?.resources || [
    { title: 'LeetCode 150 Blind Cheat Sheet', type: 'PDF', link: 'https://virtualgyans.me' },
    { title: 'Dynamic Programming Masterclass', type: 'Guide', link: 'https://virtualgyans.me' }
  ];

  return (
    <div style={{ background: 'rgba(15, 23, 42, 0.65)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '24px', color: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <span style={{ fontSize: '2rem' }}>⚡</span>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>DSA & Problem Solving</h3>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>LeetCode curated patterns, Data Structures & Algorithms</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
        {roadmap.map((item, idx) => (
          <div key={idx} style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontWeight: 800, color: '#38bdf8' }}>Step {item.step}: {item.title}</span>
              <span style={{ fontSize: '0.75rem', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '4px 10px', borderRadius: '20px', fontWeight: 700 }}>{item.timeline}</span>
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

      <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: '#f8fafc' }}>📚 Curated DSA Resources</h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        {resources.map((res, idx) => (
          <a key={idx} href={res.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '12px', color: '#38bdf8', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{res.title}</span>
            <span style={{ fontSize: '0.7rem', background: 'rgba(255, 255, 255, 0.1)', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>{res.type}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
