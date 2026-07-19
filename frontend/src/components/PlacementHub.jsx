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

  const handleCopyCode = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

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
          background: rgba(30, 41, 59, 0.9);
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
        .blog-content-area {
          flex: 1;
          overflow-y: auto;
          padding: 2.5rem 3rem;
          background: rgba(15, 23, 42, 0.2);
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
      `}</style>
      <div className={`blog-modal-container ${isFullscreen ? 'fullscreen' : ''}`}>
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

        <div className="blog-content-area">
          {note.content && note.content.map((block, index) => {
            if (block.type === 'h1') {
              return <h2 key={index} className="blog-h1">{block.text}</h2>;
            } else if (block.type === 'body') {
              return <p key={index} className="blog-p" dangerouslySetInnerHTML={{ __html: block.text }} />;
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
  );
}

export default function PlacementHub({ resources, notes }) {
  const [selectedCompany, setSelectedCompany] = useState('All');
  const [activePdf, setActivePdf] = useState(null);
  const [activeNote, setActiveNote] = useState(null);

  const handleAction = (res) => {
    const targetUrl = res.downloadUrl || '#';
    
    // Check if it's a study note / blog
    if (targetUrl.startsWith('/notes/')) {
      const noteId = targetUrl.split('/').pop();
      const foundNote = notes?.find(n => n.id === noteId);
      if (foundNote) {
        setActiveNote(foundNote);
      } else {
        // Fetch note content from live API endpoint
        const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000' : '');
        fetch(`${API_URL}/api/notes/${noteId}`)
          .then(r => {
            if (r.ok) return r.json();
            throw new Error('Note not found');
          })
          .then(data => {
            setActiveNote(data);
          })
          .catch(() => {
            alert('Unable to load this note blog. Please check your connection.');
          });
      }
      return;
    }

    // PDF logic fallback
    let pdfUrl = targetUrl;
    if (!pdfUrl || pdfUrl === '#') {
      pdfUrl = '/pdfs/placeholder.pdf';
    }
    
    const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000' : '');
    let proxyUrl = '';
    if (pdfUrl.startsWith('/') || pdfUrl.startsWith('./')) {
      pdfUrl = pdfUrl;
    } else {
      proxyUrl = `${API_URL}/api/pdf-proxy?url=${encodeURIComponent(pdfUrl)}`;
    }
    
    setActivePdf({
      url: proxyUrl,
      title: res.title
    });
  };

  const companies = ['All', 'Cognizant', 'TCS', 'Accenture', 'All-Rounder'];

  const filteredResources = resources.filter(res => {
    if (selectedCompany === 'All') return true;
    if (selectedCompany === 'All-Rounder') return res.company.toLowerCase() === 'all';
    return res.company.toLowerCase() === selectedCompany.toLowerCase();
  });

  return (
    <div style={{ marginBottom: '3rem' }}>
      <div className="section-header" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="section-info" style={{ flex: '1 1 500px' }}>
          <h2 className="section-title">Placement Prep <span className="text-gradient">Hub & Resources</span></h2>
          <p className="section-desc">Get instant access to study blogs, cheat sheets, and blueprints for top MNCs.</p>
        </div>
      </div>

      <div className="filters-wrapper">
        <div className="filter-tabs">
          {companies.map((comp) => (
            <button
              key={comp}
              className={`filter-tab ${selectedCompany === comp ? 'active' : ''}`}
              onClick={() => setSelectedCompany(comp)}
            >
              {comp}
            </button>
          ))}
        </div>
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
                  <span key={tag} className="badge badge-secondary" style={{ fontSize: '0.65rem' }}>
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="resource-action">
                <button 
                  className="btn btn-secondary" 
                  style={{ width: '100%', gap: '0.5rem', cursor: 'pointer' }}
                  onClick={(e) => {
                    e.preventDefault();
                    handleAction(res);
                  }}
                >
                  {isBlog ? (
                    <>
                      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                      </svg>
                      Read Study Blog
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      View PDF Resource
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {activePdf && (
        <PDFViewer 
          url={activePdf.url} 
          title={activePdf.title} 
          onClose={() => setActivePdf(null)} 
        />
      )}

      {activeNote && (
        <BlogReader 
          note={activeNote} 
          onClose={() => setActiveNote(null)} 
        />
      )}
    </div>
  );
}
