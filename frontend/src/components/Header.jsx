import React, { useState, useEffect, useRef } from 'react';
import logoImg from '../assets/logo.png';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  theme, 
  toggleTheme, 
  onOpenFeedback,
  onOpenNotes,
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
  const [weatherData, setWeatherData] = useState({
    temp: 22,
    condition: 'Partly Cloudy',
    icon: '⛅',
    city: 'Live Location',
    humidity: 58,
    windSpeed: 12,
    feelsLike: 23,
    high: 26,
    low: 18
  });

  useEffect(() => {
    const fetchWeather = async (lat = 28.6139, lon = 77.2090, cityName = 'Live Weather') => {
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m,apparent_temperature`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.current_weather) {
            const temp = Math.round(data.current_weather.temperature);
            const code = data.current_weather.weathercode;
            let icon = '☀️';
            let cond = 'Clear Sky';
            if (code >= 1 && code <= 3) { icon = '⛅'; cond = 'Partly Cloudy'; }
            else if (code >= 45 && code <= 48) { icon = '🌫️'; cond = 'Foggy'; }
            else if (code >= 51 && code <= 67) { icon = '🌧️'; cond = 'Light Rain'; }
            else if (code >= 80 && code <= 99) { icon = '🌩️'; cond = 'Thunderstorm'; }

            setWeatherData({
              temp,
              condition: cond,
              icon,
              city: cityName,
              humidity: data.hourly?.relativehumidity_2m?.[0] || 60,
              windSpeed: Math.round(data.current_weather.windspeed || 12),
              feelsLike: Math.round(data.hourly?.apparent_temperature?.[0] || temp),
              high: temp + 4,
              low: temp - 4
            });
          }
        }
      } catch (err) {
        console.log('Using default weather state:', err);
      }
    };

    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(ipData => {
        if (ipData && ipData.latitude && ipData.longitude) {
          fetchWeather(ipData.latitude, ipData.longitude, ipData.city || ipData.region || 'Local');
        } else {
          fetchWeather();
        }
      })
      .catch(() => fetchWeather());
  }, []);

  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [isNavbarCollapsed, setIsNavbarCollapsed] = useState(false);
  const [showWeatherModal, setShowWeatherModal] = useState(false);
  const weatherRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (weatherRef.current && !weatherRef.current.contains(e.target)) {
        setShowWeatherModal(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isNavbarCollapsed) {
      document.body.classList.add('navbar-is-collapsed');
    } else {
      document.body.classList.remove('navbar-is-collapsed');
    }
    return () => {
      document.body.classList.remove('navbar-is-collapsed');
    };
  }, [isNavbarCollapsed]);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'guides', label: 'Placement' },
    { id: 'tools', label: 'Resume' },
    { id: 'playground', label: 'Code' },
    { id: 'videos', label: 'Videos' },
    { id: 'jobs', label: 'Jobs' },
    { id: 'news', label: 'News' }
  ];

  const formatTime = (secs) => {
    if (isNaN(secs) || secs == null) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <>
      {/* Floating Slim Down Arrow / Profile Button when Navbar is Collapsed (Click to Show Navbar) */}
      {isNavbarCollapsed && (
        <button 
          onClick={() => setIsNavbarCollapsed(false)} 
          className="theme-toggle-btn navbar-slim-profile-btn profile-down-arrow-morph-btn"
          title="Expand / Show Navbar"
          style={{
            position: 'fixed',
            top: '12px',
            right: '18px',
            zIndex: 10000,
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'rgba(7, 10, 19, 0.85)',
            border: '1.5px solid var(--primary)',
            color: 'var(--primary)',
            fontWeight: 800,
            fontSize: '0.95rem',
            boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeInScale 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Face 1: Down Arrow Icon */}
          <div className="profile-face down-arrow-face">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>

          {/* Face 2: Profile Avatar / Initial */}
          <div className="profile-face slim-avatar-face">
            {user ? (user.avatar || user.name.charAt(0).toUpperCase()) : (
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            )}
          </div>
        </button>
      )}

      <nav className={`navbar ${isNavbarCollapsed ? 'collapsed-slim' : ''}`}>
      <div className="nav-container">
        {/* Left: Creative Logo (Logo <-> Weather Temp) & Brand Text (Virtual Gyans <-> Live Clock) */}
        <div ref={weatherRef} className="header-weather-trigger-item" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
          <a 
            href="#home" 
            className="logo creative-timer-logo-trigger" 
            onClick={(e) => {
              // If user clicks the logo icon/temp, toggle weather modal!
              setShowWeatherModal(prev => !prev);
            }} 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', whiteSpace: 'nowrap', flexShrink: 0, textDecoration: 'none', cursor: 'pointer' }}
          >
            
            {/* Logo Square Icon: Morphs smoothly between Logo Image & Real-Time Temperature (22°) */}
            <div 
              className="theme-toggle-btn logo-weather-morph-btn" 
              style={{ 
                width: '34px', 
                height: '34px', 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                background: 'rgba(255,255,255,0.03)', 
                border: '1px solid var(--border-glass)', 
                borderRadius: '10px',
                position: 'relative',
                overflow: 'hidden'
              }}
              title="Click to view weather forecast details"
            >
              <div className="logo-face logo-img-face">
                <img 
                  src="/logo.png" 
                  alt="Virtual Gyans Logo" 
                  style={{ width: '22px', height: '22px', objectFit: 'contain' }} 
                  loading="eager"
                  fetchpriority="high"
                  decoding="sync"
                />
              </div>
              <div className="logo-face logo-temp-face">
                <span>{weatherData.temp}°</span>
              </div>
            </div>
            
            {/* Brand Title Text: Morphs seamlessly between "Virtual Gyans" & Live Timer */}
            <div 
              className="creative-brand-timer-wrapper" 
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab('home');
              }}
              title={`Virtual Gyans • Clock: ${currentTimeStr}`}
            >
              <span className="brand-text-face brand-name">
                Virtual Gyans
              </span>
              <span className="brand-text-face live-clock">
                {currentTimeStr}
              </span>
            </div>
          </a>

          {/* Weather Details Popover Modal on Logo Box Click */}
          <div className={`header-weather-popover ${showWeatherModal ? 'show' : ''}`} style={{ left: '0', right: 'auto', top: 'calc(100% + 12px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                📍 {weatherData.city}
              </span>
              <span className="badge badge-primary" style={{ fontSize: '0.62rem', padding: '0.1rem 0.45rem', borderRadius: '10px' }}>Live Weather</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.65rem' }}>
              <span style={{ fontSize: '1.8rem' }}>{weatherData.icon}</span>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                  {weatherData.temp}°C
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                  {weatherData.condition}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem', fontSize: '0.72rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
              <div>🌡️ Feels: <strong style={{ color: 'var(--text-primary)' }}>{weatherData.feelsLike}°C</strong></div>
              <div>💧 Humidity: <strong style={{ color: 'var(--text-primary)' }}>{weatherData.humidity}%</strong></div>
              <div>💨 Wind: <strong style={{ color: 'var(--text-primary)' }}>{weatherData.windSpeed} km/h</strong></div>
              <div>📈 Range: <strong style={{ color: 'var(--text-primary)' }}>{weatherData.low}° - {weatherData.high}°C</strong></div>
            </div>
          </div>
        </div>
        
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
            <div
              onClick={() => setActiveTab('songs')}
              className={`theme-toggle-btn header-music-morph-btn ${currentSong && isPlaying ? 'expanded active' : ''} ${activeTab === 'songs' ? 'active' : ''}`}
              title={currentSong && isPlaying ? `Now Playing: ${currentSong.title} - ${currentSong.artist}` : 'Focus Music Player'}
              style={{ cursor: 'pointer' }}
            >
              {currentSong && isPlaying ? (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', animation: 'fadeInScale 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
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

                  {/* 4. Next Track Button */}
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
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeInScale 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                  </svg>
                </div>
              )}
            </div>
          </li>

          <li>
            <button
              onClick={onOpenFeedback}
              className="theme-toggle-btn"
              title="Share Feedback"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </button>
          </li>
          {/* 1. Theme Toggler Button */}
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

          {/* 3. YouTube Channel Button */}
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
                width="16" 
                height="16" 
              >
                <path 
                  d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.507a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.507 9.388.507 9.388.507s7.518 0 9.388-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837z" 
                  fill="currentColor" 
                />
                <polygon 
                  points="9.545 15.568 15.818 12 9.545 8.432" 
                  fill="var(--bg-dark, #070a13)" 
                />
              </svg>
            </a>
          </li>
          {/* User Profile / Auth Item with Log Out Dropdown Card (Morphs into Up Arrow on hover/flip) */}
          <li className="header-profile-trigger-item">
            <div 
              onClick={() => {
                if (!user) onOpenAuth();
                setIsNavbarCollapsed(true);
              }}
              className="theme-toggle-btn profile-arrow-morph-btn"
              style={{
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer'
              }}
              title={user ? `Logged in as ${user.name} • Click to Hide Navbar` : 'Log In / Sign Up • Click to Hide Navbar'}
            >
              {/* Face 1: User Avatar / Initial */}
              <div className="profile-face avatar-face">
                {user ? (user.avatar || user.name.charAt(0).toUpperCase()) : (
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                )}
              </div>

              {/* Face 2: Collapse Up Arrow */}
              <div className="profile-face arrow-face">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
              </div>
            </div>

            {/* Profile & Log Out Dropdown Card (Shown ON HOVER if user logged in) */}
            {user && (
              <div className="header-profile-popover">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', textAlign: 'left' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.1rem', flexShrink: 0 }}>
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
    </>
  );
}
