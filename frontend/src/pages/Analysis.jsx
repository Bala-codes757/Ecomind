import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import PageIntro from '../components/PageIntro';
import { useWorkspace } from '../context/WorkspaceContext';

const STEPS = [
  { title: 'Reading the bill', desc: 'Tariff, kWh, and the period printed on the statement.' },
  { title: 'Checking against last period', desc: 'Odd spikes get flagged before they enter the score.' },
  { title: 'Carbon math', desc: 'Grid factors applied to electricity, water, and landfill waste.' },
  { title: 'Writing the diagnosis', desc: 'Root cause is tied back to the answers you gave in the survey.' }
];

export default function Analysis() {
  const navigate = useNavigate();
  const { facility } = useWorkspace();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 1100);
    return () => clearInterval(timer);
  }, []);

  const isComplete = currentStep === STEPS.length - 1;

  return (
    <div className="container page-shell">
      <PageIntro kicker="Processing" title="Building this period’s scorecard">
        {facility.company} · {facility.site}. This usually takes a few seconds.
      </PageIntro>

      <div className="surface" style={{ maxWidth: 680, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', marginBottom: '1.75rem' }}>
          {STEPS.map((step, index) => (
            <div key={step.title} style={{ display: 'flex', gap: '0.85rem', opacity: index <= currentStep ? 1 : 0.4 }}>
              {index <= currentStep ? <CheckCircle2 size={18} className="text-accent" /> : <span style={{ width: 18, height: 18, border: '1px solid var(--color-rule)', borderRadius: '50%' }} />}
              <div>
                <h4 style={{ fontSize: '0.95rem' }}>{step.title}</h4>
                <p className="text-muted" style={{ fontSize: '0.85rem' }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <button className="btn btn-primary" style={{ width: '100%' }} disabled={!isComplete} onClick={() => navigate('/results')}>
          {isComplete ? 'Open the scorecard' : 'Still working…'}
          {isComplete ? <ArrowRight size={16} /> : <Loader2 size={16} className="spin" />}
        </button>
      </div>
    </div>
  );
}
