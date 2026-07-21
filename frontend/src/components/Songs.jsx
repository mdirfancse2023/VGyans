import React, { useState, useMemo } from 'react';

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

  // Quick Preset Categories
  const presets = [
    { id: 'bollywood', label: '🔥 Top 50 Bollywood', term: 'bollywood', description: 'Full-length trending Hindi & Bollywood songs' },
    { id: 'hollywood', label: '⭐ Top 50 Hollywood', term: 'pop', description: 'Full-length international Hollywood & Billboard pop hits' },
    { id: 'lofi', label: '🎧 Lo-Fi Focus', term: 'lofi', description: 'Relaxing full-length ambient & lo-fi study tracks' },
    { id: 'punjabi', label: '🎸 Punjabi Hits', term: 'punjabi', description: 'High-energy full-length Punjabi tracks' },
    { id: 'romantic', label: '💖 Romantic Classics', term: 'romantic', description: 'Timeless full-length love songs & melodies' }
  ];

  // Fetch real-time full-length songs from Audius API
  const handleFetchSongs = async (presetObj, customSearch = '') => {
    setIsLoading(true);
    setErrorMsg(null);

    let queryTerm = '';
    let displayLabel = '';

    if (customSearch.trim()) {
      queryTerm = customSearch.trim();
      displayLabel = `"${queryTerm}"`;
      setActivePreset(null);
    } else if (presetObj) {
      queryTerm = presetObj.term;
      displayLabel = presetObj.label.replace(/^[^\w\s]+\s*/, ''); // Strip leading emoji for display
      setActivePreset(presetObj.id);
    } else {
      queryTerm = 'bollywood';
      displayLabel = 'Top 50 Songs';
    }

    setLoadingText(`Fetching full-length real-time songs for ${displayLabel}...`);

    try {
      // Fetch full-length tracks from Audius API (returns complete stream URLs and full 3-6 min durations)
      const audiusUrl = `https://api.audius.co/v1/tracks/search?query=${encodeURIComponent(queryTerm)}&app_name=VGyans`;
      const res = await fetch(audiusUrl);
      if (!res.ok) throw new Error('Failed to fetch real-time music stream');

      const data = await res.json();
      const rawTracks = data.data || [];

      if (!rawTracks || rawTracks.length === 0) {
        setErrorMsg(`No playable full-length tracks found for "${queryTerm}". Try another search or category!`);
        setIsLoading(false);
        return;
      }

      // Filter tracks: strictly require title & duration > 45 seconds to exclude 30-sec previews
      const fullLengthTracks = rawTracks
        .filter(t => t.title && t.duration && t.duration > 45)
        .slice(0, 50)
        .map((t, index) => {
          let cover = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500';
          if (t.artwork) {
            cover = t.artwork['480x480'] || t.artwork['1000x1000'] || t.artwork['150x150'] || cover;
          }

          // Full-length stream URL via Audius API
          const streamUrl = `https://api.audius.co/v1/tracks/${t.id}/stream?app_name=VGyans`;

          return {
            id: `audius-${t.id || index}-${Date.now()}`,
            title: t.title,
            artist: (t.user && t.user.name) ? t.user.name : (t.user && t.user.handle) ? t.user.handle : 'Various Artists',
            album: t.genre || (presetObj ? presetObj.label.replace(/^[^\w\s]+\s*/, '') : 'Full Track'),
            category: presetObj ? presetObj.label.replace(/^[^\w\s]+\s*/, '') : 'Live Search',
            coverUrl: cover,
            url: streamUrl,
            duration: Math.round(t.duration) // Full track duration in seconds (e.g. 240 = 4:00)
          };
        });

      if (fullLengthTracks.length === 0) {
        setErrorMsg(`No full-length songs found for "${queryTerm}". Please try another search.`);
      } else {
        if (setSongs) {
          setSongs(fullLengthTracks);
        }
        setSelectedCategory('All');
      }
    } catch (err) {
      console.error('Real-time full song fetch error:', err);
      setErrorMsg('Could not fetch full-length real-time music. Please check your internet connection.');
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
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '0.3rem 2rem 1.5rem', 
        height: 'calc(100vh - 66px)', 
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      
      {/* Compact Top Action Bar: Category Pills + Search Box */}
      <div className="glass-panel" style={{ padding: '0.75rem 1.25rem', marginBottom: '0.75rem', borderRadius: '14px', flexShrink: 0 }}>
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
            Click any playlist category above or below to stream full-length songs live on demand with zero 30-second limits.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
            {presets.slice(0, 4).map((p) => (
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
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.25rem', flexGrow: 1, overflow: 'hidden' }}>
          
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
              <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr 100px 65px', padding: '0.4rem 0.75rem', color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)', letterSpacing: '0.05em', textTransform: 'uppercase', flexShrink: 0 }}>
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
                        gridTemplateColumns: '36px 1fr 100px 65px',
                        padding: '0.55rem 0.75rem',
                        alignItems: 'center',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'background 0.2s ease',
                        background: isCurrent ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
                        border: isCurrent ? '1px solid rgba(6, 182, 212, 0.25)' : '1px solid transparent'
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
                      <div style={{ overflow: 'hidden' }}>
                        <span className="badge badge-secondary" style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem', whiteSpace: 'nowrap', border: '1px solid var(--border-glass)' }}>
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

          {/* Right Panel: Playback & Vinyl Visualizer */}
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', height: '100%', boxSizing: 'border-box', justifyContent: 'center', overflowY: 'auto', borderRadius: '16px' }}>
              {currentSong ? (
                <>
                  {/* Vinyl Record */}
                  <div style={{ position: 'relative', width: '150px', height: '150px', marginBottom: '1rem' }}>
                    <div
                      className={`vinyl-wrapper ${isPlaying ? 'spinning' : ''}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        boxShadow: isPlaying 
                          ? '0 0 25px 0 rgba(6, 182, 212, 0.3), 0 0 4px 1px rgba(255,255,255,0.05)' 
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
                      {/* Vinyl Hole */}
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '24px', height: '24px', borderRadius: '50%', background: 'var(--bg-dark)', border: '3px solid var(--border-glass)' }}></div>
                    </div>
                  </div>

                  {/* Song Meta */}
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', margin: '0 0 0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                    {currentSong.title}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '0 0 1rem' }}>
                    {currentSong.artist}
                  </p>

                  {/* Progress Bar */}
                  <div style={{ width: '100%', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.72rem', marginBottom: '0.35rem' }}>
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                    <div 
                      style={{
                        height: '6px',
                        background: 'rgba(255,255,255,0.08)',
                        borderRadius: '3px',
                        position: 'relative',
                        cursor: 'pointer'
                      }}
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const clickX = e.clientX - rect.left;
                        const percent = clickX / rect.width;
                        seek(percent * duration);
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          height: '100%',
                          width: `${currentProgressPercent}%`,
                          background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
                          borderRadius: '3px'
                        }}
                      ></div>
                    </div>
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
                      title="Previous"
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
                      title="Next"
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

                  {/* Volume Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', maxWidth: '200px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    <span>🔊</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      style={{ flexGrow: 1, accentColor: 'var(--primary)', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '0.72rem', width: '30px', textAlign: 'right' }}>{Math.round(volume * 100)}%</span>
                  </div>
                </>
              ) : (
                <div style={{ padding: '1.5rem 0', color: 'var(--text-secondary)' }}>
                  <div style={{ fontSize: '2.2rem', marginBottom: '0.5rem', opacity: 0.5 }}>🎵</div>
                  <p style={{ fontWeight: 500, margin: 0, fontSize: '0.9rem' }}>No song selected</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Click any track on the left to start streaming full audio.</p>
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
