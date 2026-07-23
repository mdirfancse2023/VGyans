import React from 'react';
import { useWeather } from '../../hooks/useWeather';

export default function WeatherWidget() {
  const { city, setCity, weather, loading } = useWeather('Bangalore');

  return (
    <div style={{ background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '16px', padding: '20px', color: '#fff', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.5rem' }}>🌤️</span>
          <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Campus Weather & Focus Index</h4>
        </div>
        <select 
          value={city} 
          onChange={(e) => setCity(e.target.value)}
          style={{ background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#38bdf8', borderRadius: '6px', padding: '4px 8px', fontSize: '0.8rem', fontWeight: 700 }}
        >
          <option value="Bangalore">Bangalore</option>
          <option value="Hyderabad">Hyderabad</option>
          <option value="Pune">Pune</option>
          <option value="Delhi NCR">Delhi NCR</option>
        </select>
      </div>

      {loading ? (
        <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Fetching live campus weather...</p>
      ) : (
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '2rem', fontWeight: 900, color: '#f8fafc' }}>{weather?.temp}</span>
            <span style={{ fontSize: '1rem', color: '#cbd5e1', fontWeight: 600 }}>{weather?.condition}</span>
          </div>
          <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '8px', padding: '10px', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#38bdf8' }}>{weather?.focusScore}</span>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#cbd5e1' }}>{weather?.recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
}
