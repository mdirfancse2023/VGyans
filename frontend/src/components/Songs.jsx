import React, { useState, useEffect, useMemo } from 'react';

export default function Songs({
  songs,
  setSongs,
  currentSong,
  isPlaying,
  playSong,
  togglePlay,
  nextSong,
  prevSong,
  volume,
  setVolume,
  currentTime,
  duration,
  seek,
  playbackMode,
  setPlaybackMode
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [activePreset, setActivePreset] = useState(null);
  const [trackProgress, setTrackProgress] = useState(0);

  useEffect(() => {
    if (currentTime && currentTime > 0) {
      setTrackProgress(currentTime);
    }
  }, [currentTime, currentSong]);

  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setTrackProgress(prev => {
          const maxDur = duration || currentSong?.duration || 240;
          if (prev >= maxDur) {
            if (nextSong) nextSong();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, duration, currentSong, nextSong]);

  // Quick Preset Categories
  const presets = [
    { id: 'bollywood', label: '🔥 Top 50 Bollywood', term: 'bollywood', description: 'Top 50 full-length trending Bollywood & Hindi songs' },
    { id: 'hollywood', label: '⭐ Top 50 Hollywood', term: 'pop', description: 'Top 50 full-length international Hollywood & Billboard pop hits' },
    { id: 'lofi', label: '🎧 Lo-Fi Focus', term: 'lofi', description: 'Relaxing full-length lo-fi & chillhop beats for study & coding' },
    { id: 'piano', label: '🎹 Piano & Classical', term: 'piano', description: 'Calm acoustic & classical piano melodies for high memory retention' },
    { id: 'synthwave', label: '🌌 Ambient & Synthwave', term: 'synthwave', description: 'Immersive chillwave & ambient tracks for late-night sessions' },
    { id: 'acoustic', label: '🎸 Unplugged Acoustic', term: 'acoustic', description: 'Soft acoustic guitar & soothing instrumental chill tracks' }
  ];

  // Fetch real-time YouTube songs directly using YouTube Data API v3
  const handleFetchSongs = async (presetObj, customSearch = '') => {
    setIsLoading(true);
    setErrorMsg(null);

    let queryTerm = '';
    let displayLabel = '';

    if (customSearch.trim()) {
      queryTerm = `${customSearch.trim()} song audio`;
      displayLabel = `"${customSearch.trim()}"`;
      setActivePreset(null);
    } else if (presetObj) {
      if (presetObj.id === 'bollywood') queryTerm = 'bollywood official audio song';
      else if (presetObj.id === 'hollywood') queryTerm = 'hollywood pop official audio song';
      else if (presetObj.id === 'lofi') queryTerm = 'lofi beats song audio';
      else if (presetObj.id === 'piano') queryTerm = 'piano classical song audio';
      else if (presetObj.id === 'synthwave') queryTerm = 'synthwave ambient track audio';
      else if (presetObj.id === 'acoustic') queryTerm = 'unplugged acoustic guitar song';
      else queryTerm = `${presetObj.term || 'music'} song audio`;

      displayLabel = presetObj.label.replace(/^[^\w\s]+\s*/, '');
      setActivePreset(presetObj.id);
    } else {
      queryTerm = 'bollywood official audio song';
      displayLabel = 'Top 50 Bollywood';
    }

    setLoadingText(`Fetching YouTube music tracks for ${displayLabel}...`);

    try {
      const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY || 'AIzaSyBNZPnkq1QEJkNMM5PPyFSitVZqZ0lPxGo';
      let tracks = [];

      // Direct YouTube Data API v3 fetch targeting individual song tracks
      const ytUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=50&type=video&videoDuration=short&videoCategoryId=10&q=${encodeURIComponent(queryTerm)}&key=${apiKey}`;
      const res = await fetch(ytUrl);
      if (res.ok) {
        const data = await res.json();
        const items = data.items || [];
        
        const decodeHTML = (str) => {
          const txt = document.createElement('textarea');
          txt.innerHTML = str || '';
          return txt.value;
        };

        const excludeKeywords = ['jukebox', 'compilation', 'podcast', 'full album', 'non stop', '3 hours', '10 hours', 'shorts', 'full movie'];

        tracks = items
          .filter(item => {
            if (!item.id || !item.id.videoId) return false;
            const t = (item.snippet?.title || '').toLowerCase();
            return !excludeKeywords.some(kw => t.includes(kw));
          })
          .map((item) => {
            const vid = item.id.videoId;
            const snippet = item.snippet || {};
            const title = decodeHTML(snippet.title);
            const artist = decodeHTML(snippet.channelTitle || 'YouTube Music');
            const cover = snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`;
            const categoryLabel = presetObj ? presetObj.label.replace(/^[^\w\s]+\s*/, '') : (customSearch ? 'Search Result' : 'YouTube Music');

            return {
              id: `yt-${vid}`,
              videoId: vid,
              title: title,
              artist: artist,
              album: categoryLabel,
              category: categoryLabel,
              coverUrl: cover,
              url: `https://www.youtube.com/embed/${vid}?autoplay=1&enablejsapi=1`,
              videoUrl: `https://www.youtube.com/watch?v=${vid}`,
              embedUrl: `https://www.youtube.com/embed/${vid}?autoplay=1&enablejsapi=1`,
              duration: 240
            };
          });
      } else {
        // Fallback to backend /api/songs
        const API_URL = import.meta.env.VITE_API_URL || (
          typeof window !== 'undefined' && window.location.hostname === 'localhost' 
            ? 'http://localhost:8000' 
            : 'https://v-gyans.vercel.app'
        );
        const backendUrl = `${API_URL}/api/songs?query=${encodeURIComponent(queryTerm)}&max_results=50`;
        const bRes = await fetch(backendUrl);
        if (bRes.ok) {
          tracks = await bRes.json();
        }
      }

      if (!tracks || tracks.length === 0) {
        setErrorMsg(`No YouTube songs found for "${queryTerm}". Try another search!`);
      } else {
        if (setSongs) {
          setSongs(tracks);
        }
        setSelectedCategory('All');
      }
    } catch (err) {
      console.error('YouTube song fetch error:', err);
      setErrorMsg('Could not fetch YouTube songs. Please check your network connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Categories derived from loaded songs
  const categories = useMemo(() => {
    if (!songs || songs.length === 0) return ['All'];
    const cats = new Set(songs.map(s => s.category));
    return ['All', ...Array.from(cats)];
  }, [songs]);

  // Filter songs based on search and category within fetched list
  const filteredSongs = useMemo(() => {
    if (!songs) return [];
    return songs.filter(song => {
      const matchesSearch = song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            song.artist.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || song.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [songs, searchQuery, selectedCategory]);

  // Format time (seconds -> MM:SS)
  const formatTime = (secs) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const currentProgressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div 
      className="songs-dashboard" 
      style={{ 
        width: '100%', 
        margin: '0', 
        padding: '0.2rem 0.5rem 1rem', 
        height: 'calc(100vh - 66px)', 
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      
      {/* Compact Top Action Bar: Category Pills + Search Box */}
      <div className="glass-panel" style={{ padding: '0.75rem 1.25rem', marginBottom: '0.5rem', borderRadius: '14px', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          
          {/* Quick Category Action Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {presets.map((p) => {
              const isActive = activePreset === p.id && songs.length > 0;
              return (
                <button
                  key={p.id}
                  onClick={() => handleFetchSongs(p)}
                  disabled={isLoading}
                  style={{
                    padding: '0.4rem 0.9rem',
                    fontSize: '0.8rem',
                    borderRadius: '20px',
                    border: isActive ? '1px solid var(--primary)' : '1px solid var(--border-glass)',
                    background: isActive ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    color: isActive ? 'var(--primary)' : 'var(--text-primary)',
                    cursor: isLoading ? 'wait' : 'pointer',
                    fontWeight: isActive ? 600 : 400,
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                  className="preset-btn"
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                handleFetchSongs(null, searchQuery);
              }
            }}
            style={{ display: 'flex', gap: '0.5rem', flexGrow: 1, maxWidth: '380px' }}
          >
            <div style={{ position: 'relative', flexGrow: 1 }}>
              <input
                type="text"
                placeholder="Search artist, song, or genre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.9rem 0.5rem 2.2rem',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.82rem',
                  outline: 'none'
                }}
              />
              <span style={{ position: 'absolute', left: '0.7rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>🔍</span>
            </div>
            <button
              type="submit"
              disabled={isLoading || !searchQuery.trim()}
              className="btn btn-primary"
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.8rem',
                borderRadius: '8px',
                whiteSpace: 'nowrap',
                opacity: (isLoading || !searchQuery.trim()) ? 0.6 : 1,
                cursor: (isLoading || !searchQuery.trim()) ? 'not-allowed' : 'pointer'
              }}
            >
              Fetch Live
            </button>
          </form>

        </div>
      </div>

      {/* Main Content Area (Fills remaining height without outer page scrolling) */}
      {isLoading ? (
        /* Spinner & Loading State */
        <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, borderRadius: '16px' }}>
          <div className="realtime-spinner" style={{ position: 'relative', width: '56px', height: '56px', marginBottom: '1.25rem' }}>
            <div style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: '3px solid rgba(6, 182, 212, 0.15)',
              borderTopColor: 'var(--primary)',
              animation: 'spin 0.9s linear infinite'
            }}></div>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '1.3rem'
            }}>🎵</div>
          </div>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', margin: '0 0 0.4rem 0' }}>{loadingText}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '400px', margin: 0 }}>
            Connecting to full-length audio stream. Please wait...
          </p>

          {/* Equalizer animation */}
          <div style={{ display: 'flex', gap: '4px', height: '18px', marginTop: '1.25rem' }}>
            <span className="wave-bar bar-1"></span>
            <span className="wave-bar bar-2"></span>
            <span className="wave-bar bar-3"></span>
            <span className="wave-bar bar-1"></span>
            <span className="wave-bar bar-2"></span>
          </div>
        </div>
      ) : errorMsg ? (
        /* Error State */
        <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center', flexGrow: 1, borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⚠️</div>
          <h3 style={{ color: '#ef4444', fontSize: '1.1rem', margin: '0 0 0.5rem 0' }}>Fetch Failed</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0 0 1.5rem 0' }}>{errorMsg}</p>
          <button
            onClick={() => handleFetchSongs(presets[0])}
            className="btn btn-primary"
            style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
          >
            Try Top 50 Bollywood
          </button>
        </div>
      ) : !songs || songs.length === 0 ? (
        /* Initial Empty State: Prompt User to Select a Category to Fetch Real-time Songs */
        <div className="glass-panel" style={{ padding: '2.5rem 2rem', textAlign: 'center', borderRadius: '16px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', overflowY: 'auto' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎧</div>
          <h3 style={{ fontSize: '1.3rem', color: 'var(--text-primary)', margin: '0 0 0.4rem 0' }}>
            Fetch Full-Length Live Music
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: '500px', margin: '0 auto 1.5rem', lineHeight: 1.5 }}>
            Click any study category above or below to stream full-length music live on demand with zero limits.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
            {presets.map((p) => (
              <div
                key={p.id}
                onClick={() => handleFetchSongs(p)}
                className="category-card"
                style={{
                  padding: '1rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'transform 0.2s ease, border-color 0.2s ease, background 0.2s ease'
                }}
              >
                <h4 style={{ margin: '0 0 0.3rem 0', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  {p.label}
                </h4>
                <p style={{ margin: '0 0 0.6rem 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {p.description}
                </p>
                <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  Fetch Full Songs →
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Loaded Songs View (Strict Grid fitting Viewport Height) */
        <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 0.55fr', gap: '1.25rem', flexGrow: 1, overflow: 'hidden' }}>
          
          {/* Left Panel: Real-time Track List */}
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box', overflow: 'hidden', borderRadius: '16px' }}>
              
              {/* Category Filter Pills & Counter */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem', flexShrink: 0 }}>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  Showing <strong style={{ color: 'var(--primary)' }}>{filteredSongs.length}</strong> full-length tracks
                </div>

                {/* Category Pills */}
                {categories.length > 2 && (
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
                        style={{
                          padding: '0.25rem 0.7rem',
                          fontSize: '0.72rem',
                          borderRadius: '20px',
                          background: selectedCategory === cat ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                          borderColor: selectedCategory === cat ? 'var(--primary)' : 'var(--border-glass)'
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Table Header */}
              <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 185px 50px', padding: '0.4rem 0.75rem', color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)', letterSpacing: '0.05em', textTransform: 'uppercase', flexShrink: 0, gap: '0.6rem' }}>
                <span>#</span>
                <span>Title & Artist</span>
                <span>Category</span>
                <span style={{ textAlign: 'right' }}>Length</span>
              </div>

              {/* Table Body (Scrolls internally) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', overflowY: 'auto', flexGrow: 1, paddingRight: '0.25rem', marginTop: '0.25rem' }}>
                {filteredSongs.map((song, index) => {
                  const isCurrent = currentSong && currentSong.id === song.id;
                  return (
                    <div
                      key={song.id}
                      onClick={() => playSong(song)}
                      className={`song-row-item ${isCurrent ? 'active' : ''}`}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '28px 1fr 185px 50px',
                        padding: '0.55rem 0.75rem',
                        alignItems: 'center',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'background 0.2s ease',
                        background: isCurrent ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
                        border: isCurrent ? '1px solid rgba(6, 182, 212, 0.25)' : '1px solid transparent',
                        gap: '0.6rem'
                      }}
                    >
                      {/* Play Icon / Number */}
                      <div style={{ color: isCurrent ? 'var(--primary)' : 'var(--text-muted)', fontSize: '0.82rem' }}>
                        {isCurrent && isPlaying ? (
                          <div className="soundwave-container" style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '12px', width: '12px' }}>
                            <span className="wave-bar bar-1"></span>
                            <span className="wave-bar bar-2"></span>
                            <span className="wave-bar bar-3"></span>
                          </div>
                        ) : isCurrent ? (
                          '▶'
                        ) : (
                          index + 1
                        )}
                      </div>

                      {/* Cover & Title */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', overflow: 'hidden' }}>
                        <img
                          src={song.coverUrl}
                          alt={song.title}
                          style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }}
                          loading="lazy"
                        />
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <h4 style={{ color: isCurrent ? 'var(--primary)' : 'var(--text-primary)', fontSize: '0.88rem', fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {song.title}
                          </h4>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: '0.1rem 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {song.artist}
                          </p>
                        </div>
                      </div>

                      {/* Category Badge */}
                      <div style={{ overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
                        <span className="badge badge-secondary" style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem', whiteSpace: 'nowrap', border: '1px solid var(--border-glass)', borderRadius: '12px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {song.category}
                        </span>
                      </div>

                      {/* Duration */}
                      <div style={{ textAlign: 'right', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        {formatTime(song.duration)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Panel: Playback & YouTube Player / Vinyl Visualizer */}
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', height: '100%', boxSizing: 'border-box', justifyContent: 'center', overflowY: 'auto', borderRadius: '16px' }}>
              {currentSong ? (
                <>
                  {/* Off-screen YouTube Audio Streamer */}
                  <iframe
                    src={isPlaying ? (currentSong.embedUrl || `https://www.youtube.com/embed/${currentSong.videoId || currentSong.id.replace('yt-', '')}?autoplay=1&enablejsapi=1`) : ''}
                    title={currentSong.title}
                    allow="autoplay; encrypted-media"
                    style={{ position: 'absolute', width: '1px', height: '1px', opacity: 0, pointerEvents: 'none' }}
                  ></iframe>

                  {/* Vinyl Record View */}
                  <div style={{ position: 'relative', width: '160px', height: '160px', marginBottom: '1.2rem', marginTop: '0.5rem' }}>
                    <div
                      className={`vinyl-wrapper ${isPlaying ? 'spinning' : ''}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        boxShadow: isPlaying 
                          ? '0 0 30px 0 rgba(6, 182, 212, 0.4), 0 0 6px 1px rgba(255,255,255,0.1)' 
                          : '0 8px 24px rgba(0,0,0,0.5)',
                        border: '5px solid var(--bg-dark-secondary)',
                        transition: 'box-shadow var(--transition-normal)'
                      }}
                    >
                      <img
                        src={currentSong.coverUrl}
                        alt={currentSong.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      {/* Vinyl Center Hole */}
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '26px', height: '26px', borderRadius: '50%', background: 'var(--bg-dark)', border: '3px solid var(--border-glass)' }}></div>
                    </div>
                  </div>

                  {/* Song Meta */}
                  <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', margin: '0 0 0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                    {currentSong.title}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '0 0 1rem' }}>
                    {currentSong.artist}
                  </p>

                  {/* Progress Bar & Interactive Seek Slider */}
                  <div style={{ width: '100%', marginBottom: '1rem', padding: '0 0.5rem', boxSizing: 'border-box' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 500 }}>
                      <span>{formatTime(trackProgress)}</span>
                      <span>{formatTime(duration || currentSong.duration || 240)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={duration || currentSong.duration || 240}
                      value={trackProgress}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setTrackProgress(val);
                        if (seek) seek(val);
                      }}
                      style={{
                        width: '100%',
                        height: '5px',
                        borderRadius: '5px',
                        accentColor: 'var(--primary)',
                        background: `linear-gradient(to right, var(--primary) ${(trackProgress / (duration || currentSong.duration || 240)) * 100}%, rgba(255, 255, 255, 0.1) 0%)`,
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    />
                  </div>

                  {/* Player Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.1rem', marginBottom: '1rem' }}>
                    <button
                      onClick={() => setPlaybackMode(playbackMode === 'shuffle' ? 'normal' : 'shuffle')}
                      className="control-btn"
                      title="Shuffle"
                      style={{ background: 'transparent', border: 'none', color: playbackMode === 'shuffle' ? 'var(--primary)' : 'var(--text-muted)', fontSize: '1rem', cursor: 'pointer' }}
                    >
                      🔀
                    </button>

                    <button
                      onClick={prevSong}
                      className="control-btn"
                      title="Previous Track"
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '1.35rem', cursor: 'pointer' }}
                    >
                      ⏮
                    </button>

                    <button
                      onClick={togglePlay}
                      style={{
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        border: 'none',
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        color: '#fff',
                        fontSize: '1.1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(6, 182, 212, 0.4)'
                      }}
                      className="btn-play-pause"
                    >
                      {isPlaying ? '⏸' : '▶'}
                    </button>

                    <button
                      onClick={nextSong}
                      className="control-btn"
                      title="Next Track"
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '1.35rem', cursor: 'pointer' }}
                    >
                      ⏭
                    </button>

                    <button
                      onClick={() => setPlaybackMode(playbackMode === 'loop' ? 'normal' : 'loop')}
                      className="control-btn"
                      title="Repeat Track"
                      style={{ background: 'transparent', border: 'none', color: playbackMode === 'loop' ? 'var(--primary)' : 'var(--text-muted)', fontSize: '1.1rem', cursor: 'pointer' }}
                    >
                      🔁
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ padding: '1.5rem 0', color: 'var(--text-secondary)' }}>
                  <div style={{ fontSize: '2.2rem', marginBottom: '0.5rem', opacity: 0.5 }}>🎵</div>
                  <p style={{ fontWeight: 500, margin: 0, fontSize: '0.9rem' }}>No song selected</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Click any track on the left to start streaming real YouTube music.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Embedded CSS Animations/Styles */}
      <style>{`
        .preset-btn:hover {
          background: rgba(6, 182, 212, 0.1) !important;
          border-color: var(--primary) !important;
        }

        .category-card:hover {
          transform: translateY(-3px);
          border-color: var(--primary) !important;
          background: rgba(6, 182, 212, 0.04) !important;
        }

        .song-row-item:hover {
          background: rgba(255, 255, 255, 0.04) !important;
        }
        
        .song-row-item.active {
          background: rgba(6, 182, 212, 0.1) !important;
        }

        .vinyl-wrapper.spinning {
          animation: spinRecord 20s linear infinite;
        }

        @keyframes spinRecord {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .btn-play-pause:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(6, 182, 212, 0.6);
        }

        .btn-play-pause:active {
          transform: scale(0.95);
        }

        .wave-bar {
          display: inline-block;
          width: 3px;
          height: 100%;
          background-color: var(--primary);
          border-radius: 1px;
          animation: bounceWave 0.8s ease-in-out infinite alternate;
        }
        .bar-1 { animation-delay: 0.1s; height: 30%; }
        .bar-2 { animation-delay: 0.4s; height: 80%; }
        .bar-3 { animation-delay: 0.2s; height: 50%; }

        @keyframes bounceWave {
          0% { height: 20%; }
          100% { height: 100%; }
        }
      `}</style>
    </div>
  );
}
