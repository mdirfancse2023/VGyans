import React from 'react';
import { usePlacement } from '../hooks/usePlacement';
import DSACard from './placement/DSACard';
import CSFundamentalsCard from './placement/CSFundamentalsCard';
import JobPlacementCard from './placement/JobPlacementCard';
import InterviewCard from './placement/InterviewCard';

export default function PlacementHub() {
  const { activeCategory, setActiveCategory, categories, categoryData, loading } = usePlacement('dsa');

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 10px 0' }}>
          🎓 Campus Placement Operating System
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.05rem', margin: 0 }}>
          Structured roadmaps, CS fundamentals, off-campus jobs, and verified student interview experiences.
        </p>
      </div>

      {/* Category Tab Selector (4 Categories) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '32px' }}>
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px 20px',
                borderRadius: '14px',
                background: isActive ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)' : 'rgba(30, 41, 59, 0.5)',
                border: isActive ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
                color: isActive ? '#38bdf8' : '#94a3b8',
                fontWeight: isActive ? 800 : 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Render Sub-Component based on Active Category Strategy */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8', fontSize: '1rem' }}>
          ⚡ Loading placement module data...
        </div>
      ) : (
        <div>
          {activeCategory === 'dsa' && <DSACard data={categoryData} />}
          {activeCategory === 'cs-fundamentals' && <CSFundamentalsCard data={categoryData} />}
          {activeCategory === 'jobs' && <JobPlacementCard data={categoryData} />}
          {activeCategory === 'interviews' && <InterviewCard data={categoryData} />}
        </div>
      )}
    </div>
  );
}
