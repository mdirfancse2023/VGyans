import React, { useState, useRef, useEffect } from 'react';

const CAREER_ROLES = [
  {
    id: 'fresher-it',
    title: '🎓 IT Service Companies (TCS / Cognizant / Accenture / Wipro)',
    salary: '₹3.6 - ₹7.0 LPA',
    description: 'Perfect for campus and off-campus placements in major IT MNCs.',
    skills: ['Java / Python', 'SQL & DBMS', 'OOPs Concepts', 'Basic Data Structures', 'Aptitude & Communication'],
    roadmap: [
      'Master 1 core language (Java or Python) and OOPs concepts thoroughly.',
      'Practice SQL queries (Joins, Group By, Subqueries) — asked in 90% technical rounds.',
      'Solve 50+ basic LeetCode/GeeksforGeeks problems (Arrays, Strings, HashMaps).',
      'Prepare 2 solid full-stack or web projects to discuss during interview.'
    ],
    interviewTips: 'Focus heavily on clear communication, project explanation, and DBMS query writing on paper/screen.'
  },
  {
    id: 'sde-product',
    title: '⚡ Product Companies & High Growth Startups (Amazon / Swiggy / Swapp)',
    salary: '₹12.0 - ₹28.0 LPA',
    description: 'Targeted for High-Paying Software Development Engineer (SDE-1) roles.',
    skills: ['Data Structures & Algorithms', 'System Design Basics', 'React / Node.js or Spring Boot', 'Git & Docker'],
    roadmap: [
      'Solve 150+ Medium LeetCode problems covering Trees, Graphs, Dynamic Programming & Sliding Window.',
      'Build 1-2 complex production projects (e.g. Realtime Chat, Compiler, Distributed System).',
      'Understand API design, database indexing, RESTful standards, and caching.',
      'Practice mock coding interviews with timed problem solving.'
    ],
    interviewTips: 'Write clean, modular code out loud. Always discuss time and space complexity (Big-O) before coding.'
  },
  {
    id: 'fullstack-dev',
    title: '🌐 Full Stack Web Developer (MERN / Next.js)',
    salary: '₹6.0 - ₹16.0 LPA',
    description: 'High demand across modern tech startups and global engineering centers.',
    skills: ['React.js & Next.js', 'Node.js & Express', 'MongoDB / PostgreSQL', 'TypeScript', 'Tailwind CSS / REST APIs'],
    roadmap: [
      'Master modern JavaScript (Async/Await, Closures, Event Loop, ES6+).',
      'Build a complete full-stack web application with authentication and live backend.',
      'Learn state management (Redux/Zustand) and backend integration with databases.',
      'Deploy applications live on Vercel/Render with GitHub source repository.'
    ],
    interviewTips: 'Be ready to explain how state updates work, CORS, JWT authentication flow, and database schemas.'
  },
  {
    id: 'data-ai',
    title: '🤖 Data Science & AI/ML Engineer',
    salary: '₹7.5 - ₹18.0 LPA',
    description: 'Focus on Machine Learning models, Data Engineering, and Generative AI.',
    skills: ['Python & Pandas/NumPy', 'Machine Learning Algorithms', 'SQL & BigQuery', 'PyTorch / Scikit-Learn', 'LLM APIs'],
    roadmap: [
      'Master Python data manipulation libraries and exploratory data analysis (EDA).',
      'Understand supervised/unsupervised ML algorithms and metrics (Precision, Recall, F1).',
      'Build ML/NLP projects using open datasets (Kaggle) and deploy API endpoints.',
      'Explore LLM integration (Gemini API / OpenAI API / Vector DBs).'
    ],
    interviewTips: 'Understand model evaluation metrics deeply and be prepared to explain feature engineering decisions.'
  }
];

const QUICK_QA = [
  {
    q: 'How to crack TCS NQT Ninja vs Digital?',
    a: 'Ninja targets core programming & aptitude. Digital requires advanced coding (DSA problems in Python/Java/C++) and higher aptitude scores. Focus on Arrays, Strings, and DP.'
  },
  {
    q: 'What makes a resume pass ATS screening for IT roles?',
    a: 'Use a single-column layout, list standard section titles (Education, Skills, Experience, Projects), include action verbs (Developed, Engineered, Optimized), and add links to GitHub/LinkedIn.'
  },
  {
    q: 'How many DSA problems should I solve for 2026 placements?',
    a: 'For service MNCs: 50-80 basic/medium problems. For product SDE-1 roles: 150-250 medium & hard problems across Trees, Graphs, DP, and Backtracking.'
  }
];

