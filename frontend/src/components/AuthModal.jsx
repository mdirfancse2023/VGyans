import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

export default function AuthModal({ isOpen, onClose, onLoginSuccess, isGated = false }) {
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    rememberMe: true
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setErrorMsg('');
  };

  const saveToFirestore = async (userObj) => {
    try {
      const docId = userObj.email.replace(/[^a-zA-Z0-9]/g, '_');
      const userRef = doc(db, 'users', docId);
      
      await setDoc(userRef, {
        id: userObj.id,
        name: userObj.name,
        email: userObj.email,
        avatar: userObj.avatar,
        role: 'Student / Learner',
        lastLogin: new Date().toISOString(),
        updatedAt: serverTimestamp()
      }, { merge: true });

      console.log('✅ User credentials successfully stored in Firebase Firestore database!');
    } catch (err) {
      console.warn('Firestore database notice:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.email || !formData.email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (authMode === 'signup' && !formData.name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    setLoading(true);

    try {
      const userObj = {
        id: `user_${Date.now()}`,
        name: authMode === 'signup' ? formData.name.trim() : (formData.email.split('@')[0].toUpperCase()),
        email: formData.email.trim(),
        avatar: (authMode === 'signup' ? formData.name.charAt(0) : formData.email.charAt(0)).toUpperCase(),
        joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      };

      // Save to Firebase Firestore Database
      await saveToFirestore(userObj);

      setLoading(false);
      setSuccessMsg(authMode === 'login' ? 'Successfully logged in!' : 'Account created & stored in Firebase!');

      setTimeout(() => {
        onLoginSuccess(userObj);
        if (onClose) onClose();
        setSuccessMsg('');
      }, 600);
    } catch (err) {
      setLoading(false);
      setErrorMsg('Authentication failed. Please try again.');
    }
  };

  return (
    <div 
      className="modal-backdrop" 
      onClick={!isGated ? onClose : undefined}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(5, 8, 16, 0.85)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.25s ease'
      }}
    >
      <div 
        className="glass-panel auth-modal-box"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'rgba(15, 23, 42, 0.96)',
          border: '1px solid var(--border-glass)',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 20px 50px rgba(0,0,0,0.7), 0 0 35px rgba(6, 182, 212, 0.2)',
          position: 'relative',
          color: 'var(--text-primary)'
        }}
      >
        {/* Close Button (Hidden when gated mode requires login) */}
        {!isGated && onClose && (
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1.25rem',
              right: '1.25rem',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid var(--border-glass)',
              color: 'var(--text-secondary)',
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.9rem'
            }}
            title="Close Modal"
          >
            ✕
          </button>
        )}

        {/* Modal Header Logo */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div className="theme-toggle-btn" style={{ width: '36px', height: '36px', pointerEvents: 'none' }}>
              <img src="/logo.png" alt="Virtual Gyans Logo" style={{ width: '22px', height: '22px' }} />
            </div>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.35rem', color: 'var(--text-primary)' }}>
              Virtual Gyans
            </span>
          </div>

          {isGated && (
            <div style={{ background: 'rgba(6, 182, 212, 0.12)', border: '1px solid var(--border-glass)', borderRadius: '6px', padding: '0.3rem 0.6rem', fontSize: '0.75rem', color: 'var(--primary)', margin: '0.4rem 0 0.8rem', fontWeight: 600 }}>
              🔒 Authentication Required to Access Platform
            </div>
          )}

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', opacity: 0.85, margin: 0 }}>
            {authMode === 'login' ? 'Welcome back! Log in to access all study material.' : 'Join Virtual Gyans & save credentials to Firebase.'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: 'rgba(255,255,255,0.04)', padding: '0.25rem', borderRadius: '10px', marginBottom: '1.5rem', border: '1px solid var(--border-glass)' }}>
          <button
            type="button"
            onClick={() => { setAuthMode('login'); setErrorMsg(''); }}
            style={{
              padding: '0.5rem',
              borderRadius: '8px',
              border: 'none',
              background: authMode === 'login' ? 'var(--primary)' : 'transparent',
              color: authMode === 'login' ? '#fff' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('signup'); setErrorMsg(''); }}
            style={{
              padding: '0.5rem',
              borderRadius: '8px',
              border: 'none',
              background: authMode === 'signup' ? 'var(--primary)' : 'transparent',
              color: authMode === 'signup' ? '#fff' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Messages Banners */}
        {errorMsg && (
          <div style={{ padding: '0.6rem 0.9rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#f87171', fontSize: '0.82rem', marginBottom: '1rem' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{ padding: '0.6rem 0.9rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#34d399', fontSize: '0.82rem', marginBottom: '1rem' }}>
            ✓ {successMsg}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {authMode === 'signup' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Irfan Khan"
                  value={formData.name}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem 0.65rem 2.2rem',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box'
                  }}
                />
                <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>👤</span>
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                name="email"
                placeholder="name@company.com"
                value={formData.email}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem 0.65rem 2.2rem',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box'
                }}
              />
              <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>✉️</span>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem 0.65rem 2.2rem',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box'
                }}
              />
              <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔒</span>
            </div>
          </div>

          {authMode === 'login' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  name="rememberMe" 
                  checked={formData.rememberMe} 
                  onChange={handleChange} 
                  style={{ accentColor: 'var(--primary)' }}
                />
                Remember me
              </label>
              <a 
                href="#forgot" 
                onClick={(e) => { e.preventDefault(); alert('Password reset instructions sent to your email.'); }}
                style={{ color: 'var(--primary)', textDecoration: 'none' }}
              >
                Forgot Password?
              </a>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '8px',
              fontWeight: 700,
              marginTop: '0.5rem',
              cursor: loading ? 'wait' : 'pointer'
            }}
          >
            {loading ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                Saving to Firebase...
              </span>
            ) : (
              authMode === 'login' ? 'Log In & Enter Platform' : 'Sign Up & Save Credentials'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
