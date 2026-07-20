import React, { useEffect, useRef, useState } from 'react';

const features = [
  {
    icon: '🎥',
    title: 'Tutorial Videos',
    desc: 'Latest video uploads on hiring alerts, recruitment prep & tech topics.',
    tab: 'videos',
    color: '#6366f1',
    glow: 'rgba(99,102,241,0.25)',
  },
  {
    icon: '🧑‍💼',
    title: 'Interview Experiences',
    desc: 'Read authentic round-by-round reports shared by selected candidates.',
    tab: 'experiences',
    color: '#22d3ee',
    glow: 'rgba(34,211,238,0.2)',
  },
  {
    icon: '🏆',
    title: 'Placement Blueprints',
    desc: 'Step-by-step guides for Cognizant, TCS, Accenture, Wipro & more.',
    tab: 'guides',
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.2)',
  },
  {
    icon: '📄',
    title: 'Resume Builder',
    desc: 'Create a polished, recruiter-ready resume in minutes with our builder.',
    tab: 'tools',
    color: '#34d399',
    glow: 'rgba(52,211,153,0.2)',
  },
  {
    icon: '💻',
    title: 'Coding Playground',
    desc: 'Practice coding questions in Python, C++, and Java directly in-browser.',
    tab: 'playground',
    color: '#f472b6',
    glow: 'rgba(244,114,182,0.2)',
  },
  {
    icon: '🤖',
    title: 'Mock Interviews',
    desc: 'Practice technical and behavioral answers using interactive tools.',
    tab: 'tools',
    color: '#a78bfa',
    glow: 'rgba(167,139,250,0.2)',
  },
  {
    icon: '🗺️',
    title: 'Onboarding Tracker',
    desc: 'Track and monitor onboarding timelines for major IT companies.',
    tab: 'guides',
    color: '#3b82f6',
    glow: 'rgba(59,130,246,0.2)',
  },
  {
    icon: '🃏',
    title: 'Technical Flashcards',
    desc: 'Quickly review core CS concepts, DBMS, and OOP concepts.',
    tab: 'guides',
    color: '#10b981',
    glow: 'rgba(16,185,129,0.2)',
  },
  {
    icon: '🔍',
    title: 'Resume ATS Analyzer',
    desc: 'Scan your resume against any job description with AI-driven scores.',
    tab: 'tools',
    color: '#ec4899',
    glow: 'rgba(236,72,153,0.2)',
  },
  {
    icon: '🛢️',
    title: 'SQL Practice Console',
    desc: 'Practice MySQL and PostgreSQL queries directly in your browser.',
    tab: 'playground',
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.2)',
  },
];

const floatingBadges = [
  { text: 'Interview Qs',  icon: '💬', delay: '0s',   top: '5%',   left: '-20%' },
  { text: 'Interview Exp', icon: '🧑‍💼', delay: '0.4s', top: '38%',  left: '-26%' },
  { text: '350+ Qns',      icon: '🧩', delay: '0.8s', top: '70%',  left: '-18%' },
  { text: 'AI Resume',     icon: '✨', delay: '1.2s', top: '10%',  right: '-20%' },
  { text: 'Live Code',     icon: '💻', delay: '1.6s', top: '42%',  right: '-26%' },
  { text: 'MNC Guides',    icon: '📚', delay: '2s',   top: '72%',  right: '-18%' },
];

