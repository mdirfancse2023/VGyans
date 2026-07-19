import React, { useState } from 'react';
import ResumeBuilder from './ResumeBuilder';
import ResumeAnalyzer from './ResumeAnalyzer';

export default function InteractiveTools({ apiUrl }) {
  const [activeTool, setActiveTool] = useState('builder');

  return (
    <div style={{ marginBottom: '3rem' }}>
      <div className="section-header">
        <div className="section-info">
          <h2 className="section-title">Resume <span className="text-gradient">Tools</span></h2>
          <p className="section-desc">Build a professional resume from scratch or analyze your existing resume against a job description using AI.</p>
        </div>
      </div>

      <div className="filters-wrapper" style={{ marginBottom: '2.5rem' }}>
        <div className="filter-tabs" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
          <button 
            className={`filter-tab ${activeTool === 'builder' ? 'active' : ''}`}
            onClick={() => setActiveTool('builder')}
          >
            📄 Resume Builder
          </button>
          <button 
            className={`filter-tab ${activeTool === 'analyzer' ? 'active' : ''}`}
            onClick={() => setActiveTool('analyzer')}
          >
            🔍 Resume Analyzer
          </button>
        </div>
      </div>


      {activeTool === 'builder' && (
        <div className="glass-panel">
          <ResumeBuilder />
        </div>
      )}

      {activeTool === 'analyzer' && (
        <div className="glass-panel">
          <ResumeAnalyzer apiUrl={apiUrl} />
        </div>
      )}
    </div>
  );
}
