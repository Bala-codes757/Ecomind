import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { getIoTReadings, triggerIoTSimulation } from '../services/apiClient';

export default function IoTStreamWidget() {
  const [readings, setReadings] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);

  const fetchReadings = async () => {
    try {
      const res = await getIoTReadings();
      if (res.success) setReadings(res.readings);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReadings();
    const interval = setInterval(fetchReadings, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleTriggerPulse = async () => {
    setIsSimulating(true);
    try {
      await triggerIoTSimulation();
      await fetchReadings();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="surface" style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <p className="page-kicker">Submeters</p>
          <h3 className="card-title" style={{ marginBottom: 0 }}>Live meter feed</h3>
          <p className="text-muted" style={{ fontSize: '0.82rem' }}>Optional. Bills still work if this stay empty.</p>
        </div>
        <button type="button" className="btn btn-secondary btn-sm" onClick={handleTriggerPulse} disabled={isSimulating}>
          <RefreshCw size={14} className={isSimulating ? 'spin' : ''} />
          Pulse once
        </button>
      </div>
      <div className="card-grid">
        {readings.slice(0, 3).map((r, idx) => (
          <div key={idx} className="surface">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{r.device_code}</span>
              <span className="badge">{r.metric}</span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.35rem' }}>
              {r.value} <span className="text-muted" style={{ fontSize: '0.75rem' }}>{r.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
