import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ children }) {
  const [facility, setFacility] = useLocalStorage('ecomind.facility', {
    company: 'Apex Industrial',
    site: 'Plant B'
  });
  const [plannedIds, setPlannedIds] = useLocalStorage('ecomind.plannedActions', []);
  const [notes, setNotes] = useLocalStorage('ecomind.notes', '');
  const [savedScenarios, setSavedScenarios] = useLocalStorage('ecomind.scenarios', []);
  const [toast, setToast] = useState(null);

  const notify = useCallback((message) => {
    setToast({ id: Date.now(), message });
    window.setTimeout(() => setToast(null), 2800);
  }, []);

  const togglePlanned = useCallback((id) => {
    setPlannedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }, [setPlannedIds]);

  const saveScenario = useCallback((scenario) => {
    setSavedScenarios((prev) => [{ id: Date.now(), createdAt: new Date().toISOString(), ...scenario }, ...prev].slice(0, 8));
    notify('Scenario saved on this device.');
  }, [notify, setSavedScenarios]);

  const value = useMemo(
    () => ({
      facility,
      setFacility,
      plannedIds,
      togglePlanned,
      notes,
      setNotes,
      savedScenarios,
      saveScenario,
      toast,
      notify
    }),
    [facility, plannedIds, notes, savedScenarios, toast, notify, setFacility, togglePlanned, setNotes, saveScenario]
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used inside WorkspaceProvider');
  return ctx;
}
