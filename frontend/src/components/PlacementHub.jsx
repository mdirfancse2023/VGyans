import React, { useState } from 'react';
import PDFViewer from './PDFViewer';

const highlightCode = (codeText, lang) => {
  if (!codeText) return '';
  let escaped = codeText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  let tokenRegex;
  if (lang === 'python') {
    tokenRegex = /(#.*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b\w+\b|[^\s\w]+|\s+)/g;
  } else if (lang === 'java' || lang === 'cpp') {
    tokenRegex = /(\/\/.*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b\w+\b|[^\s\w]+|\s+)/g;
  } else if (lang === 'sql') {
    tokenRegex = /(--.*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b\w+\b|[^\s\w]+|\s+)/g;
  } else {
    tokenRegex = /(\b\w+\b|[^\s\w]+|\s+)/g;
  }

  const pythonKeywords = new Set(['def', 'class', 'import', 'from', 'as', 'return', 'if', 'elif', 'else', 'for', 'in', 'while', 'try', 'except', 'pass', 'print', 'and', 'or', 'not', 'is', 'lambda', 'with', 'yield', 'None', 'True', 'False']);
  const cppKeywords = new Set(['public', 'private', 'protected', 'class', 'interface', 'extends', 'implements', 'import', 'package', 'return', 'if', 'else', 'for', 'while', 'do', 'void', 'int', 'double', 'float', 'char', 'boolean', 'long', 'static', 'final', 'new', 'this', 'super', 'override', 'include', 'using', 'namespace', 'cout', 'cin', 'endl', 'vector', 'unordered_map', 'string', 'const', 'virtual']);
  const sqlKeywords = new Set(['SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'ON', 'GROUP', 'BY', 'HAVING', 'ORDER', 'LIMIT', 'OFFSET', 'SUM', 'MAX', 'MIN', 'AVG', 'COUNT', 'AS', 'AND', 'OR', 'IN', 'INSERT', 'INTO', 'VALUES', 'CREATE', 'TABLE', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES']);

  const tokens = escaped.match(tokenRegex) || [escaped];
  
  return tokens.map(token => {
    // Unescape entities for internal regex checks
    const rawToken = token
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&');

    if (rawToken.startsWith('#') || rawToken.startsWith('//') || rawToken.startsWith('--')) {
      return `<span style="color: #64748b; font-style: italic;">${token}</span>`;
    }
    if ((rawToken.startsWith('"') && rawToken.endsWith('"')) || (rawToken.startsWith("'") && rawToken.endsWith("'"))) {
      return `<span style="color: #a7f3d0;">${token}</span>`;
    }
    if (/^\d+$/.test(rawToken)) {
      return `<span style="color: #f59e0b;">${token}</span>`;
    }
    if (lang === 'python' && pythonKeywords.has(rawToken)) {
      return `<span style="color: #60a5fa; font-weight: 700;">${token}</span>`;
    }
    if ((lang === 'java' || lang === 'cpp') && cppKeywords.has(rawToken)) {
      return `<span style="color: #60a5fa; font-weight: 700;">${token}</span>`;
    }
    if (lang === 'sql') {
      const upperToken = rawToken.toUpperCase();
      if (sqlKeywords.has(upperToken)) {
        return `<span style="color: #38bdf8; font-weight: 700;">${token}</span>`;
      }
    }
    return token;
  }).join('');
};

const detectLanguage = (title) => {
  const t = title.toLowerCase();
  if (t.includes('python')) return 'python';
  if (t.includes('sql') || t.includes('database')) return 'sql';
  return 'java'; // general C/C++/Java highlighting
};

function BlogReader({ note, onClose }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);

  const handleCopyCode = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const isBook = note.chapters && note.chapters.length > 0;
  const activeChapter = isBook ? note.chapters[activeChapterIndex] : null;
  const contentToRender = isBook ? (activeChapter ? activeChapter.content : []) : (note.content || []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: isFullscreen ? '0' : '2rem',
      transition: 'all 0.3s ease'
    }}>
      <style>{`
        .blog-modal-container {
          background: rgba(30, 41, 59, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          width: 100%;
          max-width: 900px;
          height: 100%;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4);
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .blog-modal-container.book-mode {
          max-width: 1250px;
        }
        .blog-modal-container.fullscreen {
          max-width: 100vw;
          max-height: 100vh;
          height: 100vh;
          border-radius: 0;
          border: none;
        }
        .blog-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 2rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(15, 23, 42, 0.4);
        }
        .blog-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #f8fafc;
          margin: 0;
        }
        .blog-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .blog-control-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #94a3b8;
          border-radius: 8px;
          padding: 0.5rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        .blog-control-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #f8fafc;
        }
        .blog-body-wrapper {
          display: flex;
          flex: 1;
          overflow: hidden;
        }
        .blog-sidebar {
          width: 320px;
          border-right: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(15, 23, 42, 0.25);
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }
        .blog-sidebar-title {
          padding: 1.25rem 1.5rem 0.75rem;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748b;
          font-weight: 700;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
        }
        .blog-sidebar-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
        }
        .blog-sidebar-item {
          padding: 1rem 1.5rem;
          cursor: pointer;
          font-size: 0.9rem;
          color: #94a3b8;
          border-left: 3px solid transparent;
          transition: all 0.2s ease;
          text-align: left;
          background: transparent;
          border-top: none;
          border-right: none;
          border-bottom: 1px solid rgba(255, 255, 255, 0.02);
          width: 100%;
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .blog-sidebar-item:hover {
          background: rgba(255, 255, 255, 0.02);
          color: #f8fafc;
        }
        .blog-sidebar-item.active {
          background: rgba(6, 182, 212, 0.08);
          color: var(--primary);
          border-left-color: var(--primary);
          font-weight: 600;
        }
        .blog-content-area {
          flex: 1;
          overflow-y: auto;
          padding: 2.5rem 3rem;
          background: rgba(15, 23, 42, 0.1);
        }
        .blog-h1 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0284c7;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
          border-left: 4px solid #0284c7;
          padding-left: 0.75rem;
        }
        .blog-p {
          font-size: 1.05rem;
          line-height: 1.7;
          color: #cbd5e1;
          margin-bottom: 1.25rem;
        }
        .blog-image-container {
          text-align: center;
          margin: 2rem 0;
          padding: 1.5rem;
          background: rgba(15, 23, 42, 0.4);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .blog-image {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
        }
        .blog-code-container {
          position: relative;
          margin-bottom: 1.5rem;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: #0f172a;
        }
        .blog-code-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.03);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          font-family: monospace;
          font-size: 0.8rem;
          color: #64748b;
        }
        .blog-code-pre {
          margin: 0;
          padding: 1.25rem;
          overflow-x: auto;
          font-family: 'Courier New', Courier, monospace;
          font-size: 0.9rem;
          line-height: 1.5;
          color: #e2e8f0;
        }
        .blog-copy-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #94a3b8;
          border-radius: 4px;
          padding: 0.25rem 0.5rem;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .blog-copy-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #f8fafc;
        }
        @media (max-width: 900px) {
          .blog-body-wrapper {
            flex-direction: column !important;
          }
          .blog-sidebar {
            width: 100% !important;
            max-height: 180px !important;
            border-right: none !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
          }
        }
      `}</style>
      <div className={`blog-modal-container ${isBook ? 'book-mode' : ''} ${isFullscreen ? 'fullscreen' : ''}`}>
        <div className="blog-header">
          <h3 className="blog-title">{note.title}</h3>
          <div className="blog-controls">
            <button className="blog-control-btn" onClick={() => setIsFullscreen(!isFullscreen)} title="Toggle Fullscreen">
              {isFullscreen ? (
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7"></path>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"></path>
                </svg>
              )}
            </button>
            <button className="blog-control-btn" onClick={onClose} title="Close Notes">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <div className="blog-body-wrapper">
          {isBook && (
            <div className="blog-sidebar">
              <div className="blog-sidebar-title">Book Chapters</div>
              <div className="blog-sidebar-list">
                {note.chapters.map((ch, idx) => (
                  <button
                    key={idx}
                    className={`blog-sidebar-item ${activeChapterIndex === idx ? 'active' : ''}`}
                    onClick={() => setActiveChapterIndex(idx)}
                    title={ch.title}
                  >
                    {ch.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="blog-content-area">
            {contentToRender.map((block, index) => {
              if (block.type === 'h1') {
                return <h2 key={index} className="blog-h1">{block.text}</h2>;
              } else if (block.type === 'body') {
                return <p key={index} className="blog-p" dangerouslySetInnerHTML={{ __html: block.text }} />;
              } else if (block.type === 'image') {
                return (
                  <div key={index} className="blog-image-container">
                    <img src={block.text} alt="Diagram" className="blog-image" />
                  </div>
                );
              } else if (block.type === 'code') {
                const lang = detectLanguage(note.title);
                return (
                  <div key={index} className="blog-code-container">
                    <div className="blog-code-header">
                      <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>{lang} Snippet</span>
                      <button className="blog-copy-btn" onClick={() => handleCopyCode(block.text, index)}>
                        {copiedIndex === index ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <pre className="blog-code-pre"><code dangerouslySetInnerHTML={{ __html: highlightCode(block.text, lang) }} /></pre>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PlacementHub({ resources, notes, onboardingStages = {}, flashcards = [] }) {
  const [activeSection, setActiveSection] = useState('resources');
  const [activePdf, setActivePdf] = useState(null);
  const [activeNote, setActiveNote] = useState(null);

  // Tracker state
  const [trackerCompany, setTrackerCompany] = useState('');
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  // Flashcard state
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const fcCategories = [
    'All',
    'Spring Boot',
    'System Design',
    'Java',
    'SQL',
    'Microservices',
    'Rest API',
    'React',
    'Angular'
  ];
  const filteredCards = flashcards.filter(c =>
    selectedCategory === 'All' ? true : c.category.toLowerCase() === selectedCategory.toLowerCase()
  );
  const currentCard = filteredCards[currentCardIndex];

  const handleNextCard = () => { setIsFlipped(false); setTimeout(() => setCurrentCardIndex(p => (p + 1) % filteredCards.length), 150); };
  const handlePrevCard = () => { setIsFlipped(false); setTimeout(() => setCurrentCardIndex(p => (p - 1 + filteredCards.length) % filteredCards.length), 150); };
  const handleCatChange = (cat) => { setSelectedCategory(cat); setCurrentCardIndex(0); setIsFlipped(false); };

  const companyKeys = Object.keys(onboardingStages);
  const activeTrackerCompany = trackerCompany || companyKeys[0] || '';
  const activeStages = onboardingStages[activeTrackerCompany] || [];

  const handleAction = (res) => {
    const targetUrl = res.downloadUrl || '#';
    if (targetUrl.startsWith('/notes/')) {
      const noteId = targetUrl.split('/').pop();
      const foundNote = notes?.find(n => n.id === noteId);
      if (foundNote) { setActiveNote(foundNote); return; }
      const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000' : '');
      fetch(`${API_URL}/api/notes/${noteId}`)
        .then(r => { if (r.ok) return r.json(); throw new Error('Note not found'); })
        .then(data => setActiveNote(data))
        .catch(() => alert('Unable to load this note blog. Please check your connection.'));
      return;
    }
    let pdfUrl = targetUrl;
    if (!pdfUrl || pdfUrl === '#') pdfUrl = '/pdfs/placeholder.pdf';
    const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000' : '');
    const proxyUrl = (pdfUrl.startsWith('/') || pdfUrl.startsWith('./')) ? pdfUrl : `${API_URL}/api/pdf-proxy?url=${encodeURIComponent(pdfUrl)}`;
    setActivePdf({ url: proxyUrl, title: res.title });
  };

  const [selectedResourceTab, setSelectedResourceTab] = useState('All');
  const resourceCategories = [
    'All',
    'Spring Boot',
    'System Design',
    'Java',
    'SQL',
    'Microservices',
    'Rest API',
    'React',
    'Angular'
  ];

  const filteredResources = resources.filter(res => {
    if (selectedResourceTab === 'All') return true;
    const query = selectedResourceTab.toLowerCase();
    
    // Check if tags match exactly or as substring
    if (res.tags && res.tags.some(tag => tag.toLowerCase().includes(query) || query.includes(tag.toLowerCase()))) return true;

    // Check if title or description contains the query
    if (res.title && res.title.toLowerCase().includes(query)) return true;
    if (res.description && res.description.toLowerCase().includes(query)) return true;

    // Check if category matches
    if (res.category && res.category.toLowerCase().includes(query)) return true;

    // Special matching rules for Rest API
    if (query === 'rest api') {
      const isRest = res.tags && res.tags.some(tag => {
        const t = tag.toLowerCase();
        return t === 'rest' || t === 'api' || t === 'rest api' || t === 'rest-api';
      });
      if (isRest) return true;
      if (res.title && (res.title.toLowerCase().includes('rest') || res.title.toLowerCase().includes('api'))) return true;
    }
    
    return false;
  });

  return (
    <div style={{ marginBottom: '3rem' }}>
      {/* Compact section header */}
      <div className="section-header">
        <div className="section-info">
          <h2 className="section-title">
            Placement Prep <span className="text-gradient">Hub &amp; Resources</span>
          </h2>
          <p className="section-desc">
            Study materials, onboarding tracker, and technical flashcards — all in one place.
          </p>
        </div>
      </div>

      {/* Section Tab Switcher */}
      <div className="filters-wrapper" style={{ marginBottom: '0.5rem' }}>
        <div className="filter-tabs" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
          <button
            className={`filter-tab ${activeSection === 'resources' ? 'active' : ''}`}
            onClick={() => setActiveSection('resources')}
            style={{ fontSize: '0.9rem', fontWeight: 600 }}
          >
            📚 Resources
          </button>
          <button
            className={`filter-tab ${activeSection === 'tracker' ? 'active' : ''}`}
            onClick={() => setActiveSection('tracker')}
            style={{ fontSize: '0.9rem', fontWeight: 600 }}
          >
            🗺️ Onboarding Tracker
          </button>
          <button
            className={`filter-tab ${activeSection === 'flashcards' ? 'active' : ''}`}
            onClick={() => setActiveSection('flashcards')}
            style={{ fontSize: '0.9rem', fontWeight: 600 }}
          >
            ❓ Questions
          </button>
        </div>
      </div>

      {/* ── RESOURCES ── */}
      {activeSection === 'resources' && (
        <>
          <div className="sub-filter-tabs" style={{ flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1.5rem', justifyContent: 'flex-start' }}>
            {resourceCategories.map((cat) => (
              <button
                key={cat}
                className={`sub-filter-tab ${selectedResourceTab === cat ? 'active' : ''}`}
                onClick={() => setSelectedResourceTab(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid-container">
            {filteredResources.map((res) => {
              const isBlog = res.downloadUrl && res.downloadUrl.startsWith('/notes/');
              return (
                <div key={res.id} className="glass-card resource-card">
                  <div className="resource-header">
                    <span className="badge badge-primary">{res.company}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{res.category}</span>
                  </div>
                  <h3 className="resource-title">{res.title}</h3>
                  <p className="resource-desc">{res.description}</p>
                  <div className="resource-tags">
                    {res.tags.map((tag) => (
                      <span key={tag} className="badge badge-secondary" style={{ fontSize: '0.65rem' }}>#{tag}</span>
                    ))}
                  </div>
                  <div className="resource-action">
                    <button className="btn btn-secondary" style={{ width: '100%', gap: '0.5rem', cursor: 'pointer' }} onClick={(e) => { e.preventDefault(); handleAction(res); }}>
                      {isBlog ? (
                        <><svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>Read Study Blog</>
                      ) : (
                        <><svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>View PDF Resource</>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── ONBOARDING TRACKER ── */}

      {activeSection === 'tracker' && (
        <>
          <div className="sub-filter-tabs" style={{ flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1.5rem', justifyContent: 'flex-start' }}>
            {companyKeys.map((comp) => (
              <button
                key={comp}
                className={`sub-filter-tab ${activeTrackerCompany === comp ? 'active' : ''}`}
                onClick={() => { setTrackerCompany(comp); setCurrentStageIndex(0); }}
              >
                {comp}
              </button>
            ))}
          </div>

          <div className="glass-panel tracker-container">
            {companyKeys.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>No onboarding data available.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem' }}>
                <div className="timeline">
                  {activeStages.map((stage, idx) => (
                    <div key={idx} className="timeline-item" style={{ cursor: 'pointer', opacity: currentStageIndex === idx ? 1 : 0.6 }} onClick={() => setCurrentStageIndex(idx)}>
                      <div className="timeline-dot" style={{ borderColor: currentStageIndex === idx ? 'var(--primary)' : 'var(--border-glass)', background: currentStageIndex === idx ? 'var(--primary)' : 'rgba(255,255,255,0.1)' }}></div>
                      <div className="timeline-title">{stage.stage}<span className="badge badge-success" style={{ fontSize: '0.65rem' }}>{stage.duration}</span></div>
                      <div className="timeline-desc">{stage.desc.substring(0, 80)}...</div>
                    </div>
                  ))}
                </div>
                <div className="glass-card" style={{ background: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', height: 'fit-content' }}>
                  <div className="badge badge-primary" style={{ marginBottom: '1rem', width: 'fit-content' }}>Stage Details & Advice</div>
                  {activeStages[currentStageIndex] && (
                    <>
                      <h3 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>{activeStages[currentStageIndex].stage}</h3>
                      <div style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '1rem' }}>Duration: {activeStages[currentStageIndex].duration}</div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>{activeStages[currentStageIndex].desc}</p>
                      <div style={{ background: 'rgba(6,182,212,0.05)', borderLeft: '3px solid var(--primary)', padding: '1rem', borderRadius: '0 8px 8px 0', fontSize: '0.85rem' }}>
                        <strong>Pro Gyan Tip:</strong> If your files have been in verification for more than {activeStages[currentStageIndex].duration}, reach out to support or check your onboarding dashboard for action items.
                      </div>
                    </>
                  )}
                </div>
              </div>
            )
          }
        </div>
      </>
      )}

      {/* ── FLASHCARDS ── */}
      {activeSection === 'flashcards' && (
        <>
          <div className="sub-filter-tabs" style={{ flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1.5rem', justifyContent: 'flex-start' }}>
            {fcCategories.map((cat) => (
              <button
                key={cat}
                className={`sub-filter-tab ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => handleCatChange(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="glass-panel flashcards-container">
            {filteredCards.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No flashcards found for this category.</div>
          ) : (
            <>
              <div className={`flashcard-stage ${isFlipped ? 'flipped' : ''}`} onClick={() => setIsFlipped(!isFlipped)}>
                <div className="flashcard-inner">
                  <div className="flashcard-front">
                    <span className="flashcard-tag">{currentCard.category}</span>
                    <h3 className="flashcard-question">{currentCard.question}</h3>
                    <div className="flashcard-hint">Click card to reveal answer</div>
                  </div>
                  <div className="flashcard-back">
                    <span className="flashcard-tag" style={{ color: 'var(--secondary)' }}>Answer</span>
                    <p className="flashcard-answer">{currentCard.answer}</p>
                    <div className="flashcard-hint" style={{ color: 'var(--secondary)' }}>Click card to see question</div>
                  </div>
                </div>
              </div>
              <div className="flashcard-controls">
                <button className="btn btn-secondary" onClick={handlePrevCard}>← Previous</button>
                <span className="flashcard-progress">Question {currentCardIndex + 1} of {filteredCards.length}</span>
                <button className="btn btn-secondary" onClick={handleNextCard}>Next →</button>
              </div>
            </>
          )}
        </div>
      </>
      )}

      {activePdf && <PDFViewer url={activePdf.url} title={activePdf.title} onClose={() => setActivePdf(null)} />}
      {activeNote && <BlogReader note={activeNote} onClose={() => setActiveNote(null)} />}
    </div>
  );
}
