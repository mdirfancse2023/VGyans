import React from 'react';

export default function InterviewCard({ data }) {
  const experiences = data?.experiences || [
    { id: 'exp-1', company: 'Google', role: 'Software Engineer (SDE-1)', package: 'INR 32,00,000 P.A.', rounds: ['Online Assessment', 'Technical Round 1 (Trees & Graphs)', 'Technical Round 2 (DP)', 'Googliness HR Round'], tips: ['Focus on clean code, edge case handling, and explaining your thought process out loud.'], date: '2026-07-20' },
    { id: 'exp-2', company: 'Amazon', role: 'Software Development Engineer-I', package: 'INR 28,00,000 P.A.', rounds: ['OA Coding & Work Simulation', 'Technical Round 1 (System Design & LLD)', 'Technical Round 2 (Bar Raiser)'], tips: ['Memorize Amazon Leadership Principles and prepare STAR format behavioral stories.'], date: '2026-07-18' }
  ];

  return (
    <div style={{ background: 'rgba(15, 23, 42, 0.65)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '24px', color: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <span style={{ fontSize: '2rem' }}>🎯</span>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Mock Interviews & Experiences</h3>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>Verified student interview logs, FAANG rounds & behavioral prep</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {experiences.map((exp) => (
          <div key={exp.id} style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontWeight: 800, color: '#c084fc', fontSize: '1.1rem' }}>{exp.company} - {exp.role}</span>
              <span style={{ fontSize: '0.75rem', background: 'rgba(192, 132, 252, 0.15)', color: '#c084fc', padding: '4px 10px', borderRadius: '20px', fontWeight: 700 }}>{exp.package}</span>
            </div>
            <div style={{ margin: '8px 0', fontSize: '0.85rem', color: '#cbd5e1' }}>
              <strong>Rounds:</strong> {exp.rounds.join(' ➔ ')}
            </div>
            <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>
              💡 "{exp.tips[0]}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
