import React, { useState, useRef, useEffect } from 'react';

const CATEGORIES = [
  { id: 'improve', label: '🔧 What to Improve', placeholder: 'Tell us what could be better...' },
  { id: 'add',     label: '✨ What to Add',      placeholder: 'What features or content would you love to see?' },
  { id: 'liked',   label: '❤️ What You Liked',  placeholder: 'Share what you enjoyed the most!' },
];

const API_URL = import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:8000'
    : 'https://v-gyans.vercel.app');

export default function FeedbackButton({ isOpen, onClose, hideTrigger = false }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isOpen !== undefined ? isOpen : internalOpen;
  const [step, setStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [text, setText] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) handleClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setInternalOpen(false);
    }
    setTimeout(() => { setStep(0); setSelectedCategory(null); setText(''); setRating(0); setHoverRating(0); setError(''); }, 300);
  };

  const handleSubmit = async () => {
    if (!text.trim()) { setError('Please write something before submitting.'); return; }
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory.id,
          categoryLabel: selectedCategory.label,
          message: text.trim(),
          rating: rating || null,
          page: window.location.href,
        }),
      });
      if (!res.ok) throw new Error('Server error');
      setStep(2);
    } catch (err) {
      setError('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const btnBase = {
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '12px', padding: '14px 18px', textAlign: 'left', cursor: 'pointer',
    color: '#e2e8f0', fontSize: '0.92rem', fontWeight: 600, fontFamily: 'inherit',
    transition: 'all 0.18s ease', display: 'flex', alignItems: 'center', gap: '10px',
  };

  return (
    <>
      {/* Floating trigger button (only if not hidden) */}
      {!hideTrigger && (
        <button
          onClick={() => setInternalOpen(true)}
          style={{
            position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'rgba(15,23,42,0.92)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '50px', padding: '10px 20px', cursor: 'pointer',
            color: '#f8fafc', fontSize: '0.875rem', fontWeight: 700,
            backdropFilter: 'blur(12px)', boxShadow: '0 4px 24px rgba(0,0,0,0.45)',
            transition: 'all 0.2s ease', fontFamily: 'inherit',
          }}
          onMouseEnter={e => { e.currentTarget.style.background='rgba(30,41,59,0.98)'; e.currentTarget.style.transform='translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.background='rgba(15,23,42,0.92)'; e.currentTarget.style.transform='translateY(0)'; }}
        >
          <span style={{ fontSize: '1rem' }}>💬</span>
          <span>Feedback</span>
        </button>
      )}

      {/* Overlay + Panel */}
      {open && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end',
          padding: '100px 28px 28px', animation: 'fbFadeIn 0.2s ease',
        }}>
          <div ref={panelRef} style={{
            background: 'rgba(10,15,28,0.97)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px', width: '380px', maxWidth: 'calc(100vw - 32px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.7)', overflow: 'hidden',
            fontFamily: 'inherit', animation: 'fbSlideUp 0.25s cubic-bezier(0.16,1,0.3,1)',
          }}>

            {/* Header */}
            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>Share Feedback</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>Help us make Virtual Gyans better</div>
              </div>
              <button onClick={handleClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', color: '#94a3b8', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>✕</button>
            </div>

            {/* Body */}
            <div style={{ padding: '20px 24px 24px' }}>

              {/* Step 2: Done */}
              {step === 2 && (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🙏</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>Thank you!</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.6 }}>Your feedback has been saved.<br />We truly appreciate your input!</div>
                  <button onClick={handleClose} style={{ marginTop: '20px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '9px 28px', color: '#cbd5e1', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Close</button>
                </div>
              )}

              {/* Step 0: Category */}
              {step === 0 && (
                <>
                  <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>What's on your mind?</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {CATEGORIES.map(cat => (
                      <button key={cat.id} onClick={() => { setSelectedCategory(cat); setStep(1); }} style={btnBase}
                        onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.09)'; e.currentTarget.style.transform='translateX(4px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.transform='translateX(0)'; }}
                      >
                        {cat.label}
                        <span style={{ marginLeft: 'auto', color: '#475569' }}>→</span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Step 1: Write */}
              {step === 1 && selectedCategory && (
                <>
                  <button onClick={() => { setStep(0); setText(''); setRating(0); setError(''); }}
                    style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, padding: '0 0 14px', display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'inherit' }}>
                    ← Back
                  </button>

                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '10px' }}>{selectedCategory.label}</div>

                  <textarea
                    value={text} onChange={e => setText(e.target.value)}
                    placeholder={selectedCategory.placeholder} maxLength={1000} autoFocus
                    style={{ width: '100%', minHeight: '120px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px', color: '#f1f5f9', fontSize: '0.9rem', lineHeight: 1.6, resize: 'vertical', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor='rgba(255,255,255,0.25)'}
                    onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'}
                  />
                  <div style={{ fontSize: '0.75rem', color: '#475569', textAlign: 'right', marginTop: '4px' }}>{text.length}/1000</div>

                  {/* Stars */}
                  <div style={{ marginTop: '16px' }}>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '8px', fontWeight: 600 }}>Overall Rating (optional)</div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {[1,2,3,4,5].map(star => (
                        <button key={star} onClick={() => setRating(star === rating ? 0 : star)}
                          onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', padding: '2px', transition: 'transform 0.12s ease', transform: (hoverRating||rating)>=star?'scale(1.2)':'scale(1)', filter: (hoverRating||rating)>=star?'none':'grayscale(1) opacity(0.35)' }}>
                          ⭐
                        </button>
                      ))}
                    </div>
                  </div>

                  {error && <div style={{ color: '#f87171', fontSize: '0.82rem', marginTop: '10px', padding: '8px 12px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '8px' }}>{error}</div>}

                  <button onClick={handleSubmit} disabled={submitting} style={{ marginTop: '16px', width: '100%', background: submitting?'rgba(255,255,255,0.04)':'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', padding: '12px', color: submitting?'#64748b':'#f8fafc', fontSize: '0.9rem', fontWeight: 700, cursor: submitting?'not-allowed':'pointer', fontFamily: 'inherit', transition: 'all 0.18s ease' }}
                    onMouseEnter={e => { if(!submitting){e.currentTarget.style.background='rgba(255,255,255,0.16)';} }}
                    onMouseLeave={e => { if(!submitting){e.currentTarget.style.background='rgba(255,255,255,0.1)';} }}>
                    {submitting ? 'Submitting...' : 'Submit Feedback →'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fbFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes fbSlideUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
    </>
  );
}
