import React from 'react';
import { useResume } from '../hooks/useResume';
import TechResumeAnalyzer from './resume/TechResumeAnalyzer';
import ManagementResumeAnalyzer from './resume/ManagementResumeAnalyzer';

export default function ResumeAnalyzer() {
  const {
    activeCategory,
    setActiveCategory,
    categories,
    analysisResult,
    analyzing,
    analyze
  } = useResume('technical');

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 16px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 900, background: 'linear-gradient(135deg, #a7f3d0 0%, #38bdf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 8px 0' }}>
          📄 ATS Resume Matcher & Score Optimizer
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0 }}>
          Categorized resume analysis tailored for Technical Software Engineering & Product Management recruitment.
        </p>
      </div>

      {/* Category Tab Selector (2 Categories) */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '28px' }}>
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 24px',
                borderRadius: '12px',
                background: isActive ? 'rgba(56, 189, 248, 0.2)' : 'rgba(30, 41, 59, 0.5)',
                border: isActive ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
                color: isActive ? '#38bdf8' : '#94a3b8',
                fontWeight: isActive ? 800 : 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Render Sub-Component based on Active Resume Category Strategy */}
      {activeCategory === 'technical' ? (
        <TechResumeAnalyzer onAnalyze={analyze} result={analysisResult} loading={analyzing} />
      ) : (
        <ManagementResumeAnalyzer onAnalyze={analyze} result={analysisResult} loading={analyzing} />
      )}
    </div>
  );
}
