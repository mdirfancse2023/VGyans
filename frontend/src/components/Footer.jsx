import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-left">
          <h3>Virtual Gyans</h3>
          <p className="footer-copyright">&copy; {new Date().getFullYear()} Virtual Gyans. All rights reserved.</p>
        </div>
        
        <div className="footer-right">
          <a href="https://www.youtube.com/c/virtualgyans" target="_blank" rel="noopener noreferrer">YouTube</a>
          <a href="mailto:virtualgyans@gmail.com">Contact</a>
        </div>
      </div>
    </footer>
  );
}
