import React from 'react';

export default function SongCard({ song, isPlaying, onSelect }) {
  return (
    <div 
      onClick={() => onSelect(song)}
      style={{
        background: isPlaying ? 'rgba(56, 189, 248, 0.15)' : 'rgba(30, 41, 59, 0.6)',
        border: isPlaying ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '1.4rem' }}>{isPlaying ? '🎵' : '🎧'}</span>
        <div>
          <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#f8fafc', fontWeight: 700 }}>{song.title}</h4>
          <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>{song.artist} • {song.album}</p>
        </div>
      </div>
      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{song.duration}</span>
    </div>
  );
}
