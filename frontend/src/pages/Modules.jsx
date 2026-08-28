import React, { useEffect, useState } from 'react';
import { getModules } from '../services/apiClient';
import ModuleCard from '../components/ModuleCard';
import PageIntro from '../components/PageIntro';

export default function Modules() {
  const [modules, setModules] = useState([]);

  useEffect(() => {
    getModules().then((res) => setModules(res.modules || [])).catch(console.error);
  }, []);

  const activeModules = modules.filter((module) => module.is_active);
  const futureModules = modules.filter((module) => !module.is_active);

  return (
    <div className="container page-shell">
      <PageIntro kicker="Coverage" title="Modules">
        Pick a live topic to start the questions, or review what is still waiting on Admin.
      </PageIntro>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 className="section-title">Live</h2>
        <div className="card-grid" style={{ marginTop: '1rem' }}>
          {activeModules.map((module) => (
            <ModuleCard key={module.id || module.key} module={module} />
          ))}
        </div>
      </section>

      {futureModules.length > 0 && (
        <section>
          <h2 className="section-title">Queued</h2>
          <div className="card-grid" style={{ marginTop: '1rem' }}>
            {futureModules.map((module) => (
              <ModuleCard key={module.id || module.key} module={module} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
