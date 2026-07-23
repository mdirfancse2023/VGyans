import React, { useState } from 'react';
import ResumeBuilder from './ResumeBuilder';
import ResumeAnalyzer from './ResumeAnalyzer';
import WeatherWidget from './tools/WeatherWidget';

export default function InteractiveTools({ apiUrl }) {
  const [activeTool, setActiveTool] = useState('builder');

  return (
    <div style={{ marginBottom: '3rem' }}>
      <div className="filters-wrapper" style={{ marginBottom: '0.5rem' }}>
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
          <button 
            className={`filter-tab ${activeTool === 'weather' ? 'active' : ''}`}
            onClick={() => setActiveTool('weather')}
          >
            🌤️ Campus Weather & Focus Widget
          </button>
        </div>
      </div>

      {activeTool === 'builder' && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <ResumeBuilder />
        </div>
      )}

      {activeTool === 'analyzer' && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <ResumeAnalyzer apiUrl={apiUrl} />
        </div>
      )}

      {activeTool === 'weather' && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <WeatherWidget />
        </div>
      )}
    </div>
  );
}
