import React, { useState } from 'react';

export default function TechResumeAnalyzer({ onAnalyze, result, loading }) {
  const [text, setText] = useState('');
  const [role, setRole] = useState('Software Engineer');

  const handleSubmit = (e) => {
    e.preventDefault();
    onAnalyze({ text, targetRole: role });
  };

  return (
    <div style={{ background: 'rgba(15, 23, 42, 0.65)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '24px', color: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <span style={{ fontSize: '1.8rem' }}>💻</span>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>Technical / Software Engineering ATS Analyzer</h3>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>Evaluates Java, Spring Boot, Python, React, System Design & Cloud keywords</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
        <div>
          <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Target Technical Role</label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{ width: '100%', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '0.85rem' }}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Paste Technical Resume Text</label>
          <textarea
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your software engineering resume summary, skills, and experience..."
            style={{ width: '100%', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '0.85rem', resize: 'vertical' }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{ background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer' }}
        >
          {loading ? 'Analyzing Technical ATS Alignment...' : '🔍 Analyze Technical Resume'}
        </button>
      </form>

      {result && (
        <div style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontWeight: 800, color: '#38bdf8' }}>ATS Match Score: {result.score}%</span>
            <span style={{ fontSize: '0.75rem', background: result.atsPassed ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: result.atsPassed ? '#4ade80' : '#f87171', padding: '4px 10px', borderRadius: '20px', fontWeight: 700 }}>
              {result.atsPassed ? '✅ ATS Passed' : '⚠️ Action Needed'}
            </span>
          </div>
          <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#cbd5e1' }}>{result.summary}</p>
          <div style={{ marginBottom: '10px' }}>
            <strong style={{ fontSize: '0.8rem', color: '#a7f3d0' }}>Detected Technical Skills:</strong>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
              {result.skills.map((s, idx) => (
                <span key={idx} style={{ fontSize: '0.75rem', background: 'rgba(167, 243, 208, 0.15)', color: '#a7f3d0', padding: '2px 8px', borderRadius: '6px' }}>✓ {s}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
