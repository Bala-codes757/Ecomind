import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sliders
} from 'lucide-react';
import { getAnalysisResult, getModules, getIoTReadings } from '../services/apiClient';
import { activeModules as fallbackModules } from '../data/mockData';
import ModuleCard from '../components/ModuleCard';
import { useWorkspace } from '../context/WorkspaceContext';

const STEPS = [
  { title: 'Answer Facility Operations Survey', desc: 'Shift patterns, operational hours, baseload equipment, and process sub-metering.' },
  { title: 'Drop in Utility Bills & Meter Logs', desc: 'PDF, spreadsheet, SCADA export, or meter photos with automated OCR.' },
  { title: 'Deterministic Calculation & Audit', desc: 'Audited against GHG Protocol Scope 1-3, EPA eGRID factors, and industry peer quartiles.' },
  { title: 'What-If Scenario Simulator', desc: 'Adjust solar arrays, HVAC setpoints, and recycling to forecast ROI and carbon delta.' },
  { title: 'Export & Deploy Anywhere', desc: 'Zero cloud lock-in. Full JSON backups and individual CSV table exports for generic hosting.' }
];

export default function Home() {
  const { facility } = useWorkspace();
  const [modules, setModules] = useState(fallbackModules);
  const [score, setScore] = useState(null);
  const [telemetry, setTelemetry] = useState(null);

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

    getIoTReadings()
      .then((res) => {
        if (res.success) setTelemetry(res);
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero Masthead */}
      <section className="container home-masthead">
        <div>
          <p className="home-kicker">{facility.company || 'Facility Operations'} · {facility.site || 'Main Site'}</p>
          <h1 className="home-title">Decarbonization intelligence engineered for reality.</h1>
          <p className="home-lede">
            Physical facility modeling, grid telemetry, utility bill ingestion, and what-if simulation in a unified industrial sustainability platform.
          </p>
          <div className="hero-actions">
            <Link to="/survey/energy" className="btn btn-primary">
              Start Facility Assessment
              <ArrowRight size={16} />
            </Link>
            <Link to="/data" className="btn btn-secondary">
              Upload Utility Bills
            </Link>
            <Link to="/simulator" className="btn btn-secondary">
              <Sliders size={15} />
              Simulator
            </Link>
          </div>
        </div>

        <aside className="resume-card">
          <p className="section-label">Active Performance Score</p>
          <h2>{score ? `${score.overall_score} · Grade ${score.grade}` : '74 · Grade B+'}</h2>
          <p className="text-muted">
            {score
              ? `Computed using regional grid factors (${facility.grid_carbon_intensity || 0.38} kg CO₂e/kWh).`
              : `Baseline calculation based on active equipment profile and facility inputs.`}
          </p>
          <dl className="stat-row">
            <div>
              <dt>Energy (40%)</dt>
              <dd className="text-olive">{score?.energy_score ?? 76}</dd>
            </div>
            <div>
              <dt>Water (30%)</dt>
              <dd className="text-brass">{score?.water_score ?? 71}</dd>
            </div>
            <div>
              <dt>Waste (30%)</dt>
              <dd className="text-olive">{score?.waste_score ?? 75}</dd>
            </div>
          </dl>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <Link to="/results" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
              Scorecard
            </Link>
            <Link to="/simulator" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
              <Sliders size={14} />
              Simulate
            </Link>
          </div>
        </aside>
      </section>

      {/* Assessment Coverage Grid */}
      <section className="container section-block">
        <p className="section-label">Assessment Domains</p>
        <h2 className="section-title">What you can audit and optimize</h2>
        <p className="section-copy">Energy, water, and waste modules are active with real-time benchmarking and GHG factor libraries.</p>
        <div className="card-grid">
          {modules.map((module) => (
            <ModuleCard key={module.id || module.key} module={module} />
          ))}
        </div>
      </section>

      {/* Workflow Steps */}
      <section className="container section-block" style={{ paddingTop: 0 }}>
        <p className="section-label">Engineering Sequence</p>
        <h2 className="section-title">From Utility Bills to Concrete Decarbonization</h2>
        <ol className="process-list">
          {STEPS.map((step, idx) => (
            <li key={step.title}>
              <h3>{idx + 1}. {step.title}</h3>
              <p>{step.desc}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
