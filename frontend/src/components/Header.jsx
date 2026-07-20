import React from 'react';
import logoImg from '../assets/logo.png';

export default function Header({ activeTab, setActiveTab, theme, toggleTheme, onOpenFeedback }) {
  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'guides', label: 'Placement' },
    { id: 'tools', label: 'Resume' },
    { id: 'experiences', label: 'Interviews' },
    { id: 'playground', label: 'Code' },
    { id: 'videos', label: 'Videos' },
    { id: 'jobs', label: 'Jobs' },
    { id: 'songs', label: 'Music 🎵' }
  ];

  return (
    <nav className="navbar">
      <div className="nav-container">
        <a href="#home" className="logo" onClick={() => setActiveTab('home')}>
          <img 
            src="/logo.png" 
            alt="Virtual Gyans Logo" 
            style={{ width: '26px', height: '26px', objectFit: 'contain' }} 
            loading="eager"
            fetchpriority="high"
            decoding="sync"
          />
          Virtual Gyans
        </a>
        
        <ul className="nav-links" style={{ alignItems: 'center' }}>
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
        </ul>
      </div>
    </nav>
  );
}