export default function Hero({ stats, setActiveTab }) {
  const formatNumber = (numStr) => {
    if (!numStr) return '0';
    const num = parseInt(numStr.replace(/,/g, ''), 10);
    if (isNaN(num)) return numStr;
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);

  return (
    <>
      <style>{`
        /* ─── Hero Wrapper ─── */
        .hero2-root {
          position: relative;
          overflow: hidden;
          padding: 0 0 3.5rem;
          margin-bottom: 3.5rem;
        }

        /* animated mesh gradient background */
        .hero2-bg {
          position: absolute; inset: 0; z-index: 0;
          background:
            radial-gradient(ellipse 70% 60% at 15% 40%, rgba(99,102,241,0.18) 0%, transparent 70%),
            radial-gradient(ellipse 55% 50% at 85% 20%, rgba(34,211,238,0.13) 0%, transparent 70%),
            radial-gradient(ellipse 60% 55% at 50% 90%, rgba(245,158,11,0.10) 0%, transparent 70%);
          animation: hero2BgShift 12s ease-in-out infinite alternate;
        }
        @keyframes hero2BgShift {
          from { opacity: 0.7; transform: scale(1); }
          to   { opacity: 1;   transform: scale(1.05); }
        }

        /* grid lines overlay */
        .hero2-grid {
          position: absolute; inset: 0; z-index: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 48px 48px;
        }

        /* ─── Top section: headline + avatar ─── */
        .hero2-top {
          position: relative; z-index: 2;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          text-align: center;
          gap: 2rem;
          padding: 1.5rem 0 2rem;
          opacity: 0; transform: translateY(28px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .hero2-top.visible { opacity: 1; transform: translateY(0); }

        .hero2-left {
          display: flex; flex-direction: column; align-items: center;
          width: 100%; max-width: 720px;
        }

        .hero2-eyebrow {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background: rgba(99,102,241,0.12);
          border: 1px solid rgba(99,102,241,0.35);
          border-radius: 100px;
          padding: 0.3rem 0.9rem;
          font-size: 0.75rem; font-weight: 600;
          color: #a5b4fc;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin-bottom: 1.2rem;
        }
        .hero2-eyebrow span { font-size: 0.9rem; }

        .hero2-h1 {
          font-size: clamp(1.5rem, 3.5vw, 2.2rem);
          font-weight: 800;
          line-height: 1.18;
          letter-spacing: -0.025em;
          color: var(--text-primary);
          margin: 0 0 0.85rem;
        }
        .hero2-h1 .grad {
          background: linear-gradient(135deg, #818cf8 0%, #38bdf8 50%, #34d399 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero2-sub {
          font-size: 0.88rem; line-height: 1.6;
          color: var(--text-secondary);
          max-width: 600px; margin: 0 auto 1.5rem;
        }

        .hero2-btns { display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center; }

         .hero2-btn-primary {
          display: inline-flex; align-items: center; gap: 0.55rem;
          padding: 0.75rem 1.75rem;
          background: rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.25);
          color: #fff; font-weight: 700; font-size: 0.95rem;
          border-radius: 100px; cursor: pointer;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
        }
        .hero2-btn-primary:hover { 
          background: rgba(255, 255, 255, 0.22);
          border-color: rgba(255, 255, 255, 0.4);
          transform: translateY(-2px); 
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3); 
        }

        .hero2-btn-secondary {
          display: inline-flex; align-items: center; gap: 0.55rem;
          padding: 0.73rem 1.75rem;
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.14);
          color: var(--text-primary); font-weight: 600; font-size: 0.95rem;
          border-radius: 100px; cursor: pointer;
          transition: background 0.2s, transform 0.2s;
        }
        .hero2-btn-secondary:hover { background: rgba(255,255,255,0.11); transform: translateY(-2px); }

        /* ─── Right: Avatar visual ─── */
        .hero2-right {
          position: relative; flex-shrink: 0;
          width: 240px;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 0.8rem;
        }
        .hero2-avatar-img {
          width: 210px; height: 210px; border-radius: 50%;
          object-fit: cover;
          border: 3px solid rgba(255,255,255,0.12);
          box-shadow: 0 0 0 6px rgba(99,102,241,0.15), 0 0 40px rgba(99,102,241,0.25);
          position: relative; z-index: 2;
        }

        /* floating badges */
        .float-badge {
          position: absolute;
          display: flex; align-items: center; gap: 0.25rem;
          background: rgba(15,22,42,0.88);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 100px;
          padding: 0.25rem 0.55rem;
          font-size: 0.65rem; font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap; z-index: 5;
          animation: floatUpDown 3.5s ease-in-out infinite;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }
        @keyframes floatUpDown {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-7px); }
        }

        /* ─── Stats bar ─── */
        .hero2-stats {
          position: relative; z-index: 2;
          display: flex; gap: 0; flex-wrap: wrap;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 3.5rem;
        }
        .hero2-stat {
          flex: 1; min-width: 120px;
          padding: 1.25rem 1.5rem;
          text-align: center;
          border-right: 1px solid rgba(255,255,255,0.07);
          transition: background 0.2s;
        }
        .hero2-stat:last-child { border-right: none; }
        .hero2-stat:hover { background: rgba(255,255,255,0.04); }
        .hero2-stat-val {
          font-size: 1.9rem; font-weight: 800; letter-spacing: -0.04em;
          background: linear-gradient(135deg, #818cf8, #38bdf8);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
        }
        .hero2-stat-label {
          font-size: 0.78rem; color: var(--text-secondary); margin-top: 0.3rem; font-weight: 500;
        }

        /* ─── Feature Grid ─── */
        .hero2-features-title {
          position: relative; z-index: 2;
          text-align: center;
          font-size: 1.6rem; font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
          letter-spacing: -0.02em;
        }
        .hero2-features-sub {
          text-align: center;
          color: var(--text-secondary);
          font-size: 0.92rem;
          margin-bottom: 2.2rem;
          position: relative; z-index: 2;
        }

        .hero2-grid {
          position: relative; z-index: 2;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.1rem;
        }

        .hero2-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 1.5rem 1.4rem;
          cursor: pointer;
          transition: transform 0.22s, border-color 0.22s, background 0.22s, box-shadow 0.22s;
          position: relative; overflow: hidden;
        }
        .hero2-card::before {
          content: '';
          position: absolute; inset: 0; border-radius: 16px;
          opacity: 0;
          transition: opacity 0.22s;
          background: var(--card-glow);
        }
        .hero2-card:hover { transform: translateY(-5px); border-color: var(--card-color); box-shadow: 0 8px 32px var(--card-glow); }
        .hero2-card:hover::before { opacity: 1; }

        .hero2-card-icon {
          font-size: 2rem; margin-bottom: 0.85rem;
          display: inline-flex; align-items: center; justify-content: center;
          width: 52px; height: 52px; border-radius: 14px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
        }
        .hero2-card-title {
          font-size: 1rem; font-weight: 700;
          color: var(--text-primary); margin: 0 0 0.4rem;
        }
        .hero2-card-desc {
          font-size: 0.82rem; line-height: 1.55;
          color: var(--text-secondary); margin: 0;
        }
        .hero2-card-arrow {
          display: inline-flex; align-items: center; gap: 0.3rem;
          margin-top: 0.9rem;
          font-size: 0.78rem; font-weight: 600;
          color: var(--card-color);
          opacity: 0;
          transform: translateX(-6px);
          transition: opacity 0.2s, transform 0.2s;
        }
        .hero2-card:hover .hero2-card-arrow { opacity: 1; transform: translateX(0); }

        @media (max-width: 768px) {
          .hero2-top { padding-top: 1.5rem; }
          .hero2-grid { grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }
        }
      `}</style>

      <div className="hero2-root">
        <div className="hero2-bg" />
        <div className="hero2-grid" style={{ position:'absolute',inset:0,zIndex:0,backgroundImage:'linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)',backgroundSize:'48px 48px',pointerEvents:'none' }} />

        {/* ── TOP: Headline + Avatar ── */}
        <div className={`hero2-top ${visible ? 'visible' : ''}`}>
          <div className="hero2-left">
            <div className="hero2-eyebrow">
              <span>🚀</span> Your Placement Journey Starts Here
            </div>
            <h1 className="hero2-h1">
              Crack Your Tech Career with{' '}
              <span className="grad">Virtual Gyans</span>
            </h1>
            <p className="hero2-sub">
              The all-in-one platform for placement prep — tutorials, interview experiences,
              AI resume tools, SQL &amp; coding playground, flashcards, and real company insights.
            </p>
            <div className="hero2-btns">
              <button className="hero2-btn-primary" onClick={() => setActiveTab('guides')}>
                🏆 Explore Placement Prep
              </button>
              <button className="hero2-btn-secondary" onClick={() => setActiveTab('playground')}>
                💻 Try Code Playground
              </button>
            </div>
          </div>

          <div className="hero2-right">
            <img
              src={(stats.avatarUrl && !stats.avatarUrl.includes('unsplash')) ? stats.avatarUrl : '/youtube-avatar.png'}
              alt="Md Irfan — Virtual Gyans"
              className="hero2-avatar-img"
              loading="eager"
              fetchpriority="high"
              decoding="sync"
            />
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', zIndex: 2, letterSpacing: '-0.01em', marginTop: '0.2rem' }}>
              Md Irfan
            </div>

            {floatingBadges.map((b, i) => (
              <div
                key={i}
                className="float-badge"
                style={{
                  top: b.top, left: b.left, right: b.right,
                  animationDelay: b.delay,
                  animationDuration: `${3.2 + i * 0.4}s`,
                }}
              >
                <span>{b.icon}</span>{b.text}
              </div>
            ))}
          </div>
        </div>

        {/* ── STATS BAR ── */}
        <div className="hero2-stats">
          {[
            { val: formatNumber(stats.subscriberCount) + '+', label: 'YouTube Subscribers' },
            { val: formatNumber(stats.viewCount) + '+',       label: 'Total Views' },
            { val: stats.videoCount,                          label: 'Tutorial Videos' },
            { val: '350+',                                    label: 'Practice Questions' },
          ].map((s, i) => (
            <div className="hero2-stat" key={i}>
              <div className="hero2-stat-val">{s.val}</div>
              <div className="hero2-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── FEATURES GRID ── */}
        <p className="hero2-features-title">Everything You Need to Get Placed</p>
        <p className="hero2-features-sub">Ten powerful tools — one platform, zero confusion.</p>

        <div className="hero2-grid">
          {features.map((f, i) => (
            <div
              key={i}
              className="hero2-card"
              style={{ '--card-color': f.color, '--card-glow': f.glow }}
              onClick={() => setActiveTab(f.tab)}
            >
              <div className="hero2-card-icon">{f.icon}</div>
              <div className="hero2-card-title">{f.title}</div>
              <p className="hero2-card-desc">{f.desc}</p>
              <div className="hero2-card-arrow">
                Explore → 
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
