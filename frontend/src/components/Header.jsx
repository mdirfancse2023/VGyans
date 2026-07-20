import React from 'react';
import logoImg from '../assets/logo.png';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  theme, 
  toggleTheme, 
  onOpenFeedback,
  currentSong,
  isPlaying,
  togglePlay,
  nextSong,
  prevSong,
  currentTime = 0,
  duration = 0,
  seek,
  user,
  onOpenAuth,
  onLogout
}) {
  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'guides', label: 'Placement' },
    { id: 'tools', label: 'Resume' },
    { id: 'experiences', label: 'Interviews' },
    { id: 'playground', label: 'Code' },
    { id: 'videos', label: 'Videos' },
    { id: 'jobs', label: 'Jobs' }
  ];

  const formatTime = (secs) => {
    if (isNaN(secs) || secs == null) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Left: Logo */}
        <a href="#home" className="logo" onClick={() => setActiveTab('home')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.55rem', whiteSpace: 'nowrap', flexShrink: 0, textDecoration: 'none' }}>
          <div className="theme-toggle-btn" style={{ width: '32px', height: '32px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <img 
              src="/logo.png" 
              alt="Virtual Gyans Logo" 
              style={{ width: '20px', height: '20px', objectFit: 'contain' }} 
              loading="eager"
              fetchpriority="high"
              decoding="sync"
            />
          </div>
          <span style={{ fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>Virtual Gyans</span>
        </a>
        
        {/* Middle: Navigation Text Tabs */}
        <ul className="nav-links nav-middle" style={{ alignItems: 'center' }}>
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
                style={{ background: 'transparent', border: 'none', fontInherit: 'inherit' }}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Right: Action Icon Buttons */}
        <ul className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', listStyle: 'none', margin: 0, padding: 0 }}>
          {/* Music Navbar Item with Attached Floating Hover Popover Modal */}
          <li className="header-music-trigger-item" style={{ display: 'flex', alignItems: 'center' }}>
            {currentSong && isPlaying ? (
              <div
                onClick={() => setActiveTab('songs')}
                className="theme-toggle-btn active"
                style={{
                  width: 'auto',
                  padding: '0 0.55rem',
                  height: '32px',
                  gap: '0.4rem',
                  borderRadius: '8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                  verticalAlign: 'middle'
                }}
                title={`Now Playing: ${currentSong.title} - ${currentSong.artist}`}
              >
                {/* 1. Spinning Album Cover Art Logo */}
                <img 
                  src={currentSong.coverUrl} 
                  alt={currentSong.title} 
                  style={{ 
                    width: '20px', 
                    height: '20px', 
                    borderRadius: '50%', 
                    objectFit: 'cover', 
                    animation: 'spinRecord 12s linear infinite',
                    boxShadow: '0 0 6px rgba(6, 182, 212, 0.5)',
                    flexShrink: 0
                  }}
                />

                {/* 2. Green Soundwave Equalizer Lines Animation */}
                <div className="soundwave-green" style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '12px', flexShrink: 0 }}>
                  <span className="wave-bar bar-1"></span>
                  <span className="wave-bar bar-2"></span>
                  <span className="wave-bar bar-3"></span>
                </div>

                {/* 3. Play / Pause Button */}
                <button
                  onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--primary)',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    padding: '0 2px',
                    lineHeight: 1,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? '⏸' : '▶'}
                </button>

                {/* 3. Next Track Button */}
                <button
                  onClick={(e) => { e.stopPropagation(); nextSong(); }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    padding: '0 2px',
                    lineHeight: 1,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Next Track"
                >
                  ⏭
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('songs')}
                className={`theme-toggle-btn ${activeTab === 'songs' ? 'active' : ''}`}
                title="Focus Music Player"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
              </button>
            )}

            {/* Attached Square Popover Modal (Shown ON HOVER ONLY) */}
            {currentSong && (
              <div className="header-music-popover">
                {/* Spinning Cover Art */}
                <div style={{ position: 'relative', width: '84px', height: '84px', margin: '0 auto 0.5rem' }}>
                  <img 
                    src={currentSong.coverUrl} 
                    alt={currentSong.title} 
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      borderRadius: '50%', 
                      objectFit: 'cover', 
                      animation: isPlaying ? 'spinRecord 15s linear infinite' : 'none', 
                      boxShadow: '0 4px 15px rgba(6, 182, 212, 0.4)', 
                      border: '2px solid var(--border-glass)' 
                    }}
                  />
                </div>

                {/* Song Title & Artist */}
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-primary)', margin: '0 0 0.15rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 700 }}>
                  {currentSong.title}
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0 0 0.4rem', opacity: 0.8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentSong.artist}
                </p>

                {/* Bouncing Green Soundwave Equalizer */}
                {isPlaying && (
                  <div className="soundwave-green" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '3px', height: '12px', marginBottom: '0.45rem', width: '100%' }}>
                    <span className="wave-bar bar-1"></span>
                    <span className="wave-bar bar-2"></span>
                    <span className="wave-bar bar-3"></span>
                  </div>
                )}

                {/* Live Music Progress Bar Line & Time Counters */}
                <div style={{ width: '100%', margin: '0.35rem 0 0.15rem' }}>
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickX = e.clientX - rect.left;
                      const pct = Math.max(0, Math.min(1, clickX / rect.width));
                      if (duration && seek) seek(pct * duration);
                    }}
                    style={{ 
                      width: '100%', 
                      height: '5px', 
                      background: 'rgba(255, 255, 255, 0.1)', 
                      borderRadius: '3px', 
                      cursor: 'pointer', 
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    title="Click to seek position"
                  >
                    <div 
                      style={{ 
                        width: `${duration ? (currentTime / duration) * 100 : 0}%`, 
                        height: '100%', 
                        background: 'linear-gradient(90deg, #10b981, #06b6d4)', 
                        borderRadius: '3px',
                        transition: 'width 0.1s linear'
                      }} 
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontFamily: 'monospace' }}>
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration || currentSong.duration)}</span>
                  </div>
                </div>

                {/* Playback Controls (Prev, Play/Pause, Next) */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.55rem', margin: '0.45rem 0' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); if (prevSong) prevSong(); }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid var(--border-glass)',
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Previous Track"
                  >
                    ⏮
                  </button>

                  <button
                    onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                    style={{
                      background: 'var(--primary)',
                      border: 'none',
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      color: '#fff',
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 10px rgba(6, 182, 212, 0.4)'
                    }}
                    title={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? '⏸' : '▶'}
                  </button>

                  <button
                    onClick={(e) => { e.stopPropagation(); nextSong(); }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid var(--border-glass)',
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Next Track"
                  >
                    ⏭
                  </button>
                </div>
              </div>
            )}
          </li>

          <li>
            <button
              onClick={onOpenFeedback}
              className="theme-toggle-btn"
              title="Share Feedback"
            >
              💬
            </button>
          </li>
          <li>
            <a 
              href="https://www.youtube.com/@virtualgyans" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="theme-toggle-btn"
              title="Subscribe on YouTube"
            >
              <svg 
                viewBox="0 0 24 24" 
                width="18" 
                height="18" 
              >
                <path 
                  d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.507a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.507 9.388.507 9.388.507s7.518 0 9.388-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837z" 
                  fill="#FF0000" 
                />
                <polygon 
                  points="9.545 15.568 15.818 12 9.545 8.432" 
                  fill="#FFFFFF" 
                />
              </svg>
            </a>
          </li>
          <li>
            <button 
              onClick={toggleTheme}
              className="theme-toggle-btn"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              )}
            </button>
          </li>
          {/* User Profile / Auth Item with Log Out Dropdown Card */}
          <li className="header-profile-trigger-item">
            {user ? (
              <div 
                className="theme-toggle-btn active"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  border: '1.5px solid rgba(255,255,255,0.4)',
                  boxShadow: '0 0 10px rgba(6, 182, 212, 0.4)'
                }}
                title={`Logged in as ${user.name}`}
              >
                {user.avatar || user.name.charAt(0).toUpperCase()}
                <span style={{ position: 'absolute', bottom: '0', right: '0', width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', border: '1.5px solid #070a13' }} />
              </div>
            ) : (
              <button 
                onClick={onOpenAuth}
                className="theme-toggle-btn"
                title="Log In / Sign Up"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </button>
            )}

            {/* Profile & Log Out Dropdown Card (Shown ON HOVER if user logged in) */}
            {user && (
              <div className="header-profile-popover">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', textAlign: 'left' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.1rem', flexShrink: 0 }}>
                    {user.avatar || user.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 700 }}>
                      {user.name}
                    </h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.1rem 0 0', opacity: 0.8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.email}
                    </p>
                  </div>
                </div>

                <div style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', fontSize: '0.72rem', marginBottom: '0.75rem', textAlign: 'center' }}>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>● Active Learner</span>
                </div>

                <button
                  onClick={onLogout}
                  style={{
                    width: '100%',
                    padding: '0.45rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    background: 'rgba(239, 68, 68, 0.12)',
                    color: '#f87171',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                    transition: 'all 0.2s ease'
                  }}
                  className="logout-btn"
                >
                  🚪 Log Out
                </button>
              </div>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}
