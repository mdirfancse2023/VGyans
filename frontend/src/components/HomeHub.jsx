import React from 'react';
import Hero from './Hero';

export default function HomeHub({ 
  videos = [], 
  resources = [], 
  experiences = [], 
  setActiveTab, 
  onOpenNotes, 
  user,
  channelStats 
}) {
  const launchpadFeatures = [
    {
      id: 'playground',
      icon: '💻',
      title: 'IDE Code Playground',
      desc: 'Online editor for Python, Java, C++, and SQL with instant test execution.',
      badge: 'Interactive IDE',
      color: '#38bdf8',
      action: () => setActiveTab('playground')
    },
    {
      id: 'jobs',
      icon: '💼',
      title: 'IT Jobs Board',
      desc: 'Search active software engineering roles aggregated from top tech portals.',
      badge: 'Live Listings',
      color: '#10b981',
      action: () => setActiveTab('jobs')
    },
    {
      id: 'tools',
      icon: '📄',
      title: 'Resume Builder & AI Matcher',
      desc: 'Create ATS resumes and analyze match scores against job descriptions.',
      badge: 'ATS Resume Tools',
      color: '#8b5cf6',
      action: () => setActiveTab('tools')
    },
    {
      id: 'guides',
      icon: '🎓',
      title: 'Placement Prep & Question Bank',
      desc: 'Company recruitment blueprints, MCQ flashcards, and candidate logs.',
      badge: 'Prep Hub',
      color: '#f59e0b',
      action: () => setActiveTab('guides')
    },
    {
      id: 'news',
      icon: '📰',
      title: 'Tech News & Insights',
      desc: 'Developer updates, AI frameworks, hiring alerts, and tech news.',
      badge: 'Live Feed',
      color: '#ec4899',
      action: () => setActiveTab('news')
    },
    {
      id: 'songs',
      icon: '🎵',
      title: 'Focus Music & Ambient Player',
      desc: 'Lofi beats and binaural soundscapes designed for coding focus.',
      badge: 'Audio Player',
      color: '#06b6d4',
      action: () => setActiveTab('songs')
    }
  ];

  const placementTimelineSteps = [
    {
      step: '01',
      title: 'Master Fundamentals & Problem Solving',
      subtitle: 'Coding Practice & Core CS Concepts',
      desc: 'Build strong foundations in Data Structures, Algorithms, DBMS, SQL, and OOP. Practice live coding challenges directly in our browser IDE.',
      icon: '💻',
      tag: 'Step 1: Code',
      color: '#38bdf8',
      actionText: 'Open IDE Playground',
      action: () => setActiveTab('playground')
    },
    {
      step: '02',
      title: 'Build ATS Resume & Run AI Match',
      subtitle: 'Portfolio & Resume Optimization',
      desc: 'Create a recruiter-ready ATS resume and scan it against your target job description to get instant AI feedback and improvement tips.',
      icon: '📄',
      tag: 'Step 2: Resume',
      color: '#8b5cf6',
      actionText: 'Build & Analyze Resume',
      action: () => setActiveTab('tools')
    },
    {
      step: '03',
      title: 'Study Company Blueprints & Flashcards',
      subtitle: 'Company-Specific Recruitment Prep',
      desc: 'Review company exam patterns for TCS, Accenture, Cognizant, Wipro, and Amazon. Practice MCQ flashcards for aptitude, DBMS & core CS.',
      icon: '📚',
      tag: 'Step 3: Prep',
      color: '#f59e0b',
      actionText: 'Explore Placement Hub',
      action: () => setActiveTab('guides')
    },
    {
      step: '04',
      title: 'Practice Mock Questions & Real Experiences',
      subtitle: 'Round-by-Round Interview Preparation',
      desc: 'Read authentic interview logs shared by recently hired candidates and prepare technical & HR answers using Gyans Copilot AI.',
      icon: '🧑‍💼',
      tag: 'Step 4: Interview',
      color: '#ec4899',
      actionText: 'Read Interview Logs',
      action: () => setActiveTab('guides')
    },
    {
      step: '05',
      title: 'Apply to Targeted IT Opportunities',
      subtitle: 'Job Search & Application',
      desc: 'Search active developer jobs, software engineer roles, and campus hiring alerts aggregated from top portals.',
      icon: '💼',
      tag: 'Step 5: Apply',
      color: '#10b981',
      actionText: 'Search IT Jobs Board',
      action: () => setActiveTab('jobs')
    },
    {
      step: '06',
      title: 'Land Your Dream Offer & Track Onboarding',
      subtitle: 'Offer Acceptance & Onboarding',
      desc: 'Monitor onboarding timelines, document verification steps, and celebrate landing your software developer role!',
      icon: '🎉',
      tag: 'Step 6: Placed!',
      color: '#06b6d4',
      actionText: 'Track Onboarding',
      action: () => setActiveTab('guides')
    }
  ];

  return (
    <div>
      {/* Top Hero Banner */}
      <Hero stats={channelStats} setActiveTab={setActiveTab} />

      {/* Main Home Container */}
      <div style={{ maxWidth: '1400px', margin: '0 auto 4rem', padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        
        {/* Section Header Component Style (Small & Uniform Design) */}
        {/* 1. Features Launchpad Grid */}
        <div>
          <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 700, margin: 0, letterSpacing: '-0.01em', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                🚀 <span>Virtual Gyans</span> <span className="text-gradient">Features</span>
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0' }}>
                All-in-one developer workspace for coding, learning, prep, and job applications.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {launchpadFeatures.map(feat => (
              <div 
                key={feat.id} 
                className="glass-card" 
                onClick={feat.action}
                style={{ 
                  cursor: 'pointer', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  padding: '1.2rem',
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '14px',
                  transition: 'all 0.2s ease'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '10px', 
                      background: 'rgba(255,255,255,0.04)', 
                      border: '1px solid var(--border-glass)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: '1.3rem' 
                    }}>
                      {feat.icon}
                    </div>
                    <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: feat.color, border: `1px solid ${feat.color}40`, fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>
                      {feat.badge}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', margin: '0 0 0.3rem', fontWeight: 700 }}>
                    {feat.title}
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                    {feat.desc}
                  </p>
                </div>

                <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', color: feat.color, fontWeight: 600 }}>
                  <span>Launch Tool</span>
                  <span>→</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Step-by-Step Placement Roadmap Timeline */}
        <div>
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 700, margin: 0, letterSpacing: '-0.01em', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              🗺️ <span>Career Placement</span> <span className="text-gradient">Step-by-Step Roadmap</span>
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0' }}>
              Follow this visual timeline to prepare, build, apply, and land your software job.
            </p>
          </div>

          {/* Visually Amazing Timeline Layout */}
          <div style={{ position: 'relative', paddingLeft: '1rem' }}>
            {/* Timeline Line Connector */}
            <div style={{ 
              position: 'absolute', 
              top: '20px', 
              bottom: '20px', 
              left: '27px', 
              width: '2px', 
              background: 'linear-gradient(180deg, #38bdf8, #8b5cf6, #ec4899, #10b981)', 
              opacity: 0.6 
            }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {placementTimelineSteps.map((s, idx) => (
                <div key={idx} style={{ position: 'relative', display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                  
                  {/* Step Circular Badge Indicator */}
                  <div style={{ 
                    width: '36px', 
                    height: '36px', 
                    borderRadius: '50%', 
                    background: 'var(--bg-dark, #070a13)', 
                    border: `2px solid ${s.color}`, 
                    color: s.color, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '0.8rem', 
                    fontWeight: 800, 
                    flexShrink: 0, 
                    zIndex: 2,
                    boxShadow: `0 0 12px ${s.color}40`
                  }}>
                    {s.step}
                  </div>

                  {/* Step Card Content */}
                  <div 
                    className="glass-card" 
                    onClick={s.action}
                    style={{ 
                      flex: 1, 
                      padding: '1.1rem 1.35rem', 
                      borderRadius: '14px', 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ flex: '1 1 300px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.35rem' }}>
                        <span style={{ fontSize: '1.1rem' }}>{s.icon}</span>
                        <span className="badge" style={{ background: `${s.color}15`, color: s.color, border: `1px solid ${s.color}35`, fontSize: '0.68rem', padding: '0.1rem 0.45rem' }}>
                          {s.tag}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '0.98rem', color: 'var(--text-primary)', margin: '0 0 0.2rem', fontWeight: 700 }}>
                        {s.title}
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                        {s.desc}
                      </p>
                    </div>

                    <button 
                      className="btn btn-secondary" 
                      onClick={(e) => { e.stopPropagation(); s.action(); }} 
                      style={{ padding: '0.35rem 0.85rem', fontSize: '0.78rem', flexShrink: 0, borderColor: `${s.color}40`, color: s.color }}
                    >
                      {s.actionText} →
                    </button>
                  </div>

                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Featured Videos Preview */}
        {videos.length > 0 && (
          <div>
            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 700, margin: 0, letterSpacing: '-0.01em', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  🎥 <span>Featured</span> <span className="text-gradient">Video Lessons</span>
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0' }}>
                  Hand-picked video tutorials directly from @virtualgyans.
                </p>
              </div>
              <button className="btn btn-secondary" onClick={() => setActiveTab('videos')} style={{ padding: '0.3rem 0.85rem', fontSize: '0.78rem' }}>
                View All Videos →
              </button>
            </div>
            
            <div className="grid-container">
              {videos.slice(0, 4).map((video) => (
                <div 
                  key={video.id} 
                  className="glass-card video-card"
                  onClick={() => setActiveTab('videos')}
                  style={{ borderRadius: '14px' }}
                >
                  <div className="video-thumb-container">
                    <img 
                      src={video.thumbnailUrl || `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`} 
                      alt={video.title} 
                      className="video-thumb" 
                    />
                  </div>
                  <div className="video-body" style={{ padding: '0.85rem' }}>
                    <h4 className="video-title" style={{ fontSize: '0.88rem', height: 'auto', marginBottom: '0.35rem', fontWeight: 600 }}>{video.title}</h4>
                    <p className="video-desc" style={{ fontSize: '0.78rem', WebkitLineClamp: 2 }}>{video.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Recommended Study Blueprints Section (Per user contents) */}
        <div>
          <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 700, margin: 0, letterSpacing: '-0.01em', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                📚 <span>Recommended Study</span> <span className="text-gradient">Blueprints</span>
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0' }}>
                Company hiring blueprints, syllabus breakdowns, and preparation roadmaps.
              </p>
            </div>
            <button className="btn btn-secondary" onClick={() => setActiveTab('guides')} style={{ padding: '0.3rem 0.85rem', fontSize: '0.78rem' }}>
              View All Blueprints →
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {(resources && resources.length > 0 ? resources.slice(0, 4) : [
              { id: 'res-tcs', company: 'TCS NQT', title: 'TCS NQT Complete Prep Guide 2026', description: 'Detailed syllabus for Numerical, Verbal, Reasoning, and Coding rounds.' },
              { id: 'res-cog', company: 'Cognizant', title: 'Cognizant GenC & GenC Elevate Blueprint', description: 'Communication test, Automata Fix coding, and technical round tips.' },
              { id: 'res-acc', company: 'Accenture', title: 'Accenture Campus Hiring Pattern', description: 'Cognitive & Technical MCQ breakdown with pseudo-code strategies.' },
              { id: 'res-sde', company: 'SDE Roadmap', title: 'Full-Stack SDE Career Blueprint', description: 'Step-by-step roadmap from Data Structures to System Design & React.' }
            ]).map((res) => (
              <div 
                key={res.id} 
                className="glass-card" 
                onClick={() => setActiveTab('guides')}
                style={{ 
                  padding: '1.1rem 1.25rem', 
                  borderRadius: '14px', 
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span className="badge badge-primary" style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem' }}>
                      {res.company || 'Tech Blueprint'}
                    </span>
                  </div>
                  <h4 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', margin: '0 0 0.35rem', fontWeight: 700 }}>
                    {res.title}
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0, lineHeight: 1.5 }}>
                    {res.description}
                  </p>
                </div>
                <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>
                  <span>Access Blueprint</span>
                  <span>→</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Real Interview Logs / Experiences Section (Placing directly BELOW Study Blueprints) */}
        <div>
          <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 700, margin: 0, letterSpacing: '-0.01em', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                🧑‍💼 <span>Real Interview Logs</span> <span className="text-gradient">&amp; Experiences</span>
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0' }}>
                Authentic round-by-round interview experiences shared by selected candidates.
              </p>
            </div>
            <button className="btn btn-secondary" onClick={() => setActiveTab('guides')} style={{ padding: '0.3rem 0.85rem', fontSize: '0.78rem' }}>
              Read All Logs →
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
            {(experiences && experiences.length > 0 ? experiences.slice(0, 3) : [
              { id: 'exp-1', company: 'TCS Digital', role: 'System Engineer', candidate: 'Rahul S.', date: '2026', tips: 'Focused heavily on Data Structures, Binary Search Trees, and SQL JOIN queries in Round 2.' },
              { id: 'exp-2', company: 'Accenture', role: 'Advanced Application Engineering Analyst', candidate: 'Priya M.', date: '2026', tips: 'Communication assessment requires clear pronunciation. Pseudocode questions covered loops & recursion.' },
              { id: 'exp-3', company: 'Cognizant', role: 'GenC Elevate Developer', candidate: 'Ankit K.', date: '2026', tips: 'Automata Fix coding had 2 debugging questions in C++. Technical interview asked OOPs principles & Project demo.' }
            ]).map((exp, idx) => (
              <div 
                key={exp.id || idx} 
                className="glass-card" 
                onClick={() => setActiveTab('guides')}
                style={{ 
                  padding: '1.1rem 1.25rem', 
                  borderRadius: '14px', 
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  background: 'rgba(255, 255, 255, 0.03)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span className="badge badge-secondary" style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem' }}>
                      {exp.company || 'Interview Log'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {exp.date}
                    </span>
                  </div>
                  <h4 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', margin: '0 0 0.2rem', fontWeight: 700 }}>
                    {exp.role}
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', margin: '0 0 0.65rem', opacity: 0.85 }}>
                    Shared by {exp.candidate}
                  </p>
                  <div style={{ fontSize: '0.8rem', background: 'rgba(0, 0, 0, 0.2)', padding: '0.65rem 0.85rem', borderRadius: '8px', color: 'var(--text-secondary)', border: '1px solid var(--border-glass)', lineHeight: 1.5, fontStyle: 'italic' }}>
                    "{exp.tips ? exp.tips.substring(0, 110) : 'Technical interview experience report'}..."
                  </div>
                </div>

                <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'var(--secondary, #8b5cf6)', fontWeight: 600 }}>
                  <span>Read Full Experience</span>
                  <span>→</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
