import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Scale, MessageSquare, GitBranch, Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { to: '/', label: 'Chat', icon: MessageSquare },
  { to: '/architecture', label: 'How It Works', icon: GitBranch },
];

/**
 * Navbar — Shared navigation bar with gold active indicator
 */
export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="navbar">
      <div className="navbar__inner">
        {/* Logo */}
        <Link to="/" className="navbar__logo" aria-label="LegalAId Home">
          <Scale size={28} className="text-gold-500" aria-hidden />
          <span className="navbar__logo-text">LegalAId</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="navbar__links" aria-label="Main navigation">
          {NAV_LINKS.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`navbar__link ${isActive ? 'navbar__link--active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={18} aria-hidden />
                <span>{label}</span>
                {isActive && <span className="navbar__link-indicator" />}
              </Link>
            );
          })}
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="navbar__hamburger"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <X size={24} className="text-cream-100" />
          ) : (
            <Menu size={24} className="text-cream-100" />
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <nav className="navbar__mobile-menu" aria-label="Mobile navigation">
          {NAV_LINKS.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`navbar__mobile-link ${isActive ? 'navbar__mobile-link--active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={18} aria-hidden />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
