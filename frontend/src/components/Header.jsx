import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, Search, X } from 'lucide-react';

const NAV = [
  { label: 'Overview', path: '/' },
  { label: 'Simulator', path: '/simulator' },
  { label: 'Recommendations', path: '/recommendations' },
  { label: 'Scorecard', path: '/results' },
  { label: 'History', path: '/progress' },
  { label: 'Portability', path: '/portability' },
  { label: 'Admin', path: '/admin' }
];

export default function Header({ onOpenSearch }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <header className="site-header">
      <div className="container header-container">
        <Link to="/" className="brand-logo">
          <span className="brand-mark">Eco<em>Mind</em></span>
        </Link>

        <nav className={`nav-menu ${mobileOpen ? 'is-open' : ''}`}>
          {NAV.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="header-tools">
          <button type="button" className="search-trigger" onClick={onOpenSearch}>
            <Search size={14} />
            <span>Search</span>
          </button>
          <button className="mobile-toggle" onClick={() => setMobileOpen((open) => !open)} aria-label="Open menu">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </header>
  );
}
