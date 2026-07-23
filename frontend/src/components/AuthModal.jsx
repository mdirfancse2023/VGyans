import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { hashPassword, createJWT } from '../utils/jwtUtils';

export default function AuthModal({ 
  isOpen, 
  onClose, 
  onLoginSuccess, 
  isGated = false,
  theme,
  toggleTheme 
}) {
  const [formData, setFormData] = useState({
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

  const saveToFirestoreWithJWT = async (userObj, passwordHash, jwtToken) => {
    try {
      if (!db) return;
      const docId = userObj.email.replace(/[^a-zA-Z0-9]/g, '_');
      const userRef = doc(db, 'users', docId);

      // Store hashed credential and JWT token payload in Firestore asynchronously
      await setDoc(userRef, {
        id: userObj.id,
        name: userObj.name,
        email: userObj.email,
        avatar: userObj.avatar,
        role: 'Administrator / Learner',
        passwordHash,
        jwtToken,
        lastLogin: new Date().toISOString(),
        updatedAt: serverTimestamp()
      }, { merge: true });

      console.log('🔒 Hashed Password & Signed JWT stored in Firebase Firestore!');
    } catch (err) {
      console.warn('Firestore sync notice (non-blocking):', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const inputEmail = formData.email.trim().toLowerCase();
    const inputPassword = formData.password.trim();

    if (!inputEmail || !inputEmail.includes('@')) {
      setErrorMsg('Please enter your valid email address.');
      return;
    }

    if (!inputPassword) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      // Load credentials exclusively from environment variables (.env)
      const adminPass = import.meta.env.VITE_ADMIN_PASSWORD || '';
      const adminEmail = (import.meta.env.VITE_ADMIN_EMAIL || '').toLowerCase();

      const hashedInputPassword = await hashPassword(inputPassword);
      const expectedPasswordHash = adminPass ? await hashPassword(adminPass) : '';

      const isAuthorizedEmail = adminEmail ? (inputEmail === adminEmail) : true;
      const isAuthorizedPassword = adminPass ? (hashedInputPassword === expectedPasswordHash || inputPassword === adminPass) : true;

      if (!isAuthorizedEmail || !isAuthorizedPassword) {
        setLoading(false);
        setErrorMsg('Invalid email or password. Please check your credentials.');
        return;
      }

      const userObj = {
        id: 'user_mdirfan_01',
        name: 'Md Irfan',
        email: inputEmail,
        avatar: 'I',
        joinedDate: 'July 2026'
      };

      // Generate signed JWT Token
      const jwtToken = await createJWT(userObj);

      // Store JWT token in localStorage for persistent session
      localStorage.setItem('vg_jwt_token', jwtToken);
      localStorage.setItem('vg_user', JSON.stringify(userObj));

      // Asynchronously sync to Firebase Firestore without blocking login completion
      saveToFirestoreWithJWT(userObj, hashedInputPassword, jwtToken).catch(() => {});

      setLoading(false);
      setSuccessMsg('Logged in successfully!');

      // Instantly trigger login success and close modal
      onLoginSuccess(userObj);
      if (onClose) onClose();
      setSuccessMsg('');
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
          background: theme === 'light' ? 'rgba(255, 255, 255, 0.98)' : 'rgba(15, 23, 42, 0.96)',
          border: '1px solid var(--border-glass)',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 20px 50px rgba(0,0,0,0.7), 0 0 35px rgba(6, 182, 212, 0.2)',
          position: 'relative',
          color: 'var(--text-primary)'
        }}
      >
        {/* Theme Toggle Button inside Auth Modal */}
        <button
          type="button"
          onClick={toggleTheme}
          className="theme-toggle-btn"
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: (!isGated && onClose) ? '3.5rem' : '1.25rem',
            width: '32px',
            height: '32px',
            borderRadius: '8px'
          }}
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
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          )}
        </button>

        {/* Close Button (Hidden when gated mode requires login) */}
        {!isGated && onClose && (
          <button
            type="button"
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1.25rem',
              right: '1.25rem',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid var(--border-glass)',
              color: 'var(--text-secondary)',
              width: '32px',
              height: '32px',
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
            Welcome back! Enter credentials to log in.
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: 'rgba(255,255,255,0.04)', padding: '0.25rem', borderRadius: '10px', marginBottom: '1.5rem', border: '1px solid var(--border-glass)' }}>
          <button
            type="button"
            style={{
              padding: '0.5rem',
              borderRadius: '8px',
              border: 'none',
              background: 'var(--primary)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'default'
            }}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); }}
            style={{
              padding: '0.5rem',
              borderRadius: '8px',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'not-allowed',
              opacity: 0.45
            }}
            title="Sign Up is currently disabled by Administrator"
          >
            Sign Up 🚫
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

        {/* Log In Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                name="email"
                placeholder="name@domain.com"
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
              onClick={(e) => { e.preventDefault(); alert('Please contact administrator if you forgot your password.'); }}
              style={{ color: 'var(--primary)', textDecoration: 'none' }}
            >
              Forgot Password?
            </a>
          </div>

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
                Authenticating...
              </span>
            ) : (
              'Log In & Enter Platform'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
