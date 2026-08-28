import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRecommendations, compareActions } from '../services/apiClient';
import PageIntro from '../components/PageIntro';
import EmptyState from '../components/EmptyState';

export default function Compare() {
  const [recommendations, setRecommendations] = useState([]);
  const [query, setQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState(['rec-1', 'rec-2']);
  const [comparison, setComparison] = useState(null);

  useEffect(() => {
    getRecommendations().then((res) => {
      if (res.success) setRecommendations(res.recommendations);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedIds.length) return;
    compareActions(selectedIds).then((res) => {
      if (res.success) setComparison(res);
    }).catch(console.error);
  }, [selectedIds]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return recommendations;
    return recommendations.filter((rec) => rec.title.toLowerCase().includes(q) || rec.module_key?.toLowerCase().includes(q));
  }, [recommendations, query]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.length > 1 ? prev.filter((item) => item !== id) : prev;
      return prev.length < 3 ? [...prev, id] : prev;
    });
  };

  return (
    <div className="container page-shell">
      <PageIntro kicker="Options" title="Compare three at most">
        Cost, disruption, and score gain on one row. Pick the set you would actually take to a capital meeting.
      </PageIntro>

      <div className="toolbar">
        <input
          className="field-input"
          style={{ maxWidth: 280 }}
          placeholder="Filter by name or module"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <span className="text-muted" style={{ fontSize: '0.85rem' }}>{selectedIds.length} selected</span>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        {filtered.map((rec) => {
          const selected = selectedIds.includes(rec.id);
          return (
            <button key={rec.id} type="button" className={`btn btn-sm ${selected ? 'btn-primary' : 'btn-secondary'}`} onClick={() => toggleSelect(rec.id)}>
              {rec.title}
            </button>
          );
        })}
      </div>

      {comparison?.recommendationRationale && (
        <div className="surface" style={{ marginBottom: '1.25rem' }}>
          <p className="page-kicker">Reading of this mix</p>
          <p>{comparison.recommendationRationale}</p>
        </div>
      )}

      {!comparison?.selectedActions?.length ? (
        <EmptyState title="Nothing to compare" body="Load recommendations first." to="/improve" cta="Open work plan" />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${comparison.selectedActions.length}, 1fr)`, gap: '0.85rem' }}>
          {comparison.selectedActions.map((act) => (
            <article key={act.id} className="surface">
              <span className="badge">{act.module_key}</span>
              <h3 className="card-title" style={{ marginTop: '0.5rem' }}>{act.title}</h3>
              <p className="text-muted" style={{ fontSize: '0.86rem', marginBottom: '1rem' }}>{act.description}</p>
              {[
                ['Capital', act.cost_level],
                ['Carbon', act.co2_reduction],
                ['Score', `+${act.score_delta}`],
                ['Difficulty', act.difficulty],
                ['Disruption', act.disruption],
                ['Payback', act.est_payback]
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border-subtle)', padding: '0.45rem 0', fontSize: '0.86rem' }}>
                  <span className="text-muted">{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </article>
          ))}
        </div>
      )}

      <div style={{ marginTop: '1.5rem' }}>
        <Link to="/simulator" className="btn btn-primary">Model this mix</Link>
      </div>
    </div>
  );
}
