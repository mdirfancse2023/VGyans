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
    { id: 'bollywood', label: '🔥 Top 50 Bollywood', term: 'bollywood', country: 'IN', description: 'Top 50 trending Hindi & Bollywood chartbusters' },
    { id: 'hollywood', label: '⭐ Top 50 Hollywood', term: 'top pop hits', country: 'US', description: 'Top 50 international Hollywood & Billboard hits' },
    { id: 'lofi', label: '🎧 Lo-Fi Focus', term: 'lofi chill study', country: 'US', description: 'Relaxing ambient & lo-fi beats' },
    { id: 'punjabi', label: '🎸 Punjabi Hits', term: 'punjabi hits', country: 'IN', description: 'High-energy Punjabi tracklist' },
    { id: 'romantic', label: '💖 Romantic Classics', term: 'romantic hits', country: 'IN', description: 'Timeless love songs & melodies' }
  ];

  // Fetch real-time songs from API
  const handleFetchSongs = async (presetObj, customSearch = '') => {
    setIsLoading(true);
    setErrorMsg(null);

    let queryTerm = '';
    let countryCode = '';
    let displayLabel = '';

    if (customSearch.trim()) {
      queryTerm = customSearch.trim();
      displayLabel = `"${queryTerm}"`;
      setActivePreset(null);
    } else if (presetObj) {
      queryTerm = presetObj.term;
      countryCode = presetObj.country || '';
      displayLabel = presetObj.label.replace(/^[^\w\s]+\s*/, ''); // Strip leading emoji for message
      setActivePreset(presetObj.id);
    } else {
      queryTerm = 'bollywood';
      displayLabel = 'Top 50 Songs';
    }

    setLoadingText(`Fetching real-time songs for ${displayLabel}...`);

    try {
      const countryParam = countryCode ? `&country=${countryCode}` : '';
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(queryTerm)}&entity=song&limit=50${countryParam}`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch from real-time API');
      
      const data = await res.json();
      
      if (!data.results || data.results.length === 0) {
        setErrorMsg(`No playable tracks found for "${queryTerm}". Try another search or category!`);
        setIsLoading(false);
        return;
      }

      // Filter tracks with valid preview audio URLs
      const validTracks = data.results.filter(t => t.previewUrl && t.trackName);

      const realTimeSongs = validTracks.slice(0, 50).map((t, index) => ({
        id: t.trackId ? `itunes-${t.trackId}` : `song-${index}-${Date.now()}`,
        title: t.trackName,
        artist: t.artistName,
        album: t.collectionName || 'Single',
        category: presetObj ? presetObj.label.replace(/^[^\w\s]+\s*/, '') : 'Live Search',
        coverUrl: t.artworkUrl100
          ? t.artworkUrl100.replace('100x100bb.jpg', '500x500bb.jpg')
          : 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500',
        url: t.previewUrl,
        duration: t.trackTimeMillis ? Math.floor(t.trackTimeMillis / 1000) : 30
      }));

      if (setSongs) {
        setSongs(realTimeSongs);
      }
      setSelectedCategory('All');
    } catch (err) {
      console.error('Realtime song fetch error:', err);
      setErrorMsg('Could not fetch real-time music. Please check your internet connection and try again.');
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
    <div className="songs-dashboard" style={{ maxWidth: '1200px', margin: '1rem auto 0', padding: '0 1rem 1.5rem', minHeight: 'calc(100vh - 105px)', boxSizing: 'border-box' }}>
      
      {/* Top Header & Real-time Fetch Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.25rem', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700, background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🎵 Real-Time Music Player
            </h2>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Fetch Top 50 Bollywood, Top 50 Hollywood, or search any artist live on demand
            </p>
          </div>

          {/* Search Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                handleFetchSongs(null, searchQuery);
              }
            }}
            style={{ display: 'flex', gap: '0.5rem', flexGrow: 1, maxWidth: '450px' }}
          >
            <div style={{ position: 'relative', flexGrow: 1 }}>
              <input
                type="text"
                placeholder="Search any artist, song, or genre (e.g. Arijit Singh, Taylor Swift)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem 0.65rem 2.4rem',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '10px',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.88rem',
                  outline: 'none'
                }}
              />
              <span style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>🔍</span>
            </div>
            <button
              type="submit"
              disabled={isLoading || !searchQuery.trim()}
              className="btn btn-primary"
              style={{
                padding: '0.65rem 1.2rem',
                fontSize: '0.85rem',
                borderRadius: '10px',
                whiteSpace: 'nowrap',
                opacity: (isLoading || !searchQuery.trim()) ? 0.6 : 1,
                cursor: (isLoading || !searchQuery.trim()) ? 'not-allowed' : 'pointer'
              }}
            >
              Fetch Live
            </button>
          </form>
        </div>

        {/* Quick Category Action Buttons */}
        <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Featured Lists:
          </span>
          {presets.map((p) => {
            const isActive = activePreset === p.id && songs.length > 0;
            return (
              <button
                key={p.id}
                onClick={() => handleFetchSongs(p)}
                disabled={isLoading}
                style={{
                  padding: '0.45rem 1rem',
                  fontSize: '0.82rem',
                  borderRadius: '20px',
                  border: isActive ? '1px solid var(--primary)' : '1px solid var(--border-glass)',
                  background: isActive ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  color: isActive ? 'var(--primary)' : 'var(--text-primary)',
                  cursor: isLoading ? 'wait' : 'pointer',
                  fontWeight: isActive ? 600 : 400,
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
                className="preset-btn"
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        /* Spinner & Loading State */
        <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '380px', borderRadius: '16px' }}>
          <div className="realtime-spinner" style={{ position: 'relative', width: '64px', height: '64px', marginBottom: '1.5rem' }}>
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
              fontSize: '1.5rem'
            }}>🎵</div>
          </div>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>{loadingText}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '400px', margin: 0 }}>
            Connecting to live audio streams. Please wait a moment...
          </p>

          {/* Equalizer animation */}
          <div style={{ display: 'flex', gap: '4px', height: '20px', marginTop: '1.5rem' }}>
            <span className="wave-bar bar-1"></span>
            <span className="wave-bar bar-2"></span>
            <span className="wave-bar bar-3"></span>
            <span className="wave-bar bar-1"></span>
            <span className="wave-bar bar-2"></span>
          </div>
        </div>
      ) : errorMsg ? (
        /* Error State */
        <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center', borderRadius: '16px' }}>
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
        <div className="glass-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center', borderRadius: '16px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎧</div>
          <h3 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>
            No Pre-loaded Songs
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '500px', margin: '0 auto 2rem', lineHeight: 1.5 }}>
            Click any button below to fetch live real-time <strong>Top 50 Bollywood</strong> or <strong>Top 50 Hollywood</strong> songs with high quality audio streaming.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', maxWidth: '800px', margin: '0 auto' }}>
            {presets.slice(0, 4).map((p) => (
              <div
                key={p.id}
                onClick={() => handleFetchSongs(p)}
                className="category-card"
                style={{
                  padding: '1.25rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'transform 0.2s ease, border-color 0.2s ease, background 0.2s ease'
                }}
              >
                <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '1rem', color: 'var(--text-primary)' }}>
                  {p.label}
                </h4>
                <p style={{ margin: '0 0 0.8rem 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {p.description}
                </p>
                <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  Fetch Live 50 Songs →
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Loaded Songs View */
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.5rem', height: 'calc(100vh - 250px)' }}>
          
          {/* Left Panel: Real-time Track List */}
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box', overflow: 'hidden', borderRadius: '16px' }}>
              
              {/* Category Filter Pills & Counter */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  Showing <strong style={{ color: 'var(--primary)' }}>{filteredSongs.length}</strong> real-time tracks
                </div>

                {/* Category Pills */}
                {categories.length > 2 && (
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
                        style={{
                          padding: '0.3rem 0.8rem',
                          fontSize: '0.75rem',
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
              <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 100px 70px', padding: '0.5rem 1rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)', letterSpacing: '0.05em', textTransform: 'uppercase', flexShrink: 0 }}>
                <span>#</span>
                <span>Title & Artist</span>
                <span>Category</span>
                <span style={{ textAlign: 'right' }}>Length</span>
              </div>

              {/* Table Body */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto', flexGrow: 1, paddingRight: '0.25rem', marginTop: '0.25rem' }}>
                {filteredSongs.map((song, index) => {
                  const isCurrent = currentSong && currentSong.id === song.id;
                  return (
                    <div
                      key={song.id}
                      onClick={() => playSong(song)}
                      className={`song-row-item ${isCurrent ? 'active' : ''}`}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '40px 1fr 100px 70px',
                        padding: '0.65rem 0.85rem',
                        alignItems: 'center',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'background 0.2s ease',
                        background: isCurrent ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
                        border: isCurrent ? '1px solid rgba(6, 182, 212, 0.25)' : '1px solid transparent'
                      }}
                    >
                      {/* Play Icon / Number */}
                      <div style={{ color: isCurrent ? 'var(--primary)' : 'var(--text-muted)', fontSize: '0.85rem' }}>
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                        <img
                          src={song.coverUrl}
                          alt={song.title}
                          style={{ width: '38px', height: '38px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }}
                          loading="lazy"
                        />
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <h4 style={{ color: isCurrent ? 'var(--primary)' : 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {song.title}
                          </h4>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', margin: '0.1rem 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {song.artist}
                          </p>
                        </div>
                      </div>

                      {/* Category Badge */}
                      <div style={{ overflow: 'hidden' }}>
                        <span className="badge badge-secondary" style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem', whiteSpace: 'nowrap', border: '1px solid var(--border-glass)' }}>
                          {song.category}
                        </span>
                      </div>

                      {/* Duration */}
                      <div style={{ textAlign: 'right', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
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
            <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', height: '100%', boxSizing: 'border-box', justifyContent: 'center', overflowY: 'auto', borderRadius: '16px' }}>
              {currentSong ? (
                <>
                  {/* Vinyl Record */}
                  <div style={{ position: 'relative', width: '180px', height: '180px', marginBottom: '1.25rem' }}>
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
                        border: '6px solid var(--bg-dark-secondary)',
                        transition: 'box-shadow var(--transition-normal)'
                      }}
                    >
                      <img
                        src={currentSong.coverUrl}
                        alt={currentSong.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      {/* Vinyl Hole */}
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-dark)', border: '3px solid var(--border-glass)' }}></div>
                    </div>
                  </div>

                  {/* Song Meta */}
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', margin: '0 0 0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                    {currentSong.title}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0 0 1.25rem' }}>
                    {currentSong.artist}
                  </p>

                  {/* Progress Bar */}
                  <div style={{ width: '100%', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.4rem' }}>
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.25rem' }}>
                    <button
                      onClick={() => setPlaybackMode(playbackMode === 'shuffle' ? 'normal' : 'shuffle')}
                      className="control-btn"
                      title="Shuffle"
                      style={{ background: 'transparent', border: 'none', color: playbackMode === 'shuffle' ? 'var(--primary)' : 'var(--text-muted)', fontSize: '1.1rem', cursor: 'pointer' }}
                    >
                      🔀
                    </button>

                    <button
                      onClick={prevSong}
                      className="control-btn"
                      title="Previous"
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '1.5rem', cursor: 'pointer' }}
                    >
                      ⏮
                    </button>

                    <button
                      onClick={togglePlay}
                      style={{
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        border: 'none',
                        width: '52px',
                        height: '52px',
                        borderRadius: '50%',
                        color: '#fff',
                        fontSize: '1.2rem',
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
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '1.5rem', cursor: 'pointer' }}
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', width: '100%', maxWidth: '220px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
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
                    <span style={{ fontSize: '0.75rem', width: '32px', textAlign: 'right' }}>{Math.round(volume * 100)}%</span>
                  </div>
                </>
              ) : (
                <div style={{ padding: '2rem 0', color: 'var(--text-secondary)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', opacity: 0.5 }}>🎵</div>
                  <p style={{ fontWeight: 500, margin: 0 }}>No song selected</p>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Click any track on the left to start streaming live audio.</p>
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
