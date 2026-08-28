import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getAnalysisResult, getModules } from '../services/apiClient';
import { activeModules as fallbackModules } from '../data/mockData';
import ModuleCard from '../components/ModuleCard';
import { useWorkspace } from '../context/WorkspaceContext';

const STEPS = [
  { title: 'Answer a few site questions', desc: 'Shift pattern, HVAC hours, and what is already on your radar.' },
  { title: 'Drop in last month’s bills', desc: 'PDF, spreadsheet, or a photo of a meter printout is enough.' },
  { title: 'Read the scorecard', desc: 'Energy, water, and waste scores are calculated from those totals.' },
  { title: 'Pick work you can actually fund', desc: 'Each recommendation shows payback, disruption, and carbon effect.' },
  { title: 'Model the spend before you commit', desc: 'Move solar, recycle, and diversion sliders and see the score shift.' },
  { title: 'Keep a monthly trail', desc: 'Compare this period with the last six so the story is not a one-off.' }
];

export default function Home() {
  const { facility } = useWorkspace();
  const [modules, setModules] = useState(fallbackModules);
  const [score, setScore] = useState(null);

  useEffect(() => {
    getModules()
      .then((res) => {
        const active = (res.modules || []).filter((module) => module.is_active);
        if (active.length) setModules(active);
      })
      .catch(() => {});

    getAnalysisResult()
      .then((res) => {
        if (res.success && res.score) setScore(res.score);
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      <section className="container home-masthead">
        <div>
          <p className="home-kicker">{facility.company} · {facility.site}</p>
          <h1 className="home-title">See what the bills are actually saying.</h1>
          <p className="home-lede">
            EcoMind turns utility records into a score for energy, water, and waste — then ranks the work that would
            change those numbers. No new sensors required to start.
          </p>
          <div className="hero-actions">
            <Link to="/survey/energy" className="btn btn-primary">
              Start with the site questions
              <ArrowRight size={16} />
            </Link>
            <Link to="/data" className="btn btn-secondary">
              Skip to bill upload
            </Link>
          </div>
        </div>

        <aside className="resume-card">
          <p className="section-label">Latest score</p>
          <h2>{score ? `${score.overall_score} · grade ${score.grade}` : 'No score yet'}</h2>
          <p className="text-muted">
            {score
              ? 'This is from the last calculation on this machine. Open the scorecard to read the diagnosis.'
              : 'Finish questions and upload a bill to produce the first scorecard.'}
          </p>
          {score && (
            <dl className="stat-row">
              <div>
                <dt>Energy</dt>
                <dd>{score.energy_score ?? '—'}</dd>
              </div>
              <div>
                <dt>Water</dt>
                <dd>{score.water_score ?? '—'}</dd>
              </div>
              <div>
                <dt>Waste</dt>
                <dd>{score.waste_score ?? '—'}</dd>
              </div>
            </dl>
          )}
          <Link to={score ? '/results' : '/survey/energy'} className="btn btn-secondary">
            {score ? 'Open scorecard' : 'Begin assessment'}
          </Link>
        </aside>
      </section>

      <section className="container section-block">
        <p className="section-label">Coverage</p>
        <h2 className="section-title">What you can score today</h2>
        <p className="section-copy">Energy, water, and waste are live. The rest can be switched on in Admin when you need them.</p>
        <div className="card-grid">
          {modules.map((module) => (
            <ModuleCard key={module.id || module.key} module={module} />
          ))}
        </div>
      </section>

      <section className="container section-block" style={{ paddingTop: 0 }}>
        <p className="section-label">How the work is sequenced</p>
        <h2 className="section-title">Six steps, one pass through the site</h2>
        <ol className="process-list">
          {STEPS.map((step) => (
            <li key={step.title}>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