export default function CareerCoach() {
  const [open, setOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(CAREER_ROLES[0]);
  const [activeTab, setActiveTab] = useState('roadmap'); // 'roadmap' | 'qa' | 'ask'
  const [customQuestion, setCustomQuestion] = useState('');
  const [customAnswer, setCustomAnswer] = useState('');
  const [loadingAnswer, setLoadingAnswer] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleAskCoach = (e) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;
    setLoadingAnswer(true);
    setCustomAnswer('');

    setTimeout(() => {
      const q = customQuestion.toLowerCase();
      let answer = "";
      if (q.includes("resume") || q.includes("cv")) {
        answer = "To boost your resume score: 1) Keep it 1 page, 2) Use standard headings, 3) Include live project links + GitHub, 4) Highlight tech stack used for each project (e.g. React, Node, SQL).";
      } else if (q.includes("interview") || q.includes("round")) {
        answer = "In technical interviews: 1) Always clarify requirements before coding, 2) Think out loud, 3) State time and space complexity, 4) Prepare a 2-minute self-introduction focusing on recent tech projects.";
      } else if (q.includes("salary") || q.includes("package") || q.includes("lpa")) {
        answer = "Fresher packages range from ₹3.5-7 LPA in service MNCs (TCS, Cognizant, Wipro) up to ₹12-28 LPA in product companies (Amazon, Swiggy, Google). Focus on core DSA & project architecture to target higher brackets.";
      } else {
        answer = `Great question regarding '${customQuestion}'! Focus on mastering 1 primary programming language, building 2 end-to-end projects with live demos, and practicing daily coding on LeetCode/GeeksforGeeks. Consistent practice for 4-6 weeks guarantees visible interview readiness!`;
      }
      setCustomAnswer(answer);
      setLoadingAnswer(false);
    }, 600);
  };

  return (
    <>
      {/* Floating Trigger Button (Bottom Right - In place of old feedback button) */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.95), rgba(168,85,247,0.95))',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '50px',
          padding: '11px 22px',
          cursor: 'pointer',
          color: '#ffffff',
          fontSize: '0.875rem',
          fontWeight: 700,
          backdropFilter: 'blur(12px)',
          boxShadow: '0 6px 28px rgba(99,102,241,0.45)',
          transition: 'all 0.22s ease',
          fontFamily: 'inherit',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(168,85,247,0.55)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = '0 6px 28px rgba(99,102,241,0.45)';
        }}
        title="Open AI Career Coach"
      >
        <span style={{ fontSize: '1.1rem' }}>🛋️</span>
        <span>Career Coach</span>
      </button>

      {/* Modal / Drawer */}
      {open && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9998,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
          padding: '80px 24px 24px',
          animation: 'ccFadeIn 0.2s ease',
        }}>
          <div
            ref={panelRef}
            style={{
              background: 'rgba(11,15,28,0.98)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '24px',
              width: '460px',
              maxWidth: 'calc(100vw - 32px)',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 24px 70px rgba(0,0,0,0.8)',
              overflow: 'hidden',
              fontFamily: 'inherit',
              animation: 'ccSlideUp 0.25s cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '20px 24px 16px',
              background: 'linear-gradient(180deg, rgba(99,102,241,0.12), rgba(0,0,0,0))',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                  borderRadius: '12px',
                  width: '38px',
                  height: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  boxShadow: '0 4px 14px rgba(99,102,241,0.35)'
                }}>
                  🛋️
                </div>
                <div>
                  <div style={{ fontSize: '1.08rem', fontWeight: 800, color: '#f8fafc' }}>Career Coach</div>
                  <div style={{ fontSize: '0.78rem', color: '#a5b4fc', marginTop: '1px' }}>AI Placement Strategy & Guidance</div>
                </div>
              </div>

              <button
                onClick={() => setOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'inherit'
                }}
              >
                ✕
              </button>
            </div>

            {/* Inner Sub-Header Tabs */}
            <div style={{ display: 'flex', padding: '12px 24px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', gap: '8px' }}>
              {[
                { id: 'roadmap', label: '🎯 Target Roles' },
                { id: 'qa',      label: '💡 Placement Q&A' },
                { id: 'ask',     label: '💬 Ask AI Coach' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  style={{
                    background: activeTab === t.id ? 'rgba(99,102,241,0.2)' : 'transparent',
                    border: 'none',
                    borderBottom: activeTab === t.id ? '2px solid #818cf8' : '2px solid transparent',
                    color: activeTab === t.id ? '#818cf8' : '#94a3b8',
                    padding: '8px 12px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    borderRadius: '6px 6px 0 0',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Content Body */}
            <div style={{ padding: '20px 24px 24px', overflowY: 'auto', flexGrow: 1 }}>

              {/* TAB 1: ROADMAP */}
              {activeTab === 'roadmap' && (
                <>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                    Select Your Target Role:
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
                    {CAREER_ROLES.map(role => (
                      <button
                        key={role.id}
                        onClick={() => setSelectedRole(role)}
                        style={{
                          background: selectedRole.id === role.id ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
                          border: selectedRole.id === role.id ? '1px solid rgba(129,140,248,0.5)' : '1px solid rgba(255,255,255,0.07)',
                          borderRadius: '12px',
                          padding: '12px 14px',
                          textAlign: 'left',
                          cursor: 'pointer',
                          color: selectedRole.id === role.id ? '#f1f5f9' : '#cbd5e1',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          transition: 'all 0.18s ease'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>{role.title}</span>
                          <span style={{ fontSize: '0.75rem', background: 'rgba(52,211,153,0.15)', color: '#34d399', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                            {role.salary}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Selected Role Detail */}
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '16px' }}>
                    <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '10px' }}>
                      {selectedRole.description}
                    </div>

                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#818cf8', marginBottom: '6px' }}>Required Skills:</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                      {selectedRole.skills.map((s, idx) => (
                        <span key={idx} style={{ fontSize: '0.75rem', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: '#c7d2fe', padding: '3px 9px', borderRadius: '6px' }}>
                          {s}
                        </span>
                      ))}
                    </div>

                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#34d399', marginBottom: '8px' }}>Action Roadmap:</div>
                    <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                      {selectedRole.roadmap.map((step, idx) => (
                        <li key={idx} style={{ marginBottom: '6px' }}>{step}</li>
                      ))}
                    </ul>

                    <div style={{ marginTop: '12px', padding: '10px 12px', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '10px', fontSize: '0.78rem', color: '#fef08a' }}>
                      💡 <strong>Pro Tip:</strong> {selectedRole.interviewTips}
                    </div>
                  </div>
                </>
              )}

              {/* TAB 2: PLACEMENT QA */}
              {activeTab === 'qa' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {QUICK_QA.map((item, idx) => (
                    <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '14px' }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '6px' }}>
                        ❓ {item.q}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.6 }}>
                        {item.a}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 3: ASK AI COACH */}
              {activeTab === 'ask' && (
                <form onSubmit={handleAskCoach} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                    Ask any question about software engineer roles, resume review, or interview preparation:
                  </div>

                  <textarea
                    value={customQuestion}
                    onChange={e => setCustomQuestion(e.target.value)}
                    placeholder="e.g. How do I prepare for Cognizant GenC Elevate coding round?"
                    rows={3}
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '12px',
                      padding: '12px',
                      color: '#f8fafc',
                      fontSize: '0.88rem',
                      outline: 'none',
                      resize: 'none',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                  />

                  <button
                    type="submit"
                    disabled={loadingAnswer}
                    style={{
                      background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '12px',
                      color: '#ffffff',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      cursor: loadingAnswer ? 'wait' : 'pointer',
                      fontFamily: 'inherit',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {loadingAnswer ? 'Analyzing Career Advice...' : 'Get Instant Guidance ✨'}
                  </button>

                  {customAnswer && (
                    <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '14px', padding: '14px', marginTop: '6px' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#818cf8', marginBottom: '6px' }}>🤖 Career Coach Advice:</div>
                      <div style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.6 }}>{customAnswer}</div>
                    </div>
                  )}
                </form>
              )}

            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes ccFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes ccSlideUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
    </>
  );
}
