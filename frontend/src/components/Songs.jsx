import React, { useState, useMemo } from 'react';

export default function Songs({
  songs,
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
  setPlaybackMode,
  ambientSounds,
  setAmbientSoundVolume
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Categories derived from songs
  const categories = useMemo(() => {
    const cats = new Set(songs.map(s => s.category));
    return ['All', ...Array.from(cats)];
  }, [songs]);

  // Filter songs based on search and category
  const filteredSongs = useMemo(() => {
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
    <div className="songs-dashboard" style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' }}>
      {/* Hero Banner */}
      <div className="glass-panel songs-hero" style={{ padding: '2.5rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span className="badge badge-primary" style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem' }}>Study Space</span>
          <h1 style={{ fontSize: '2.5rem', marginTop: '0.5rem', color: 'var(--text-primary)' }}>Focus Radio & Lo-Fi Beats</h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', fontSize: '1.05rem', marginTop: '0.5rem' }}>
            Elevate your study sessions. Mix high-quality instrumental beats with custom ambient sounds to create your perfect deep-work environment.
          </p>
        </div>
        <div className="hero-glow-blob" style={{ position: 'absolute', right: '-10%', top: '-20%', width: '300px', height: '300px', background: 'radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)', filter: 'blur(30px)' }}></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem' }}>
        
        {/* Left Panel: Library & Browser */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            
            {/* Search and Filters */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ position: 'relative', flexGrow: 1, maxWidth: '400px' }}>
                <input
                  type="text"
                  placeholder="Search tracks or artists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.5rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'border-color var(--transition-fast)'
                  }}
                  className="search-input"
                />
                <span style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>🔍</span>
              </div>

              {/* Category Pills */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
                    style={{
                      padding: '0.4rem 1rem',
                      fontSize: '0.8rem',
                      borderRadius: '20px',
                      background: selectedCategory === cat ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                      borderColor: selectedCategory === cat ? 'var(--primary)' : 'var(--border-glass)'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Song Grid/List */}
            {filteredSongs.length === 0 ? (
              <div style={{ padding: '3rem text-center', color: 'var(--text-secondary)', textAlign: 'center' }}>
                <p style={{ fontSize: '1.1rem' }}>No songs found matching your criteria.</p>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Try clearing your search query or choosing another category.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {/* Table Header */}
                <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 120px 80px', padding: '0.5rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  <span>#</span>
                  <span>Title</span>
                  <span>Category</span>
                  <span style={{ textAlign: 'right' }}>Length</span>
                </div>

                {/* Table Body */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', maxHeight: '500px', overflowY: 'auto' }}>
                  {filteredSongs.map((song, index) => {
                    const isCurrent = currentSong && currentSong.id === song.id;
                    return (
                      <div
                        key={song.id}
                        onClick={() => playSong(song)}
                        className={`song-row-item ${isCurrent ? 'active' : ''}`}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '40px 1fr 120px 80px',
                          padding: '0.75rem 1rem',
                          alignItems: 'center',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'background var(--transition-fast)',
                          background: isCurrent ? 'rgba(6, 182, 212, 0.08)' : 'transparent',
                          border: isCurrent ? '1px solid rgba(6, 182, 212, 0.2)' : '1px solid transparent'
                        }}
                      >
                        {/* Play/Pause state icon */}
                        <div style={{ color: isCurrent ? 'var(--primary)' : 'var(--text-muted)', fontSize: '0.95rem' }}>
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

                        {/* Details */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img
                            src={song.coverUrl}
                            alt={song.title}
                            style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }}
                            loading="lazy"
                          />
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <h4 style={{ color: isCurrent ? 'var(--primary)' : 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 600 }}>
                              {song.title}
                            </h4>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.1rem' }}>
                              {song.artist}
                            </p>
                          </div>
                        </div>

                        {/* Category */}
                        <div>
                          <span className="badge badge-secondary" style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', border: '1px solid var(--border-glass)' }}>
                            {song.category}
                          </span>
                        </div>

                        {/* Duration */}
                        <div style={{ textAlign: 'right', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                          {formatTime(song.duration)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Playback Controls & Ambient Mixer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Now Playing Card */}
          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative' }}>
            {currentSong ? (
              <>
                {/* Album Cover Art */}
                <div style={{ position: 'relative', width: '200px', height: '200px', marginBottom: '1.5rem' }}>
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
                    {/* Vinyl Center Hole */}
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-dark)', border: '4px solid var(--border-glass)' }}></div>
                  </div>
                </div>

                {/* Song Meta */}
                <h3 style={{ fontSize: '1.35rem', color: 'var(--text-primary)', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                  {currentSong.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                  {currentSong.artist}
                </p>

                {/* Progress Bar */}
                <div style={{ width: '100%', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
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
                    {/* Progress Knob */}
                    <div
                      style={{
                        position: 'absolute',
                        left: `calc(${currentProgressPercent}% - 5px)`,
                        top: '-3px',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: '#fff',
                        boxShadow: '0 0 6px rgba(0,0,0,0.5)',
                        opacity: 0,
                        transition: 'opacity var(--transition-fast)'
                      }}
                      className="progress-knob"
                    ></div>
                  </div>
                </div>

                {/* Player Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
                  
                  {/* Shuffle Button */}
                  <button
                    onClick={() => setPlaybackMode(playbackMode === 'shuffle' ? 'normal' : 'shuffle')}
                    className="control-btn"
                    title="Shuffle"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: playbackMode === 'shuffle' ? 'var(--primary)' : 'var(--text-muted)',
                      fontSize: '1.1rem',
                      cursor: 'pointer',
                      transition: 'color var(--transition-fast)'
                    }}
                  >
                    🔀
                  </button>

                  {/* Previous Song */}
                  <button
                    onClick={prevSong}
                    className="control-btn"
                    title="Previous"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-primary)',
                      fontSize: '1.5rem',
                      cursor: 'pointer',
                      transition: 'color var(--transition-fast)'
                    }}
                  >
                    ⏮
                  </button>

                  {/* Play/Pause Main */}
                  <button
                    onClick={togglePlay}
                    style={{
                      background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                      border: 'none',
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      color: '#fff',
                      fontSize: '1.3rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 4px 15px rgba(6, 182, 212, 0.4)',
                      transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)'
                    }}
                    className="btn-play-pause"
                  >
                    {isPlaying ? '⏸' : '▶'}
                  </button>

                  {/* Next Song */}
                  <button
                    onClick={nextSong}
                    className="control-btn"
                    title="Next"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-primary)',
                      fontSize: '1.5rem',
                      cursor: 'pointer',
                      transition: 'color var(--transition-fast)'
                    }}
                  >
                    ⏭
                  </button>

                  {/* Repeat Button */}
                  <button
                    onClick={() => setPlaybackMode(playbackMode === 'loop' ? 'normal' : 'loop')}
                    className="control-btn"
                    title="Repeat Track"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: playbackMode === 'loop' ? 'var(--primary)' : 'var(--text-muted)',
                      fontSize: '1.1rem',
                      cursor: 'pointer',
                      transition: 'color var(--transition-fast)'
                    }}
                  >
                    🔁
                  </button>
                </div>
              </>
            ) : (
              <div style={{ padding: '3rem 0', color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.5 }}>🎵</div>
                <p style={{ fontWeight: 500 }}>No song selected</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Select a track from the library on the left to start playing.</p>
              </div>
            )}
          </div>

          {/* Audio Mixer (Music & Ambient Sound Board) */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🎛</span> Study Sound Mixer
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Music Player Volume */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span>🎧</span> Music
                  </span>
                  <span>{Math.round(volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
                />
              </div>

              {/* Ambient Rain Volume */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span>🌧</span> Ambient Rain
                  </span>
                  <span>{Math.round(ambientSounds.rain * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={ambientSounds.rain}
                  onChange={(e) => setAmbientSoundVolume('rain', parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
                />
              </div>

              {/* Ambient Forest Wind Volume */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span>🍃</span> Forest Wind
                  </span>
                  <span>{Math.round(ambientSounds.wind * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={ambientSounds.wind}
                  onChange={(e) => setAmbientSoundVolume('wind', parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
                />
              </div>
            </div>

            <div style={{ marginTop: '1.25rem', padding: '0.75rem', background: 'rgba(6, 182, 212, 0.03)', border: '1px solid rgba(6, 182, 212, 0.1)', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              💡 <strong>Tip:</strong> Combining lo-fi beats with the "Forest Wind" or "Ambient Rain" synth noise mimics pink/brown noise and helps block out distracting environmental frequencies!
            </div>
          </div>

        </div>
      </div>

      {/* Embedded CSS Animations/Styles for Songs Dashboard */}
      <style>{`
        .songs-hero {
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%);
        }
        
        .song-row-item:hover {
          background: rgba(255, 255, 255, 0.02) !important;
        }
        
        .song-row-item.active {
          background: rgba(6, 182, 212, 0.08) !important;
        }

        .vinyl-wrapper.spinning {
          animation: spinRecord 20s linear infinite;
        }

        @keyframes spinRecord {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .btn-play-pause:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(6, 182, 212, 0.6);
        }

        .btn-play-pause:active {
          transform: scale(0.95);
        }

        .control-btn:hover {
          color: var(--text-primary) !important;
        }

        /* Soundwave equalizer animation */
        .wave-bar {
          display: inline-block;
          width: 2px;
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

        .progress-knob:hover {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
}
