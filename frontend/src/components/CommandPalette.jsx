import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ROUTES = [
  { label: 'Home', hint: 'Overview', path: '/' },
  { label: 'Facility questions', hint: 'Survey', path: '/survey/energy' },
  { label: 'Utility records', hint: 'Upload bills', path: '/data' },
  { label: 'Scorecard', hint: 'EcoScore', path: '/results' },
  { label: 'Recommended work', hint: 'Actions', path: '/improve' },
  { label: 'Compare options', hint: 'Side by side', path: '/compare' },
  { label: 'Investment model', hint: 'What-if', path: '/simulator' },
  { label: 'History', hint: 'Monthly scores', path: '/progress' },
  { label: 'Admin', hint: 'Modules', path: '/admin' }
];

export default function CommandPalette({ open, onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ROUTES;
    return ROUTES.filter((item) => `${item.label} ${item.hint}`.toLowerCase().includes(q));
  }, [query]);

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const go = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="palette-backdrop" onClick={onClose} role="presentation">
      <div
        className="palette"
        role="dialog"
        aria-modal="true"
        aria-label="Jump to a page"
        onClick={(event) => event.stopPropagation()}
      >
        <input
          autoFocus
          className="palette-input"
          placeholder="Jump to a page…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && matches[0]) go(matches[0].path);
          }}
        />
        <ul className="palette-list">
          {matches.map((item) => (
            <li key={item.path}>
              <button type="button" onClick={() => go(item.path)}>
                <span>{item.label}</span>
                <span className="palette-hint">{item.hint}</span>
              </button>
            </li>
          ))}
          {matches.length === 0 && <li className="palette-empty">No matching pages</li>}
        </ul>
      </div>
    </div>
  );
}
