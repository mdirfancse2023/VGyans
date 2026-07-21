import React, { useState, useEffect } from 'react';

const CATEGORIES = [
  { id: 'all', label: '🌐 All News' },
  { id: 'ai', label: '🤖 AI & Machine Learning' },
  { id: 'dev', label: '💻 Software Engineering' },
  { id: 'careers', label: '💼 Career & Placement' },
  { id: 'startups', label: '🚀 Startups & Tech' },
  { id: 'gadgets', label: '⚡ Innovation & Hardware' }
];

const INITIAL_NEWS = [
  {
    id: 'news-1',
    title: 'OpenAI Unveils Next-Gen Reasoning Models for Autonomous Software Engineering',
    category: 'ai',
    categoryName: 'AI & Machine Learning',
    source: 'TechCrunch AI',
    author: 'Sarah Jenkins',
    publishedAt: '10 mins ago',
    readTime: '4 min read',
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    summary: 'A new breakthrough in neural reasoning enables AI models to debug codebase architectures and build full-stack web applications autonomously.',
    content: `Artificial intelligence research has reached another significant milestone today with the launch of advanced reasoning architecture designed specifically for software engineers and systems developers.

### Key Highlights & Technical Capabilities:
• **Complex Debugging**: Capable of tracing multi-file dependency trees to identify edge-case race conditions and memory leaks.
• **Automated Code Reviews**: Performs automated security audits adhering to OWASP standards before deployment.
• **Context Window Expansion**: Native 1-million token context window allows processing entire repositories simultaneously.

### Industry Impact
Top engineering teams across Silicon Valley have reported up to a 60% reduction in code refactoring overhead during initial trials. The system integrates directly with modern CI/CD pipelines, allowing developers to generate automated pull requests with unit tests included.`
  },
  {
    id: 'news-2',
    title: 'Top 10 Tech Skills Tech Recruiters Are Looking For in 2026 Campus Placements',
    category: 'careers',
    categoryName: 'Career & Placement',
    source: 'Virtual Gyans Insights',
    author: 'Irfan M.',
    publishedAt: '25 mins ago',
    readTime: '5 min read',
    coverUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    summary: 'Comprehensive analysis of hiring trends across Tier-1 & Tier-2 engineering colleges for full-stack, AI engineering, and cloud infrastructure roles.',
    content: `As the hiring landscape shifts towards specialized engineering domain expertise, companies are seeking candidates who demonstrate practical problem-solving skills alongside solid computer science fundamentals.

### Top Skills Demand Breakdown:
1. **Data Structures & System Design**: Scalable distributed system design and algorithmic efficiency remain mandatory for Tier-1 engineering roles.
2. **Cloud-Native Architecture**: Hands-on experience with Docker, Kubernetes, Serverless, and AWS/GCP data pipelines.
3. **AI Integration APIs**: Building LLM-powered applications using modern vector databases (Pinecone, PGVector) and RAG pipelines.
4. **Full-Stack Proficiency**: React 19, Next.js, Node.js, and Python backend services.

### Preparation Advice for Students
Recruiters emphasize building 2-3 production-ready full-stack projects rather than generic tutorial clones. Having clean git commit histories and live hosted demos gives candidates a massive edge in interviews.`
  },
  {
    id: 'news-3',
    title: 'React 19 Official Release: Compiler-Driven Optimization & Native Server Actions',
    category: 'dev',
    categoryName: 'Software Engineering',
    source: 'Frontend Weekly',
    author: 'David Miller',
    publishedAt: '1 hour ago',
    readTime: '6 min read',
    coverUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80',
    summary: 'The React team introduces automatic memoization via the new React Compiler, eliminating hand-crafted useMemo and useCallback hooks.',
    content: `The core React framework has officially released version 19, marking one of the biggest architectural shifts in component state management and frontend rendering performance.

### Major Features in React 19:
• **React Compiler**: Automatically optimizes component renders. You no longer need to manually write useMemo or useCallback hooks.
• **Server Actions**: Direct form submission and data mutations integrated seamlessly into server components without boilerplate APIs.
• **Asset Loading Controls**: Background resource prefetching for fonts and stylesheets directly integrated into document head context.

### What This Means for Developers
Build sizes decrease, runtime performance improves dramatically, and component code becomes significantly cleaner without boilerplate optimization code.`
  },
  {
    id: 'news-4',
    title: 'Quantum Computing Startup Achieves 1,000 Logical Qubit Benchmark Breakthrough',
    category: 'startups',
    categoryName: 'Startups & Tech',
    source: 'VentureTech',
    author: 'Elena Rostova',
    publishedAt: '2 hours ago',
    readTime: '4 min read',
    coverUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80',
    summary: 'Fault-tolerant quantum computing reaches a new threshold with error rates dropping below 0.001%, opening doors for drug discovery and cryptography.',
    content: `A leading quantum startup backed by top silicon valley investors has unveiled a 1,000 fault-tolerant logical qubit processor using trapped-ion technology.

### Breakthrough Highlights:
• **Error Mitigation**: Quantum error correction algorithms keep coherence times high enough for deep molecular simulation.
• **Commercial Applications**: Early partners in pharmaceutical research are utilizing the hardware to model complex protein folding interactions in hours instead of years.
• **Cybersecurity Readiness**: Accelerates the transition toward Post-Quantum Cryptography (PQC) standards for cloud security.`
  },
  {
    id: 'news-5',
    title: 'RISC-V Architecture Gains 40% Market Share in Embedded & Edge AI Devices',
    category: 'gadgets',
    categoryName: 'Innovation & Hardware',
    source: 'Hardware Times',
    author: 'Alex Rivera',
    publishedAt: '3 hours ago',
    readTime: '3 min read',
    coverUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    summary: 'Open-source instruction set architecture RISC-V sees massive adoption among semiconductor giants for low-power edge AI microcontrollers.',
    content: `The open-source hardware movement continues its exponential growth as major chip manufacturers transition smart devices and automotive microcontrollers to custom RISC-V silicon designs.

### Key Factors Driving Adoption:
1. **Zero Royalty Licensing**: Eliminates expensive architecture licensing fees.
2. **Custom Vector Extensions**: Allows hardware designers to add custom matrix-multiplication blocks tailored for neural networks.
3. **Global Ecosystem**: Over 3,000 corporate members contributing to compiler toolchains and Linux kernel optimizations.`
  },
  {
    id: 'news-6',
    title: 'System Design Interview Guide: Building High-Throughput Distributed Caches',
    category: 'careers',
    categoryName: 'Career & Placement',
    source: 'Virtual Gyans Tech',
    author: 'Tech Mentors',
    publishedAt: '4 hours ago',
    readTime: '7 min read',
    coverUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    summary: 'Learn key architectural principles behind Memcached and Redis: Consistent Hashing, LRU Eviction, and Distributed Replication.',
    content: `System design interviews for Senior and SDE-2 roles frequently test a candidate's ability to architect distributed caching systems capable of handling millions of requests per second.

### Step-by-Step Architecture Checklist:
• **Consistent Hashing**: Minimizes key remapping when adding or removing cache nodes across clusters.
• **Eviction Policies**: Implementing LRU (Least Recently Used) and LFU (Least Frequently Used) algorithms with O(1) time complexity.
• **Cache Stampede Prevention**: Using probabilistic early expiration (XFetch) or mutex locks to prevent database overload during cache misses.`
  }
];

