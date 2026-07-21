import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';

export default function UserNotesModal({ isOpen, onClose, user, onOpenAuth }) {
  const [notes, setNotes] = useState([]);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Load user notes from Firebase Firestore or localStorage fallback
  useEffect(() => {
    if (!isOpen) return;

    const loadNotes = async () => {
      setLoading(true);
      if (user && user.uid) {
        try {
          const notesRef = collection(db, 'users', user.uid, 'user_notes');
          const q = query(notesRef, orderBy('updatedAt', 'desc'));
          const snapshot = await getDocs(q);
          const loaded = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          setNotes(loaded);
          if (loaded.length > 0) {
            setActiveNoteId(loaded[0].id);
            setTitle(loaded[0].title || '');
            setContent(loaded[0].content || '');
          } else {
            setActiveNoteId(null);
            setTitle('');
            setContent('');
          }
        } catch (err) {
          console.error('Error fetching Firestore user notes:', err);
          loadLocalNotes();
        }
      } else {
        loadLocalNotes();
      }
      setLoading(false);
    };

    const loadLocalNotes = () => {
      try {
        const local = localStorage.getItem('vg_user_notes');
        if (local) {
          const parsed = JSON.parse(local);
          setNotes(parsed);
          if (parsed.length > 0) {
            setActiveNoteId(parsed[0].id);
            setTitle(parsed[0].title || '');
            setContent(parsed[0].content || '');
          }
        } else {
          setNotes([]);
          setActiveNoteId(null);
          setTitle('');
          setContent('');
        }
      } catch {
        setNotes([]);
      }
    };

    loadNotes();
  }, [isOpen, user]);

  if (!isOpen) return null;

  // Handle selecting a note from list
  const handleSelectNote = (n) => {
    setActiveNoteId(n.id);
    setTitle(n.title || '');
    setContent(n.content || '');
    setMessage('');
  };

  // Create a new empty note
  const handleCreateNote = () => {
    const newId = 'note_' + Date.now();
    const newNote = {
      id: newId,
      title: 'Untitled Note',
      content: '',
      updatedAt: new Date().toISOString()
    };
    setNotes(prev => [newNote, ...prev]);
    setActiveNoteId(newId);
    setTitle(newNote.title);
    setContent(newNote.content);
    setMessage('');
  };

  // Save current active note to Firebase Firestore or localStorage
  const handleSaveNote = async () => {
    if (!activeNoteId) return;
    setSaving(true);
    setMessage('');

    const nowIso = new Date().toISOString();
    const updatedNote = {
      id: activeNoteId,
      title: title.trim() || 'Untitled Note',
      content: content,
      updatedAt: nowIso
    };

    // Update state list
    setNotes(prev => prev.map(n => n.id === activeNoteId ? updatedNote : n));

    if (user && user.uid) {
      try {
        const docRef = doc(db, 'users', user.uid, 'user_notes', activeNoteId);
        await setDoc(docRef, {
          title: updatedNote.title,
          content: updatedNote.content,
          updatedAt: serverTimestamp()
        }, { merge: true });
        setMessage('Saved to Firebase!');
      } catch (err) {
        console.error('Error saving to Firestore:', err);
        setMessage('Saved locally');
      }
    } else {
      // Save locally
      try {
        const existing = JSON.parse(localStorage.getItem('vg_user_notes') || '[]');
        const idx = existing.findIndex(n => n.id === activeNoteId);
        if (idx >= 0) existing[idx] = updatedNote;
        else existing.unshift(updatedNote);
        localStorage.setItem('vg_user_notes', JSON.stringify(existing));
        setMessage('Saved locally');
      } catch (e) {
        console.error('Error saving to localStorage:', e);
      }
    }

    setSaving(false);
    setTimeout(() => setMessage(''), 3000);
  };

  // Delete current active note
  const handleDeleteNote = async (idToDelete) => {
    const targetId = idToDelete || activeNoteId;
    if (!targetId) return;

    const remaining = notes.filter(n => n.id !== targetId);
    setNotes(remaining);

    if (remaining.length > 0) {
      setActiveNoteId(remaining[0].id);
      setTitle(remaining[0].title || '');
      setContent(remaining[0].content || '');
    } else {
      setActiveNoteId(null);
      setTitle('');
      setContent('');
    }

    if (user && user.uid) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'user_notes', targetId));
      } catch (err) {
        console.error('Error deleting from Firestore:', err);
      }
    } else {
      try {
        localStorage.setItem('vg_user_notes', JSON.stringify(remaining));
      } catch (e) {
        console.error('Error deleting from localStorage:', e);
      }
    }
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(search.toLowerCase()) || 
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: 'var(--bg-glass-card, rgba(13, 19, 36, 0.95))',
          border: '1px solid var(--border-glass, rgba(255, 255, 255, 0.15))',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '900px',
          height: '82vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.4rem' }}>📝</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                My Personal Notes
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                {user ? (
                  <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                    Synced to Firebase Cloud ({user.email})
                  </span>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: '#f59e0b', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    💾 Local Storage (Guest)
                    <button 
                      onClick={onOpenAuth}
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 0, textDecoration: 'underline', fontSize: '0.75rem', marginLeft: '4px' }}
                    >
                      Sign In to Cloud Sync
                    </button>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleCreateNote}
              className="btn btn-primary"
              style={{ padding: '0.4rem 0.9rem', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              ➕ New Note
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-secondary)',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.1rem'
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body Split View */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          
          {/* Left Notes Sidebar */}
          <div style={{ width: '280px', borderRight: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', background: 'rgba(0, 0, 0, 0.2)', flexShrink: 0 }}>
            {/* Search Box */}
            <div style={{ padding: '0.75rem' }}>
              <input
                type="text"
                className="search-input"
                placeholder="Search notes..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ fontSize: '0.82rem', padding: '0.45rem 0.75rem 0.45rem 2rem', width: '100%' }}
              />
            </div>

            {/* Notes List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 0.5rem 0.5rem' }}>
              {loading ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Loading notes...
                </div>
              ) : filteredNotes.length === 0 ? (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  {search ? 'No matching notes' : 'No notes created yet. Click "➕ New Note" to start!'}
                </div>
              ) : (
                filteredNotes.map(n => {
                  const isActive = n.id === activeNoteId;
                  return (
                    <div
                      key={n.id}
                      onClick={() => handleSelectNote(n)}
                      style={{
                        padding: '0.65rem 0.85rem',
                        borderRadius: '10px',
                        marginBottom: '4px',
                        cursor: 'pointer',
                        background: isActive ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                        border: isActive ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid transparent',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <h4 style={{ margin: '0 0 0.2rem', fontSize: '0.88rem', color: isActive ? 'var(--primary)' : 'var(--text-primary)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {n.title || 'Untitled Note'}
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', opacity: 0.8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {n.content ? n.content.substring(0, 45) : 'Empty note...'}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Editor Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1.25rem', overflowY: 'auto' }}>
            {activeNoteId ? (
              <>
                {/* Note Title Input & Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
                  <input
                    type="text"
                    placeholder="Note Title..."
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: 'none',
                      borderBottom: '1px solid var(--border-glass)',
                      color: 'var(--text-primary)',
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      padding: '0.35rem 0',
                      outline: 'none'
                    }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {message && (
                      <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>
                        ✓ {message}
                      </span>
                    )}
                    <button
                      onClick={handleSaveNote}
                      disabled={saving}
                      className="btn btn-primary"
                      style={{ padding: '0.4rem 1rem', fontSize: '0.82rem' }}
                    >
                      {saving ? 'Saving...' : '💾 Save'}
                    </button>
                    <button
                      onClick={() => handleDeleteNote(activeNoteId)}
                      className="btn btn-secondary"
                      style={{ padding: '0.4rem 0.85rem', fontSize: '0.82rem', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                      title="Delete Note"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Content Textarea */}
                <textarea
                  placeholder="Write your personal notes, code snippets, key points, or placement prep reminders here..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  style={{
                    flex: 1,
                    minHeight: '280px',
                    background: 'rgba(0, 0, 0, 0.2)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '10px',
                    color: 'var(--text-primary)',
                    padding: '1rem',
                    fontSize: '0.92rem',
                    lineHeight: 1.6,
                    resize: 'none',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                />
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                <span style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📝</span>
                <p style={{ margin: 0, fontSize: '0.95rem' }}>Select a note from the left list or create a new note!</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
