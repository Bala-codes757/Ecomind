// EcoMind In-Memory / Supabase Relational Data Store
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '..', 'data_store.json');

// Default Database State initialized from schema seed values
const initialStore = {
  organizations: [
    {
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Apex Industrial Solutions',
      region: 'North America (US-East / eGRID)',
      created_at: new Date().toISOString()
    }
  ],
  modules: [
    { id: 'm-1', key: 'energy', name: 'Energy & Electricity', description: 'Automatic ingestion of grid power utility bills, renewable PPA records, submetering CSVs, and HVAC load data.', icon: 'Zap', badge: 'Active', is_active: true, order_index: 1 },
    { id: 'm-2', key: 'water', name: 'Water Management', description: 'Analyze municipal water meter readings, wastewater treatment logs, cooling tower cycles, and rainwater harvesting metrics.', icon: 'Droplets', badge: 'Active', is_active: true, order_index: 2 },
    { id: 'm-3', key: 'waste', name: 'Waste Management', description: 'Track municipal waste manifests, hazardous chemical logs, composting receipts, and circular economy diversion ratios.', icon: 'Trash2', badge: 'Active', is_active: true, order_index: 3 },
    { id: 'm-4', key: 'transport', name: 'Transport & Mobility', description: 'Scope 3 corporate fleet telemetry, employee commuting logs, and supply chain logistics carbon intensity calculation.', icon: 'Truck', badge: 'Coming Soon', is_active: false, order_index: 4 },
    { id: 'm-5', key: 'investment', name: 'Investment Planning', description: 'CapEx allocation engine for solar payback, thermal retrofit ROI, and green financing tax credit optimization.', icon: 'TrendingUp', badge: 'Coming Soon', is_active: false, order_index: 5 },
    { id: 'm-6', key: 'custom', name: 'Custom Module', description: 'Build tailor-made sustainability indicators and custom AI diagnostic models for unique industrial processes.', icon: 'Layers', badge: 'Enterprise', is_active: false, order_index: 6 }
  ],
  survey_questions: [
    {
      id: 'q-energy-1',
      module_key: 'energy',
      question_text: 'What is your primary operational energy concern?',
      question_type: 'single_choice',
      is_required: true,
      order_index: 1,
      options: [
        { label: 'High electricity bill / peak tariffs', value: 'high_bill' },
        { label: 'High overall electricity consumption', value: 'high_consumption' },
        { label: 'Off-peak energy wastage & leaks', value: 'energy_leak' },
        { label: 'Reduce Scope 1 & 2 carbon footprint', value: 'reduce_emissions' },
        { label: 'Don\'t know where energy is being consumed', value: 'unknown' }
      ]
    },
    {
      id: 'q-energy-2-hvac',
      module_key: 'energy',
      question_text: 'Which equipment category consumes the most power during operations?',
      question_type: 'single_choice',
      is_required: true,
      order_index: 2,
      options: [
        { label: 'HVAC / Industrial Chillers & Cooling Towers', value: 'hvac' },
        { label: 'Heavy Manufacturing Machinery & Motors', value: 'machinery' },
        { label: 'Facility High-Bay Lighting', value: 'lighting' },
        { label: 'Data Center / IT Server Infrastructure', value: 'it_servers' },
        { label: 'Other Process Equipment', value: 'other' }
      ]
    },
    {
      id: 'q-energy-3-schedule',
      module_key: 'energy',
      question_text: 'How many hours does your organization operate per day?',
      question_type: 'single_choice',
      is_required: true,
      order_index: 3,
      options: [
        { label: 'Standard Single Shift (8 Hours / 5 Days)', value: 'shift_8h' },
        { label: 'Double Shift (16 Hours / 5 Days)', value: 'shift_16h' },
        { label: '24/7 Continuous Operations', value: 'shift_24h' }
      ]
    }
  ],
  survey_branch_rules: [
    { id: 'b-1', question_id: 'q-energy-1', trigger_option_value: 'high_bill', next_question_id: 'q-energy-2-hvac' },
    { id: 'b-2', question_id: 'q-energy-1', trigger_option_value: 'high_consumption', next_question_id: 'q-energy-2-hvac' }
  ],
  survey_sessions: [],
  survey_answers: [],
  documents: [],
  document_extractions: [],
  utility_bills: [],
  waste_records: [],
  analysis_results: [],
  sustainability_scores: [],
  recommendations: [
    {
      id: 'rec-1',
      module_key: 'energy',
      title: 'Automated BMS HVAC Scheduling & Reset Override',
      description: 'Program smart override timers to power down facility chillers during off-peak weekend windows.',
      cost_level: 'Low',
      impact_level: 'High',
      score_delta: 7,
      difficulty: 'Easy',
      disruption: 'Low',
      est_payback: '4 Months',
      est_annual_savings: '$14,200 / yr',
      co2_reduction: '18.4 t CO2e'
    },
    {
      id: 'rec-2',
      module_key: 'waste',
      title: 'Establish Dedicated Organic Composting Pipeline',
      description: 'Divert organic food waste from landfill compactors into municipal industrial composting.',
      cost_level: 'Low',
      impact_level: 'Medium',
      score_delta: 5,
      difficulty: 'Easy',
      disruption: 'Low',
      est_payback: '7 Months',
      est_annual_savings: '$4,800 / yr',
      co2_reduction: '9.2 t CO2e'
    },
    {
      id: 'rec-3',
      module_key: 'water',
      title: 'Cooling Tower Closed-Loop Recirculation Upgrade',
      description: 'Install submetering and filtration loop to recycle blowdown water.',
      cost_level: 'Medium',
      impact_level: 'High',
      score_delta: 6,
      difficulty: 'Medium',
      disruption: 'Medium',
      est_payback: '14 Months',
      est_annual_savings: '$8,600 / yr',
      co2_reduction: '5.1 t CO2e'
    }
  ],
  action_plans: [],
  emission_factors: [
    { id: 'ef-1', category: 'electricity', region: 'US-East', factor_value: 0.4402, unit: 'kg CO2e / kWh', source: 'EPA eGRID 2026' },
    { id: 'ef-2', category: 'water', region: 'US-East', factor_value: 0.0003, unit: 'kg CO2e / litre', source: 'US Water Alliance' },
    { id: 'ef-3', category: 'waste_landfill', region: 'US-East', factor_value: 0.7200, unit: 'kg CO2e / kg', source: 'EPA WARM v15' }
  ],
  benchmarks: [
    { id: 'bm-1', category: 'energy', metric_name: 'Electricity Intensity (kWh / sq ft)', median_value: 18.5, unit: 'kWh/sqft' },
    { id: 'bm-2', category: 'water', metric_name: 'Water Recycling Rate (%)', median_value: 45.0, unit: '%' },
    { id: 'bm-3', category: 'waste', metric_name: 'Landfill Waste Diversion (%)', median_value: 75.0, unit: '%' }
  ],
  iot_devices: [
    { id: 'iot-1', device_code: 'meter-001', meter_name: 'Main Substation Grid Meter', metric: 'electricity', unit: 'kWh', status: 'online' },
    { id: 'iot-2', device_code: 'meter-002', meter_name: 'Cooling Tower Intake Submeter', metric: 'water', unit: 'litres', status: 'online' },
    { id: 'iot-3', device_code: 'meter-003', meter_name: 'Landfill Scale Telemetry', metric: 'waste', unit: 'kg', status: 'online' }
  ],
  iot_readings: []
};