export default function News() {
  const [newsList, setNewsList] = useState(INITIAL_NEWS);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNews, setSelectedNews] = useState(INITIAL_NEWS[0]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch real live dev news on component mount
  useEffect(() => {
    fetchLiveNews();
  }, []);

  const fetchLiveNews = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('https://dev.to/api/articles?top=7');
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data) && data.length > 0) {
          const formatted = data.map((art, idx) => ({
            id: `devto-${art.id}`,
            title: art.title,
            category: art.tag_list?.includes('ai') ? 'ai' : art.tag_list?.includes('career') ? 'careers' : 'dev',
            categoryName: art.tag_list?.[0]?.toUpperCase() || 'Software Engineering',
            source: art.user?.name ? `${art.user.name} on Dev.to` : 'Dev Community',
            author: art.user?.username || 'Tech Author',
            publishedAt: art.readable_publish_date || 'Recently',
            readTime: `${art.reading_time_minutes || 4} min read`,
            coverUrl: art.cover_image || art.social_image || INITIAL_NEWS[idx % INITIAL_NEWS.length].coverUrl,
            summary: art.description || art.title,
            content: `${art.description}\n\n### Article Insights:\n${art.tag_list?.map(t => `• **${t}**: Latest updates and technical perspectives in ${t}`).join('\n')}\n\nVisit original post for full interactive benchmarks and code repositories.`,
            canonicalUrl: art.url
          }));
          
          setNewsList(prev => [...formatted, ...INITIAL_NEWS]);
          setSelectedNews(formatted[0]);
        }
      }
    } catch (err) {
      console.log('Using curated tech news data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredNews = newsList.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.source.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 75px)', boxSizing: 'border-box', overflow: 'hidden' }}>
      
      {/* Top Header & Category Filter Bar */}
      <div style={{ marginBottom: '1rem', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>📰</span> Tech & Placement News
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
              Stay updated with software engineering trends, placement guides, AI breakthroughs & startups
            </p>
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative', minWidth: '240px' }}>
            <input
              type="text"
              placeholder="Search news by title or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.45rem 1rem 0.45rem 2.2rem',
                fontSize: '0.82rem',
                borderRadius: '20px',
                border: '1px solid var(--border-glass)',
                background: 'rgba(255, 255, 255, 0.04)',
                color: 'var(--text-primary)',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
            />
            <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              🔍
            </span>
          </div>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`btn ${selectedCategory === cat.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                padding: '0.35rem 0.85rem',
                fontSize: '0.78rem',
                borderRadius: '20px',
                background: selectedCategory === cat.id ? 'var(--primary)' : 'rgba(255, 255, 255, 0.03)',
                borderColor: selectedCategory === cat.id ? 'var(--primary)' : 'var(--border-glass)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split 2-Panel View: Left News List, Right News Reader Details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1.75fr', gap: '1.25rem', flexGrow: 1, overflow: 'hidden' }}>
        
        {/* Left Panel: News Articles List */}
        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box', overflow: 'hidden', borderRadius: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Showing {filteredNews.length} Tech Articles
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', overflowY: 'auto', flexGrow: 1, paddingRight: '0.35rem' }}>
            {filteredNews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No news articles found matching your search.
              </div>
            ) : (
              filteredNews.map(news => {
                const isSelected = selectedNews && selectedNews.id === news.id;
                return (
                  <div
                    key={news.id}
                    onClick={() => setSelectedNews(news)}
                    style={{
                      display: 'flex',
                      gap: '0.85rem',
                      padding: '0.75rem',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      background: isSelected ? 'rgba(6, 182, 212, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                      border: isSelected ? '1px solid var(--primary)' : '1px solid rgba(255, 255, 255, 0.05)',
                      boxShadow: isSelected ? '0 0 12px rgba(6, 182, 212, 0.2)' : 'none'
                    }}
                    className="news-card-item"
                  >
                    {/* Thumbnail */}
                    <img
                      src={news.coverUrl}
                      alt={news.title}
                      style={{ width: '84px', height: '64px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                      loading="lazy"
                    />

                    {/* Metadata & Title */}
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden', flexGrow: 1 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                          <span className="badge badge-secondary" style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem', borderRadius: '10px' }}>
                            {news.categoryName}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>• {news.publishedAt}</span>
                        </div>
                        <h4 style={{ fontSize: '0.85rem', color: isSelected ? 'var(--primary)' : 'var(--text-primary)', fontWeight: 600, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.35 }}>
                          {news.title}
                        </h4>
                      </div>

                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.35rem' }}>
                        <span>{news.source}</span>
                        <span>{news.readTime}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel: Active News Reader Details */}
        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box', overflowY: 'auto', borderRadius: '16px' }}>
          {selectedNews ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Cover Banner */}
              <div style={{ position: 'relative', width: '100%', height: '220px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                <img
                  src={selectedNews.coverUrl}
                  alt={selectedNews.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(7,10,19,0.9), transparent 60%)' }}></div>
                <div style={{ position: 'absolute', bottom: '1rem', left: '1.25rem', right: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-primary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', borderRadius: '12px', background: 'var(--primary)', color: '#000', fontWeight: 700 }}>
                    {selectedNews.categoryName}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.6)', padding: '0.2rem 0.6rem', borderRadius: '8px' }}>
                    📖 {selectedNews.readTime}
                  </span>
                </div>
              </div>

              {/* Title & Metadata */}
              <div>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.5rem 0', lineHeight: 1.35, fontFamily: 'var(--font-heading)' }}>
                  {selectedNews.title}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
                  <span>✍️ By <strong style={{ color: 'var(--text-primary)' }}>{selectedNews.author}</strong></span>
                  <span>📍 <strong style={{ color: 'var(--primary)' }}>{selectedNews.source}</strong></span>
                  <span>🕒 {selectedNews.publishedAt}</span>
                </div>
              </div>

              {/* News Summary Box */}
              <div style={{ background: 'rgba(6, 182, 212, 0.08)', borderLeft: '4px solid var(--primary)', padding: '0.85rem 1rem', borderRadius: '0 8px 8px 0', fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.55 }}>
                <strong>Executive Summary:</strong> {selectedNews.summary}
              </div>

              {/* Full Article Content */}
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                {selectedNews.content}
              </div>

              {/* External Link Action */}
              {selectedNews.canonicalUrl && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-glass)' }}>
                  <a
                    href={selectedNews.canonicalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.2rem', fontSize: '0.85rem', textDecoration: 'none' }}
                  >
                    Read Full Original Article on Dev.to ↗
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
              Select a news article from the left panel to read the full story.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
