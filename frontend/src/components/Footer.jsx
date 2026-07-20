import React from 'react';

export default function Footer({ setActiveTab }) {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-left">
          <h3>Virtual Gyans</h3>
          <p className="footer-copyright">&copy; {new Date().getFullYear()} Virtual Gyans. All rights reserved.</p>
        </div>
        
        <div className="footer-center">
          <a href="#home" onClick={(e) => { e.preventDefault(); setActiveTab('home'); }}>Home</a>
          <a href="#videos" onClick={(e) => { e.preventDefault(); setActiveTab('videos'); }}>Videos</a>
          <a href="#guides" onClick={(e) => { e.preventDefault(); setActiveTab('guides'); }}>Placement</a>
          <a href="#playground" onClick={(e) => { e.preventDefault(); setActiveTab('playground'); }}>Code</a>
          <a href="#experiences" onClick={(e) => { e.preventDefault(); setActiveTab('experiences'); }}>Interviews</a>
          <a href="#jobs" onClick={(e) => { e.preventDefault(); setActiveTab('jobs'); }}>Jobs</a>
          <a href="#tools" onClick={(e) => { e.preventDefault(); setActiveTab('tools'); }}>Resume</a>
        </div>

        <div className="footer-right">
          <a href="https://www.youtube.com/c/virtualgyans" target="_blank" rel="noopener noreferrer">YouTube</a>
          <a href="mailto:virtualgyans@gmail.com">Contact</a>
        </div>
      </div>
    </footer>
  );
}
