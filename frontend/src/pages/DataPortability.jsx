import React, { useState, useEffect } from 'react';
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  Server,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  Shield,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  exportSystemBackup,
  importSystemBackup,
  resetSystemDatabase,
  getSystemStats
} from '../services/apiClient';

export default function DataPortability() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [statusType, setStatusType] = useState('success');
  const [importJsonText, setImportJsonText] = useState('');

  const loadStats = async () => {
    try {
      setLoading(true);
      const res = await getSystemStats();
      setStats(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleDownloadBackup = async () => {
    try {
      setLoading(true);
      const backup = await exportSystemBackup();
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ecomind_full_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatusMessage('Complete system backup exported successfully. Ready for deployment on any standard Node.js/Docker host.');
      setStatusType('success');
    } catch (err) {
      setStatusMessage(`Export failed: ${err.message}`);
      setStatusType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleImportJson = async () => {
    try {
      setLoading(true);
      const parsed = JSON.parse(importJsonText);
      const res = await importSystemBackup(parsed);
      setStatusMessage(`Database restored successfully (${Object.keys(parsed.data || {}).length} collections updated).`);
      setStatusType('success');
      setImportJsonText('');
      loadStats();
    } catch (err) {
      setStatusMessage(`Import failed: ${err.message}. Please verify valid JSON schema.`);
      setStatusType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setImportJsonText(event.target.result);
    };
    reader.readAsText(file);
  };

  const handleReset = async () => {
    if (!window.confirm('Reset database to clean baseline configuration? All custom changes will be refreshed to default industry seeds.')) {
      return;
    }
    try {
      setLoading(true);
      await resetSystemDatabase();
      setStatusMessage('Database reset to clean baseline configuration.');
      setStatusType('success');
      loadStats();
    } catch (err) {
      setStatusMessage(`Reset failed: ${err.message}`);
      setStatusType('error');
    } finally {
      setLoading(false);
    }
  };

  const tables = [
    { key: 'modules', label: 'Assessment Modules', desc: 'Active sustainability domain taxonomies' },
    { key: 'recommendations', label: 'Decarbonization Measures', desc: 'Pre-engineered industrial ROI measures' },
    { key: 'emission_factors', label: 'Emission Factor Library', desc: 'GHG Protocol grid and fuel intensities' },
    { key: 'benchmarks', label: 'Facility Benchmarks', desc: 'Industry quadrant percentiles' },
    { key: 'sustainability_scores', label: 'Audit History & Scores', desc: 'Historical timeline scores' },
    { key: 'action_plans', label: 'Saved Action Plans', desc: 'Enterprise roadmap execution items' }
  ];

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
          <Server size={24} className="text-olive" />
          <h1 style={{ fontSize: '1.75rem', fontWeight: 600 }}>Data Portability & Independent Hosting</h1>
        </div>
        <p className="text-muted" style={{ maxWidth: '800px', fontSize: '0.95rem' }}>
          EcoMind uses an autonomous, zero-vendor-lockin storage architecture. All calculations, diagnostic weights, survey trees, and audit histories are stored in generic, portable formats with no proprietary cloud dependencies.
        </p>
      </div>

      {statusMessage && (
        <div
          className="surface"
          style={{
            marginBottom: '1.5rem',
            padding: '0.85rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            borderColor: statusType === 'success' ? 'var(--color-olive)' : 'var(--color-rust)',
            background: statusType === 'success' ? 'rgba(61,74,56,0.06)' : 'rgba(184,80,66,0.06)'
          }}
        >
          {statusType === 'success' ? <CheckCircle2 size={18} className="text-olive" /> : <AlertCircle size={18} className="text-rust" />}
          <span style={{ fontSize: '0.9rem' }}>{statusMessage}</span>
        </div>
      )}

      {/* Grid: Storage Architecture Specs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="surface">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
            <HardDrive size={18} className="text-olive" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Active Storage Engine</h3>
          </div>
          <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>
            {stats?.active_driver || 'File-backed Persistent JSON / Relational Adapter'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-rule)', paddingBottom: '0.3rem' }}>
              <span className="text-muted">Hosting Mode:</span>
              <strong>Generic Standalone</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-rule)', paddingBottom: '0.3rem' }}>
              <span className="text-muted">Cloud Lock-in:</span>
              <strong className="text-olive">0% (Completely Portable)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="text-muted">Primary Data File:</span>
              <code>backend/data_store.json</code>
            </div>
          </div>
        </div>

        <div className="surface">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
            <Shield size={18} className="text-olive" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>AI & Calculation Fallback</h3>
          </div>
          <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>
            Local deterministic physics calculation engine with dual-tier fallback mode:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-rule)', paddingBottom: '0.3rem' }}>
              <span className="text-muted">Offline Mode:</span>
              <strong>Full Deterministic Support</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-rule)', paddingBottom: '0.3rem' }}>
              <span className="text-muted">GHG Protocol Factors:</span>
              <strong>EPA / IPCC AR6 Standard</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="text-muted">Deployment Target:</span>
              <strong>Docker / Any Linux VPS / Node</strong>
            </div>
          </div>
        </div>

        <div className="surface">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
            <Layers size={18} className="text-olive" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Stored Record Counts</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.82rem' }}>
            {stats?.record_counts ? (
              Object.entries(stats.record_counts).slice(0, 6).map(([key, count]) => (
                <div key={key} style={{ background: 'var(--color-bg-alt)', padding: '0.4rem 0.6rem', borderRadius: '3px' }}>
                  <div style={{ color: 'var(--color-ink-muted)', fontSize: '0.72rem', textTransform: 'capitalize' }}>
                    {key.replace(/_/g, ' ')}
                  </div>
                  <strong>{count} items</strong>
                </div>
              ))
            ) : (
              <span className="text-muted">Loading metrics...</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Operations: Full JSON Backup & Restore */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Export Card */}
        <div className="surface">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
            <Download size={20} className="text-olive" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Complete System Export</h2>
          </div>
          <p className="text-muted" style={{ fontSize: '0.88rem', marginBottom: '1.25rem' }}>
            Generate a single structured JSON bundle containing all active modules, diagnostic questions, custom formulas, baseline benchmarks, and facility audit logs.
          </p>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleDownloadBackup}
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <Download size={16} />
            Export Complete Database Bundle (.json)
          </button>
        </div>

        {/* Import & Restore Card */}
        <div className="surface">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
            <Upload size={20} className="text-olive" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Import & Restore Data</h2>
          </div>
          <p className="text-muted" style={{ fontSize: '0.88rem', marginBottom: '0.75rem' }}>
            Upload or paste an EcoMind JSON backup file to sync or migrate data from another environment.
          </p>

          <div style={{ marginBottom: '0.75rem' }}>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              style={{ fontSize: '0.85rem' }}
            />
          </div>

          <textarea
            value={importJsonText}
            onChange={(e) => setImportJsonText(e.target.value)}
            placeholder="Or paste JSON payload here..."
            className="field-input"
            style={{ minHeight: '80px', fontSize: '0.8rem', fontFamily: 'monospace', marginBottom: '0.75rem' }}
          />

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleImportJson}
              disabled={loading || !importJsonText.trim()}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              <Upload size={15} />
              Restore Database
            </button>
            <button
              type="button"
              className="btn btn-secondary text-rust"
              onClick={handleReset}
              disabled={loading}
              title="Reset all tables to factory default"
            >
              <RefreshCw size={15} />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Individual Table CSV Exporters */}
      <div className="surface">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
          <FileSpreadsheet size={20} className="text-olive" />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Individual Dataset CSV Downloads</h2>
        </div>
        <p className="text-muted" style={{ fontSize: '0.88rem', marginBottom: '1.25rem' }}>
          Download individual normalized data tables in standard CSV format for use in Excel, PowerBI, Tableau, or custom relational database ETL pipelines.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
          {tables.map((table) => (
            <div
              key={table.key}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem 1rem',
                background: 'var(--color-bg-surface)',
                border: '1px solid var(--color-rule)',
                borderRadius: '3px'
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{table.label}</div>
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>{table.desc}</div>
              </div>
              <a
                href={`/api/admin/export/csv/${table.key}`}
                download={`ecomind_${table.key}.csv`}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.78rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <Download size={13} />
                CSV
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
