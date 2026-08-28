import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, Search, X } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';

const NAV = [
  { label: 'Overview', path: '/' },
  { label: 'History', path: '/progress' },
  { label: 'Admin', path: '/admin' }
];

export default function Header({ onOpenSearch }) {
  const location = useLocation();
  const { facility, setFacility } = useWorkspace();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <header className="site-header">
      <div className="container header-container">
        <Link to="/" className="brand-logo">
          <span className="brand-mark">Eco<em>Mind</em></span>
        </Link>

        <div className="facility-chip">
          {editing ? (
            <input
              autoFocus
              aria-label="Facility name"
              value={`${facility.company} · ${facility.site}`}
              onChange={(event) => {
                const [company, site] = event.target.value.split('·').map((part) => part.trim());
                setFacility({ company: company || facility.company, site: site || facility.site });
              }}
              onBlur={() => setEditing(false)}
              onKeyDown={(event) => event.key === 'Enter' && setEditing(false)}
            />
          ) : (
            <button type="button" onClick={() => setEditing(true)} title="Edit facility name">
              {facility.company} · {facility.site}
            </button>
          )}
          <span>Working site</span>
        </div>

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
            <span>Jump to…</span>
            <kbd>Ctrl K</kbd>
          </button>
          <button className="mobile-toggle" onClick={() => setMobileOpen((open) => !open)} aria-label="Open menu">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </header>
  );
}