class DataStore {
  constructor() {
    this.store = initialStore;
    this.loadStore();
  }

  loadStore() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        this.store = { ...initialStore, ...JSON.parse(raw) };
      }
    } catch (err) {
      console.warn('[DataStore] Failed to read store file, using in-memory defaults:', err.message);
    }
  }

  saveStore() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.store, null, 2), 'utf8');
    } catch (err) {
      console.error('[DataStore] Error saving store file:', err.message);
    }
  }

  get(table) {
    return this.store[table] || [];
  }

  getById(table, id) {
    return (this.store[table] || []).find((item) => item.id === id);
  }

  insert(table, record) {
    if (!this.store[table]) {
      this.store[table] = [];
    }
    const newRecord = { id: record.id || `id-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, ...record, created_at: new Date().toISOString() };
    this.store[table].push(newRecord);
    this.saveStore();
    return newRecord;
  }

  update(table, id, updates) {
    const list = this.store[table] || [];
    const index = list.findIndex((item) => item.id === id);
    if (index !== -1) {
      this.store[table][index] = { ...list[index], ...updates, updated_at: new Date().toISOString() };
      this.saveStore();
      return this.store[table][index];
    }
    return null;
  }

  delete(table, id) {
    if (!this.store[table]) return false;
    const initialLen = this.store[table].length;
    this.store[table] = this.store[table].filter((item) => item.id !== id);
    this.saveStore();
    return this.store[table].length < initialLen;
  }
}

export const db = new DataStore();
export default db;
