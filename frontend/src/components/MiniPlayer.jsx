import React from 'react';

export default function MiniPlayer({
  currentSong,
  isPlaying,
  togglePlay,
  nextSong,
  onOpenMusicTab,
  onClose
}) {
  if (!currentSong) return null;

  return (
    <div
      className="glass-panel mini-player-widget"
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        width: '320px',
        padding: '0.75rem 1rem',
        borderRadius: '16px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4), 0 0 0 1px var(--border-glass)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        zIndex: 9999,
        animation: 'slideInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid var(--border-glass)'
      }}
    >
      {/* Album Artwork (Spinning if playing) */}
      <div
        onClick={onOpenMusicTab}
        style={{
          position: 'relative',
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          overflow: 'hidden',
          cursor: 'pointer',
          flexShrink: 0,
          border: '2px solid rgba(255, 255, 255, 0.1)',
          boxShadow: isPlaying ? '0 0 8px var(--primary-glow)' : 'none'
        }}
        className={`mini-vinyl ${isPlaying ? 'spinning' : ''}`}
      >
        <img
          src={currentSong.coverUrl}
          alt={currentSong.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {/* Vinyl Center Hole */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--bg-dark)' }}></div>
      </div>

      {/* Song Info (Clicking switches to songs tab) */}
      <div
        onClick={onOpenMusicTab}
        style={{
          flexGrow: 1,
          cursor: 'pointer',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
      >
        <h4 style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '150px' }}>
          {currentSong.title}
        </h4>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.1rem 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '150px' }}>
          {currentSong.artist}
        </p>
      </div>

      {/* Mini Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
        {/* Play/Pause */}
        <button
          onClick={togglePlay}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-glass)',
            color: 'var(--text-primary)',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8rem',
            transition: 'background var(--transition-fast), border-color var(--transition-fast)'
          }}
          className="mini-ctrl-btn"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        {/* Skip Next */}
        <button
          onClick={nextSong}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-glass)',
            color: 'var(--text-primary)',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8rem',
            transition: 'background var(--transition-fast), border-color var(--transition-fast)'
          }}
          className="mini-ctrl-btn"
          title="Next Track"
        >
          ⏭
        </button>

        {/* Close button (Dismiss Widget & Stop audio) */}
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            fontSize: '0.9rem',
            marginLeft: '0.2rem',
            transition: 'color var(--transition-fast)'
          }}
          title="Close Player"
        >
          ✕
        </button>
      </div>

      {/* Styles for animation and rotation */}
      <style>{`
        @keyframes slideInUp {
          from {
            transform: translateY(100px) scale(0.9);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        
        .mini-vinyl.spinning {
          animation: spinRecord 20s linear infinite;
        }

        .mini-ctrl-btn:hover {
          background: rgba(255, 255, 255, 0.1) !important;
          border-color: var(--primary) !important;
          color: var(--primary) !important;
        }
      `}</style>
    </div>
  );
}
