import React, { useState, useEffect } from 'react';
import { Sparkles, AlertTriangle, CheckCircle, RefreshCw, Cpu, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import { runAIAnomalyScan, triggerIoTSimulation } from '../services/apiClient';
import { useWorkspace } from '../context/WorkspaceContext';
import { Link } from 'react-router-dom';

export default function AIAnomalyScanner({ telemetry }) {
  const { facility } = useWorkspace();
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastScanned, setLastScanned] = useState(null);

  const runScan = async () => {
    setLoading(true);
    try {
      const res = await runAIAnomalyScan(
        telemetry || {
          power_kw: 242.8,
          chiller_delta_t: 5.8,
          solar_kw: 124.5,
          power_factor: 0.91,
          cooling_cycles: 3.2
        },
        facility
      );
      if (res.success && res.scan) {
        setScanResult(res.scan);
        setLastScanned(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    } catch (err) {
      console.error('Scan error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runScan();
  }, [facility.company]);

  return (
    <div className="ai-forensic-card" style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: '8px',
      padding: '1.5rem',
      marginTop: '1rem',
      marginBottom: '1.5rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            background: 'var(--color-brass-light)',
            color: 'var(--color-brass)',
            padding: '6px',
            borderRadius: '6px',
            display: 'flex'
          }}>
            <Sparkles size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0, fontFamily: 'var(--font-serif)' }}>
                AI Thermodynamic & Telemetry Forensics
              </h3>
              <span className="badge badge-olive" style={{ fontSize: '0.65rem' }}>Gemini 3.7 Flash Engine</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Real-time heuristic & generative scan across chiller delta-T, 480V power factors, and evaporative loops.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {lastScanned && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Scanned at {lastScanned}
            </span>
          )}
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={runScan}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Analyzing...' : 'Rescan Telemetry'}
          </button>
        </div>
      </div>

      {scanResult && (
        <div>
          {/* Executive Summary Bar */}
          <div style={{
            background: 'var(--bg-subtle)',
            padding: '0.85rem 1.15rem',
            borderRadius: '6px',
            borderLeft: '3px solid var(--color-brass)',
            marginBottom: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                Diagnostic Verdict
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                {scanResult.status || 'Active Monitoring'}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>System Thermal Health: </span>
                <strong style={{ color: 'var(--color-olive)', fontSize: '1rem' }}>{scanResult.health_score || 76}/100</strong>
              </div>
              <Link to="/copilot" className="btn btn-primary btn-sm" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                Consult AI Engineer <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Anomaly Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {(scanResult.anomalies || []).map((anomaly, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                      {anomaly.system}
                    </span>
                    <span
                      className={`badge ${anomaly.severity === 'high' ? 'badge-danger' : 'badge-warning'}`}
                      style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}
                    >
                      {anomaly.severity}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    <strong style={{ color: 'var(--text-main)' }}>Symptom:</strong> {anomaly.symptom}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    <strong style={{ color: 'var(--text-main)' }}>Root Cause:</strong> {anomaly.root_cause}
                  </div>
                </div>

                <div style={{
                  marginTop: '0.75rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px dashed var(--border-subtle)',
                  fontSize: '0.78rem'
                }}>
                  <div style={{ color: 'var(--color-brass)', fontWeight: 600, marginBottom: '2px' }}>
                    Impact: {anomaly.financial_impact}
                  </div>
                  <div style={{ color: 'var(--color-olive-dark)' }}>
                    Action: {anomaly.recommended_action}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
