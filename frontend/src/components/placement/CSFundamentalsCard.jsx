import React, { useState } from 'react';

export default function CSFundamentalsCard({ onboardingData }) {
  const companyKeys = onboardingData ? Object.keys(onboardingData) : ['TCS', 'Infosys', 'Wipro', 'Accenture'];
  const [activeCompany, setActiveCompany] = useState(companyKeys[0] || 'TCS');
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  const stages = (onboardingData && onboardingData[activeCompany]) ? onboardingData[activeCompany] : [
    { stage: 'Offer Letter Acceptance & BG Verification', duration: '1-2 Weeks', desc: 'Document uploading, degree verification, and address background checks on onboarding portal.' },
    { stage: 'Pre-Onboarding Learning Program (Xplore/Foundation)', duration: '4-6 Weeks', desc: 'Self-paced training modules in Java/Python, RDBMS, and Agile methodologies with weekly assessments.' },
    { stage: 'Joining Letter & Location Allocation', duration: '2 Weeks', desc: 'Final joining location allocation based on assessment percentile and business requirement.' }
  ];

  return (
    <div>
      <div className="sub-filter-tabs" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {companyKeys.map((comp) => (
          <button
            key={comp}
            className={`sub-filter-tab ${activeCompany === comp ? 'active' : ''}`}
            onClick={() => { setActiveCompany(comp); setCurrentStageIndex(0); }}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: '10px',
              background: activeCompany === comp ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
              border: activeCompany === comp ? '1px solid var(--primary)' : '1px solid var(--border-glass)',
              color: activeCompany === comp ? '#fff' : 'var(--text-secondary)',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            🏢 {comp}
          </button>
        ))}
      </div>

      <div className="glass-panel tracker-container" style={{ padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div className="timeline" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {stages.map((stage, idx) => (
              <div 
                key={idx} 
                className="timeline-item" 
                onClick={() => setCurrentStageIndex(idx)}
                style={{
                  display: 'flex',
                  gap: '1rem',
                  cursor: 'pointer',
                  opacity: currentStageIndex === idx ? 1 : 0.6,
                  padding: '1rem',
                  borderRadius: '12px',
                  background: currentStageIndex === idx ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
                  border: currentStageIndex === idx ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid transparent',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: currentStageIndex === idx ? 'var(--primary)' : 'rgba(255, 255, 255, 0.2)', marginTop: '4px' }} />
                <div>
                  <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem', marginBottom: '4px' }}>
                    {stage.stage} <span className="badge badge-success" style={{ fontSize: '0.65rem', marginLeft: '6px' }}>{stage.duration}</span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{stage.desc.substring(0, 75)}...</div>
                </div>
              </div>
            ))}
          </div>

          {stages[currentStageIndex] && (
            <div className="glass-card" style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div className="badge badge-primary" style={{ marginBottom: '1rem', display: 'inline-block' }}>📋 Stage Details & Gyan Advice</div>
              <h3 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: 800 }}>{stages[currentStageIndex].stage}</h3>
              <div style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: '700', marginBottom: '1rem' }}>⏱️ Duration: {stages[currentStageIndex].duration}</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>{stages[currentStageIndex].desc}</p>
              <div style={{ background: 'rgba(6, 182, 212, 0.08)', borderLeft: '3px solid var(--primary)', padding: '1rem', borderRadius: '0 8px 8px 0', fontSize: '0.85rem', color: '#cbd5e1' }}>
                <strong>💡 Pro Gyan Tip:</strong> Ensure all academic semester marksheets and provisional certificates are uploaded in PDF format under 2MB.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
