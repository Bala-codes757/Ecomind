import React from 'react';
import { NavLink } from 'react-router-dom';

const STEPS = [
  { n: '01', label: 'Questions', path: '/survey/energy', match: (p) => p.startsWith('/survey') },
  { n: '02', label: 'Records', path: '/data', match: (p) => p.startsWith('/data') },
  { n: '03', label: 'Scorecard', path: '/results', match: (p) => p.startsWith('/analysis') || p.startsWith('/results') },
  { n: '04', label: 'Work plan', path: '/improve', match: (p) => p.startsWith('/improve') || p.startsWith('/compare') },
  { n: '05', label: 'Model spend', path: '/simulator', match: (p) => p.startsWith('/simulator') }
];

export default function WorkflowStrip() {
  const path = typeof window !== 'undefined' ? window.location.pathname : '/';
  const activeIndex = STEPS.findIndex((step) => step.match(path));

  return (
    <div className="workflow-strip">
      <div className="container">
        <nav className="workflow-list" aria-label="Assessment steps">
          {STEPS.map((step, index) => {
            const active = step.match(path);
            const done = activeIndex > index;
            return (
              <NavLink
                key={step.path}
                to={step.path}
                className={`workflow-step ${active ? 'active' : ''} ${done ? 'done' : ''}`}
              >
                <strong>{step.n}</strong>
                {step.label}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
