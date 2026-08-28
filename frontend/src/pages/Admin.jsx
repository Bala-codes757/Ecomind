import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { getAdminConfig, saveAdminModule } from '../services/apiClient';
import PageIntro from '../components/PageIntro';
import { useWorkspace } from '../context/WorkspaceContext';

export default function Admin() {
  const { notify } = useWorkspace();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newModuleName, setNewModuleName] = useState('');
  const [newModuleKey, setNewModuleKey] = useState('');
  const [newModuleDesc, setNewModuleDesc] = useState('');

  const loadConfig = async () => {
    setLoading(true);
    try {
      const res = await getAdminConfig();
      if (res.success) setConfig(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleToggleModuleActive = async (mod) => {
    await saveAdminModule({ ...mod, is_active: !mod.is_active, badge: !mod.is_active ? 'Active' : 'Off' });
    notify(`“${mod.name}” is now ${!mod.is_active ? 'on' : 'off'}.`);
    await loadConfig();
  };

  const handleCreateModule = async (e) => {
    e.preventDefault();
    if (!newModuleName || !newModuleKey) return;
    await saveAdminModule({
      key: newModuleKey.toLowerCase().replace(/\s+/g, '_'),
      name: newModuleName,
      description: newModuleDesc,
      is_active: true,
      badge: 'Active',
      icon: 'Layers'
    });
    setNewModuleName('');
    setNewModuleKey('');
    setNewModuleDesc('');
    notify('Module added.');
    await loadConfig();
  };

  if (loading) {
    return <div className="container page-shell"><p className="text-muted">Loading settings…</p></div>;
  }

  return (
    <div className="container page-shell">
      <PageIntro kicker="Admin" title="What this instance covers">
        Turn modules on or off without a redeploy. This is configuration, not a marketing page.
      </PageIntro>

      <div className="surface" style={{ marginBottom: '1.5rem' }}>
        <h2 className="section-title">Modules</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '1rem' }}>
          {config?.modules?.map((mod) => (
            <div key={mod.id || mod.key} className="surface" style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
                  <strong>{mod.name}</strong>
                  <span className={`badge ${mod.is_active ? 'badge-active' : 'badge-disabled'}`}>{mod.is_active ? 'On' : 'Off'}</span>
                </div>
                <p className="text-muted" style={{ fontSize: '0.85rem' }}>{mod.description}</p>
              </div>
              <button type="button" className={`btn btn-sm ${mod.is_active ? 'btn-secondary' : 'btn-primary'}`} onClick={() => handleToggleModuleActive(mod)}>
                {mod.is_active ? 'Turn off' : 'Turn on'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <form className="surface" onSubmit={handleCreateModule}>
        <h2 className="section-title">Add a module</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', margin: '1rem 0' }}>
          <div>
            <label className="field-label" htmlFor="mod-name">Name</label>
            <input id="mod-name" className="field-input" value={newModuleName} onChange={(e) => setNewModuleName(e.target.value)} placeholder="Chemical handling" />
          </div>
          <div>
            <label className="field-label" htmlFor="mod-key">Key</label>
            <input id="mod-key" className="field-input" value={newModuleKey} onChange={(e) => setNewModuleKey(e.target.value)} placeholder="chemical" />
          </div>
        </div>
        <label className="field-label" htmlFor="mod-desc">Description</label>
        <input id="mod-desc" className="field-input" value={newModuleDesc} onChange={(e) => setNewModuleDesc(e.target.value)} placeholder="What this module will score" />
        <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          <Plus size={16} />
          Add module
        </button>
      </form>
    </div>
  );
}
