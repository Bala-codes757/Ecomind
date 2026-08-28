import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sliders, ArrowRight } from 'lucide-react';
import { getRecommendations, saveActionPlan } from '../services/apiClient';
import PageIntro from '../components/PageIntro';
import EmptyState from '../components/EmptyState';
import { useWorkspace } from '../context/WorkspaceContext';

export default function Improve() {
  const { plannedIds, togglePlanned, notify } = useWorkspace();
  const [recommendations, setRecommendations] = useState([]);
  const [sort, setSort] = useState('impact');
  const [onlyPlanned, setOnlyPlanned] = useState(false);

  useEffect(() => {
    getRecommendations().then((res) => setRecommendations(res.recommendations || [])).catch(console.error);
  }, []);

  const sorted = useMemo(() => {
    const copy = [...recommendations];
    if (sort === 'payback') {
      copy.sort((a, b) => String(a.est_payback).localeCompare(String(b.est_payback)));
    } else if (sort === 'savings') {
      copy.sort((a, b) => String(b.est_annual_savings).localeCompare(String(a.est_annual_savings)));
    }
    return onlyPlanned ? copy.filter((item) => plannedIds.includes(item.id)) : copy;
  }, [recommendations, sort, onlyPlanned, plannedIds]);

  const addToPlan = async (rec) => {
    const wasPinned = plannedIds.includes(rec.id);
    togglePlanned(rec.id);
    try {
      if (!wasPinned) await saveActionPlan(rec.id);
    } catch {
      /* local plan still works */
    }
    notify(wasPinned ? 'Removed from this site’s plan.' : 'Added to this site’s plan.');
  };

  return (
    <div className="container page-shell">
      <PageIntro
        kicker="Work plan"
        title="Prioritized Engineering Interventions"
        actions={
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <Link to="/compare" className="btn btn-secondary btn-sm">
              Compare Side-by-Side
            </Link>
          </div>
        }
      >
        Ranked by thermodynamic return and audited payback. Pin items to take to financial review.
      </PageIntro>

      <div className="toolbar">
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {[['impact', 'Impact'], ['payback', 'Payback'], ['savings', 'Savings']].map(([value, label]) => (
            <button key={value} type="button" className={`btn btn-sm ${sort === value ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setSort(value)}>
              {label}
            </button>
          ))}
        </div>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setOnlyPlanned((v) => !v)}>
          {onlyPlanned ? 'Show all' : `Pinned (${plannedIds.length})`}
        </button>
      </div>

      {sorted.length === 0 ? (
        <EmptyState title="No actions yet" body="Run a scorecard first, or unpin the filter." to="/data" cta="Upload a bill" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {sorted.map((rec) => (
            <article key={rec.id} className="surface">
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div>
                  <span className="badge">{rec.module_key}</span>
                  <h3 className="card-title" style={{ marginTop: '0.45rem' }}>{rec.title}</h3>
                </div>
                <button type="button" className={`btn btn-sm ${plannedIds.includes(rec.id) ? 'btn-primary' : 'btn-secondary'}`} onClick={() => addToPlan(rec)}>
                  {plannedIds.includes(rec.id) ? 'Pinned' : 'Pin to plan'}
                </button>
              </div>
              <div className="stat-row" style={{ marginTop: '1rem' }}>
                <div>
                  <dt>Payback</dt>
                  <dd style={{ fontSize: '1.05rem' }}>{rec.est_payback}</dd>
                </div>
                <div>
                  <dt>Annual savings</dt>
                  <dd style={{ fontSize: '1.05rem' }}>{rec.est_annual_savings}</dd>
                </div>
                <div>
                  <dt>CO₂</dt>
                  <dd style={{ fontSize: '1.05rem' }}>{rec.co2_reduction}</dd>
                </div>
              </div>
              <p className="text-muted" style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>
                Effort: {rec.difficulty} · Impact: {rec.impact_level}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
