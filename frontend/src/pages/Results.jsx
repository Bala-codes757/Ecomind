import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAnalysisResult } from '../services/apiClient';
import PageIntro from '../components/PageIntro';
import EmptyState from '../components/EmptyState';
import { useWorkspace } from '../context/WorkspaceContext';

export default function Results() {
  const { facility, notes, setNotes, notify } = useWorkspace();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAnalysisResult()
      .then((res) => {
        if (res.success) setData(res);
      })
      .catch(() => setError('No scorecard yet. Upload a bill and finish the site questions first.'))
      .finally(() => setLoading(false));
  }, []);

  const copyDiagnosis = async () => {
    if (!data?.analysis) return;
    const text = [
      `${facility.company} · ${facility.site}`,
      `Score ${data.score.overall_score} (${data.score.grade})`,
      data.analysis.primary_concern,
      data.analysis.probable_root_cause,
      data.analysis.company_need
    ].join('\n\n');
    await navigator.clipboard.writeText(text);
    notify('Diagnosis copied.');
  };

  if (loading) {
    return <div className="container page-shell"><p className="text-muted">Loading scorecard…</p></div>;
  }

  if (error || !data) {
    return (
      <div className="container page-shell">
        <EmptyState title="Nothing to score yet" body={error || 'Run an assessment first.'} to="/survey/energy" cta="Start assessment" />
      </div>
    );
  }

  const { score, analysis } = data;
  const domains = [
    { name: 'Energy', value: score.energy_score ?? 72 },
    { name: 'Water', value: score.water_score ?? 61 },
    { name: 'Waste', value: score.waste_score ?? 48 }
  ];

  return (
    <div className="container page-shell">
      <PageIntro
        kicker="Scorecard"
        title="This period"
        actions={
          <>
            <button type="button" className="btn btn-secondary btn-sm" onClick={copyDiagnosis}>Copy summary</button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => window.print()}>Print</button>
          </>
        }
      >
        Calculated from the last extraction for {facility.company}, {facility.site}.
      </PageIntro>

      <div className="score-card">
        <div>
          <p className="page-kicker" style={{ color: 'rgba(246,241,232,0.7)' }}>{facility.company}</p>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 600, margin: '0.3rem 0' }}>{facility.site}</h2>
          <p style={{ opacity: 0.85, maxWidth: 420 }}>Energy, water, and waste on one sheet. The write-up below is the working hypothesis, not a purchase order.</p>
        </div>
        <div className="score-badge">
          <div className="score-value">{score.overall_score}</div>
          <div className="score-label">Grade {score.grade}</div>
        </div>
      </div>

      <div className="card-grid" style={{ marginBottom: '1.75rem' }}>
        {domains.map((domain) => (
          <div key={domain.name} className="surface">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <strong>{domain.name}</strong>
              <span className="badge">{domain.value} / 100</span>
            </div>
            <div className="meter"><span style={{ width: `${domain.value}%` }} /></div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.75rem' }}>
        <div className="diagnosis-box">
          <p className="page-kicker">What you said matters most</p>
          <p style={{ fontWeight: 600 }}>{analysis.primary_concern}</p>
        </div>
        <div className="diagnosis-box" style={{ borderLeftColor: 'var(--color-brass)' }}>
          <p className="page-kicker">Likely cause</p>
          <p>{analysis.probable_root_cause}</p>
        </div>
        <div className="diagnosis-box">
          <p className="page-kicker">What would actually help</p>
          <p style={{ fontWeight: 600 }}>{analysis.company_need}</p>
        </div>
        <div className="diagnosis-box" style={{ borderLeftColor: 'var(--color-slate)' }}>
          <p className="page-kicker">Evidence</p>
          <p className="text-muted">{analysis.reasoning}</p>
          {analysis.trade_offs && <p style={{ marginTop: '0.6rem', fontSize: '0.9rem' }}>Trade-offs: {analysis.trade_offs}</p>}
        </div>
      </div>

      <label className="field-label" htmlFor="notes">Notes for the next meeting</label>
      <textarea
        id="notes"
        className="notes-box"
        placeholder="Capex window, union constraints, shutdown calendar…"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '1.25rem' }}>
        <Link to="/improve" className="btn btn-primary">See recommended work</Link>
        <Link to="/simulator" className="btn btn-secondary">Model the spend</Link>
      </div>
    </div>
  );
}
