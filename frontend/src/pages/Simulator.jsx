import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { simulateScenarioParams } from '../services/apiClient';
import PageIntro from '../components/PageIntro';
import { useWorkspace } from '../context/WorkspaceContext';

const PRESETS = [
  { id: 'hold', label: 'Hold steady', solar: 10, water: 15, waste: 20 },
  { id: 'mid', label: 'Five-year plan', solar: 35, water: 40, waste: 55 },
  { id: 'push', label: 'Aggressive retrofit', solar: 70, water: 65, waste: 80 }
];

export default function Simulator() {
  const [searchParams] = useSearchParams();
  const { saveScenario, savedScenarios } = useWorkspace();
  const [solarPercent, setSolarPercent] = useState(30);
  const [waterRecyclePercent, setWaterRecyclePercent] = useState(40);
  const [wasteDiversionPercent, setWasteDiversionPercent] = useState(50);
  const [simulation, setSimulation] = useState(null);

  useEffect(() => {
    const preset = searchParams.get('preset');
    if (preset === 'solar') {
      setSolarPercent(75);
    } else if (preset === 'hvac' || preset === 'water') {
      setWaterRecyclePercent(65);
    } else if (preset === 'waste') {
      setWasteDiversionPercent(80);
    }
  }, [searchParams]);

  useEffect(() => {
    let live = true;
    simulateScenarioParams({ solarPercent, waterRecyclePercent, wasteDiversionPercent })
      .then((res) => {
        if (live && res.success) setSimulation(res.simulation);
      })
      .catch(console.error);
    return () => { live = false; };
  }, [solarPercent, waterRecyclePercent, wasteDiversionPercent]);


  return (
    <div className="container page-shell">
      <PageIntro
        kicker="Capital model"
        title="What if we spent it?"
        actions={
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => saveScenario({ solarPercent, waterRecyclePercent, wasteDiversionPercent, projected: simulation?.projectedScore })}
          >
            Save this mix
          </button>
        }
      >
        Three levers. The score on the right is arithmetic — same engine as the scorecard, not a generated guess.
      </PageIntro>

      <div className="preset-row">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setSolarPercent(preset.solar);
              setWaterRecyclePercent(preset.water);
              setWasteDiversionPercent(preset.waste);
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="simulator-layout">
        <div>
          {[
            ['Rooftop solar', solarPercent, setSolarPercent, 'Share of site load displaced by on-site generation.'],
            ['Process water reuse', waterRecyclePercent, setWaterRecyclePercent, 'Share of cooling and process water returned to the loop.'],
            ['Waste diversion', wasteDiversionPercent, setWasteDiversionPercent, 'Share kept out of landfill through recycle and organics.']
          ].map(([label, value, setter, hint]) => (
            <div className="simulator-control-group" key={label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                <span>{label}</span>
                <span>{value}%</span>
              </div>
              <input type="range" min="0" max="100" value={value} onChange={(e) => setter(Number(e.target.value))} className="slider-input" />
              <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.3rem' }}>{hint}</p>
            </div>
          ))}

          {savedScenarios.length > 0 && (
            <div style={{ marginTop: '1.25rem' }}>
              <p className="page-kicker">Saved on this device</p>
              <ul>
                {savedScenarios.map((item) => (
                  <li key={item.id} className="text-muted" style={{ fontSize: '0.82rem', marginTop: '0.35rem' }}>
                    Solar {item.solarPercent}% · Water {item.waterRecyclePercent}% · Waste {item.wasteDiversionPercent}%
                    {item.projected != null ? ` → ${item.projected}` : ''}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="projection-panel">
          <div>
            <p className="page-kicker" style={{ color: 'rgba(246,241,232,0.7)' }}>Projected score</p>
            <p style={{ opacity: 0.85, fontSize: '0.9rem' }}>Baseline {simulation?.baselineScore ?? 67}</p>
          </div>
          {simulation && (
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '4rem', lineHeight: 1 }}>{simulation.projectedScore}</div>
              <p style={{ margin: '0.4rem 0 1rem' }}>+{simulation.scoreDelta} pts · grade {simulation.projectedGrade}</p>
              <dl className="stat-row" style={{ background: 'transparent', borderColor: 'rgba(246,241,232,0.2)' }}>
                <div>
                  <dt style={{ color: 'rgba(246,241,232,0.7)' }}>t CO₂e / yr</dt>
                  <dd>{simulation.co2ReductionTons}</dd>
                </div>
                <div>
                  <dt style={{ color: 'rgba(246,241,232,0.7)' }}>USD / yr</dt>
                  <dd>${simulation.estimatedCostSavingsUSD?.toLocaleString()}</dd>
                </div>
                <div>
                  <dt style={{ color: 'rgba(246,241,232,0.7)' }} />
                  <dd />
                </div>
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
