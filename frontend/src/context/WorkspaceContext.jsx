import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

const WorkspaceContext = createContext(null);

export const DEFAULT_FACILITY = {
  id: '11111111-1111-1111-1111-111111111111',
  company: 'Facility Operations',
  site: 'Main Plant & Manufacturing Site',
  location: 'Regional Industrial Zone',
  lat: 30.2672,
  lng: -97.7431,
  grid_region: 'Regional Grid',
  grid_carbon_intensity: 0.385,
  facility_type: 'Industrial Manufacturing & Operations',
  square_footage: 185000,
  headcount: 340,
  annual_mwh: 1710,
  solar_kwp: 128
};

export function WorkspaceProvider({ children }) {
  const [facility, setFacility] = useLocalStorage('ecomind.facility', DEFAULT_FACILITY);
  const [plannedIds, setPlannedIds] = useLocalStorage('ecomind.plannedActions', []);
  const [notes, setNotes] = useLocalStorage('ecomind.notes', '');
  const [savedScenarios, setSavedScenarios] = useLocalStorage('ecomind.scenarios', []);
  const [toast, setToast] = useState(null);

  const notify = useCallback((message) => {
    setToast({ id: Date.now(), message });
    window.setTimeout(() => setToast(null), 2800);
  }, []);

  const selectFacility = useCallback((facilityData) => {
    setFacility({
      id: facilityData.id || `fac-${Date.now()}`,
      company: facilityData.name || facilityData.company || 'Enterprise Site',
      site: facilityData.site || 'Main Production Works',
      location: facilityData.location || 'North America',
      lat: facilityData.lat || 30.2672,
      lng: facilityData.lng || -97.7431,
      grid_region: facilityData.grid_region || 'Regional Grid',
      grid_carbon_intensity: facilityData.grid_carbon_intensity || 0.38,
      facility_type: facilityData.facility_type || 'Industrial Operations',
      square_footage: facilityData.square_footage || 180000,
      headcount: facilityData.headcount || 300,
      annual_mwh: facilityData.annual_mwh || 1700,
      solar_kwp: facilityData.solar_kwp || 120
    });
    notify(`Active facility switched to ${facilityData.name || facilityData.company}`);
  }, [notify, setFacility]);

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
      selectFacility,
      plannedIds,
      togglePlanned,
      notes,
      setNotes,
      savedScenarios,
      saveScenario,
      toast,
      notify
    }),
    [facility, plannedIds, notes, savedScenarios, toast, notify, setFacility, selectFacility, togglePlanned, setNotes, saveScenario]
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used inside WorkspaceProvider');
  return ctx;
}

