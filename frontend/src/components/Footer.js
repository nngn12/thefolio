// src/components/Footer.js
import { Link, useLocation } from 'react-router-dom';

function Footer() {
  const location = useLocation();

  // Hide on splash page
  if (location.pathname === '/') return null;

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">

        {/* Brand */}
        <div className="footer-brand">
          <p className="footer-logo">The Art of Web Development</p>
          <p className="footer-tagline">
            A space to write, learn, and share the craft of building for the web.
          </p>
        </div>

        {/* Links */}
        <div className="footer-links">
          <p className="footer-links-heading">Navigate</p>
          <ul>
            <li><Link to="/home">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/login">Sign In</Link></li>
            <li><Link to="/register">Register</Link></li>
          </ul>
        </div>

        {/* Resources */}
        <div className="footer-links">
          <p className="footer-links-heading">Resources</p>
          <ul>
            <li><a href="https://developer.mozilla.org" target="_blank" rel="noreferrer">MDN Web Docs</a></li>
            <li><a href="https://www.w3schools.com" target="_blank" rel="noreferrer">W3Schools</a></li>
            <li><a href="https://www.freecodecamp.org" target="_blank" rel="noreferrer">freeCodeCamp</a></li>
            <li><a href="https://css-tricks.com" target="_blank" rel="noreferrer">CSS-Tricks</a></li>
          </ul>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} The Art of Web Development. All rights reserved.</span>
        <span className="footer-bottom-dot">·</span>
        
      </div>
    </footer>
  );
}

export default Footer;