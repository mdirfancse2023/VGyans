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
      desc: 'Interactive online editor supporting Python, Java, C++, and SQL with instant execution & test cases.',
      badge: 'Interactive IDE',
      color: '#38bdf8',
      action: () => setActiveTab('playground')
    },
    {
      id: 'jobs',
      icon: '💼',
      title: 'IT Jobs & Opportunities',
      desc: 'Search active developer jobs and software engineering roles aggregated across top tech portals.',
      badge: 'Live Listings',
      color: '#10b981',
      action: () => setActiveTab('jobs')
    },
    {
      id: 'tools',
      icon: '📄',
      title: 'Resume Builder & AI Analyzer',
      desc: 'Create ATS-optimized tech resumes and analyze your resume against job descriptions using AI.',
      badge: 'ATS Resume Tools',
      color: '#8b5cf6',
      action: () => setActiveTab('tools')
    },
    {
      id: 'guides',
      icon: '🎓',
      title: 'Placement Prep & Resources',
      desc: 'Company interview blueprints, study materials, tech flashcards, and real interview experiences.',
      badge: 'Prep Hub',
      color: '#f59e0b',
      action: () => setActiveTab('guides')
    },
    {
      id: 'news',
      icon: '📰',
      title: 'Tech News & Insights',
      desc: 'Stay updated with live developer news, AI breakthroughs, frameworks, and industry trends.',
      badge: 'Live Feed',
      color: '#ec4899',
      action: () => setActiveTab('news')
    },
    {
      id: 'songs',
      icon: '🎵',
      title: 'Focus Music & Ambient Player',
      desc: 'Lofi beats, ambient soundscapes, and binaural audio designed to boost deep focus and coding flow.',
      badge: 'Audio Player',
      color: '#06b6d4',
      action: () => setActiveTab('songs')
    }
  ];

  return (
    <div>
      {/* Top Hero Banner */}
      <Hero stats={channelStats} setActiveTab={setActiveTab} />

      {/* Main Home Launchpad Container */}
      <div style={{ maxWidth: '1400px', margin: '0 auto 4rem', padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        
        {/* Section 1: Platform Launchpad Hub */}
        <div>
          <div className="section-header" style={{ marginBottom: '1.25rem' }}>
            <div>
              <h2 className="section-title">
                Explore <span className="text-gradient">Virtual Gyans Features</span>
              </h2>
              <p className="section-desc">
                Everything you need for learning, coding, interview preparation, and career growth.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
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
                  padding: '1.5rem',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ 
                      width: '46px', 
                      height: '46px', 
                      borderRadius: '12px', 
                      background: 'rgba(255,255,255,0.04)', 
                      border: '1px solid var(--border-glass)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: '1.5rem' 
                    }}>
                      {feat.icon}
                    </div>
                    <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: feat.color, border: `1px solid ${feat.color}40`, fontSize: '0.72rem' }}>
                      {feat.badge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', margin: '0 0 0.4rem', fontWeight: 700 }}>
                    {feat.title}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.55 }}>
                    {feat.desc}
                  </p>
                </div>

                <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: feat.color, fontWeight: 600 }}>
                  <span>Launch Tool</span>
                  <span>→</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Featured Video Tutorials */}
        {videos.length > 0 && (
          <div>
            <div className="section-header" style={{ marginBottom: '1.25rem' }}>
              <div>
                <h2 className="section-title">
                  Featured <span className="text-gradient">Video Tutorials</span>
                </h2>
                <p className="section-desc">
                  Curated video lessons directly from @virtualgyans YouTube channel.
                </p>
              </div>
              <button className="btn btn-secondary" onClick={() => setActiveTab('videos')} style={{ padding: '0.35rem 1rem', fontSize: '0.82rem' }}>
                View All Videos →
              </button>
            </div>
            
            <div className="grid-container">
              {videos.slice(0, 4).map((video) => (
                <div 
                  key={video.id} 
                  className="glass-card video-card"
                  onClick={() => setActiveTab('videos')}
                >
                  <div className="video-thumb-container">
                    <img 
                      src={video.thumbnailUrl || `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`} 
                      alt={video.title} 
                      className="video-thumb" 
                    />
                  </div>
                  <div className="video-body">
                    <h3 className="video-title" style={{ height: 'auto', marginBottom: '0.5rem' }}>{video.title}</h3>
                    <p className="video-desc" style={{ WebkitLineClamp: 2 }}>{video.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 3: Recommended Blueprints & Featured Interview Experience */}
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
            
            {/* Recommended Blueprints */}
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                📚 Recommended Study Blueprints
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {resources.slice(0, 2).map((res) => (
                  <div key={res.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem' }}>
                    <div>
                      <span className="badge badge-primary" style={{ marginBottom: '0.35rem', fontSize: '0.7rem' }}>{res.company}</span>
                      <h4 style={{ color: 'var(--text-primary)', fontSize: '1rem', margin: '0 0 0.2rem' }}>{res.title}</h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: 0 }}>{res.description}</p>
                    </div>
                    <button className="btn btn-secondary" onClick={() => setActiveTab('guides')} style={{ padding: '0.35rem 0.85rem', fontSize: '0.78rem', flexShrink: 0, marginLeft: '1rem' }}>
                      Access
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured Interview Log Card */}
            <div className="glass-card" style={{ background: 'var(--primary-glow)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.25rem' }}>
              <div>
                <span className="badge badge-secondary" style={{ width: 'fit-content', marginBottom: '0.75rem', fontSize: '0.72rem' }}>
                  ⭐ Real Interview Log
                </span>
                {experiences[0] ? (
                  <>
                    <h4 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', margin: '0 0 0.25rem' }}>{experiences[0].role}</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '0 0 0.85rem' }}>
                      Shared by {experiences[0].candidate} ({experiences[0].date})
                    </p>
                    <div style={{ fontSize: '0.82rem', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px', color: 'var(--text-secondary)', border: '1px solid var(--border-glass)', fontStyle: 'italic', lineHeight: 1.5 }}>
                      "{experiences[0].tips.substring(0, 110)}..."
                    </div>
                  </>
                ) : (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No interview logs loaded.</p>
                )}
              </div>

              <button className="btn btn-primary" onClick={() => setActiveTab('guides')} style={{ marginTop: '1rem', padding: '0.45rem', fontSize: '0.82rem', width: '100%' }}>
                Read Full Interview Experiences →
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
