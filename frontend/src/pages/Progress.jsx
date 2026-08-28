import React, { useEffect, useState } from 'react';
import { getProgressHistory } from '../services/apiClient';
import PageIntro from '../components/PageIntro';
import EmptyState from '../components/EmptyState';

export default function Progress() {
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    getProgressHistory().then(setProgress).catch(console.error);
  }, []);

  const history = progress?.history || [];
  const max = Math.max(...history.map((item) => item.score), 100);

  return (
    <div className="container page-shell">
      <PageIntro kicker="History" title="How the score has moved">
        Monthly totals for this site. Use it to check whether last quarter’s work actually showed up in the bills.
      </PageIntro>

      {history.length === 0 ? (
        <EmptyState title="No history yet" body="Complete a scorecard to start the trail." to="/results" cta="Open scorecard" />
      ) : (
        <div className="surface">
          <div className="history-bars">
            {history.map((item) => (
              <div key={item.month} className={`history-col ${item.month.includes('Aug') ? 'is-current' : ''}`}>
                <div className="bar" style={{ height: `${(item.score / max) * 140}px` }} title={`${item.score}`} />
                <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{item.score}</strong>
                <span className="text-muted" style={{ fontSize: '0.7rem' }}>{item.month.replace(' 2026', '')}</span>
              </div>
            ))}
          </div>
          <div className="stat-row" style={{ marginTop: '1.5rem', border: 'none' }}>
            {history.slice(-3).map((item) => (
              <div key={item.month}>
                <dt>{item.month}</dt>
                <dd style={{ fontSize: '0.95rem' }}>E {item.energy} · W {item.water} · Ws {item.waste}</dd>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
