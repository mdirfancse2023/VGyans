import React, { useState } from 'react';

export default function JobPlacementCard({ flashcards }) {
  const cards = (flashcards && flashcards.length > 0) ? flashcards : [
    { category: 'Operating Systems', question: 'What is the main difference between Process and Thread?', answer: 'A Process has its own independent address space, memory, and resources. A Thread is a lightweight execution unit within a process that shares memory and resources with sibling threads.' },
    { category: 'DBMS', question: 'Explain ACID Properties in Relational Databases.', answer: 'Atomicity (all or nothing), Consistency (valid state transitions), Isolation (concurrent transactions do not collide), and Durability (committed data persists permanently).' },
    { category: 'System Design', question: 'What is Rate Limiting and how is Token Bucket Algorithm implemented?', answer: 'Rate limiting controls incoming network traffic. Token bucket adds tokens at a constant rate; requests consume tokens. If empty, requests are dropped or queued.' }
  ];

  const categories = ['All', ...Array.from(new Set(cards.map(c => c.category)))];
  const [selectedCat, setSelectedCat] = useState('All');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const filteredCards = selectedCat === 'All' ? cards : cards.filter(c => c.category === selectedCat);
  const currentCard = filteredCards[currentIndex] || cards[0];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
  };

  return (
    <div>
      <div className="sub-filter-tabs" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`sub-filter-tab ${selectedCat === cat ? 'active' : ''}`}
            onClick={() => { setSelectedCat(cat); setCurrentIndex(0); setIsFlipped(false); }}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: '10px',
              background: selectedCat === cat ? 'var(--secondary)' : 'rgba(255, 255, 255, 0.05)',
              border: selectedCat === cat ? '1px solid var(--secondary)' : '1px solid var(--border-glass)',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            🏷️ {cat}
          </button>
        ))}
      </div>

      <div className="glass-panel flashcards-container" style={{ padding: '2.5rem', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'center' }}>
        <div 
          onClick={() => setIsFlipped(!isFlipped)}
          style={{
            minHeight: '220px',
            background: isFlipped ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)' : 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)',
            border: isFlipped ? '2px solid rgba(168, 85, 247, 0.4)' : '2px solid rgba(6, 182, 212, 0.4)',
            borderRadius: '16px',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            marginBottom: '1.5rem',
            transition: 'all 0.3s ease'
          }}
        >
          <span className="badge badge-primary" style={{ marginBottom: '1rem', fontWeight: 700 }}>
            {isFlipped ? '💡 Answer Revealed' : `🧠 Question (${currentCard.category})`}
          </span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 1rem 0', maxWidth: '700px', lineHeight: 1.4 }}>
            {isFlipped ? currentCard.answer : currentCard.question}
          </h3>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>
            {isFlipped ? 'Click to view question' : 'Click card to flip & reveal answer'}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.5rem' }}>
          <button className="btn btn-secondary" onClick={handlePrev} style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 700 }}>
            ← Previous
          </button>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
            Card {currentIndex + 1} of {filteredCards.length}
          </span>
          <button className="btn btn-secondary" onClick={handleNext} style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 700 }}>
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
