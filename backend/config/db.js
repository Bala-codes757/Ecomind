// EcoMind Generic & Standalone Relational/JSON Data Store
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = process.env.DATA_STORE_PATH || path.join(__dirname, '..', 'data_store.json');

// // Default Database State initialized with real-world multi-site industrial facility data
const initialStore = {
  organizations: [
    {
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Advanced Manufacturing Plant',
      site: 'Plant 01 · Production & Cleanroom Assembly',
      location: 'Regional Zone A',
      lat: 30.2672,
      lng: -97.7431,
      grid_region: 'Regional Interconnect',
      grid_carbon_intensity: 0.385, // kg CO2e/kWh
      facility_type: 'Precision Electronics & Assembly',
      square_footage: 185000,
      headcount: 340,
      annual_mwh: 1710,
      water_m3_yr: 102000,
      waste_tons_yr: 150,
      recycled_pct: 55.2,
      solar_kwp: 128,
      status: 'active',
      created_at: new Date(Date.now() - 180 * 86400000).toISOString()
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      name: 'Industrial Battery & Powertrain Center',
      site: 'Manufacturing Campus · Cell & Pack Assembly',
      location: 'Regional Zone B',
      lat: 39.5392,
      lng: -119.4447,
      grid_region: 'Western Interconnect',
      grid_carbon_intensity: 0.258,
      facility_type: 'Battery Cell & Powertrain Manufacturing',
      square_footage: 5300000,
      headcount: 11000,
      annual_mwh: 48000,
      water_m3_yr: 450000,
      waste_tons_yr: 4200,
      recycled_pct: 92.4,
      solar_kwp: 8500,
      status: 'monitored',
      created_at: new Date(Date.now() - 240 * 86400000).toISOString()
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      name: 'Semiconductor Fabrication Plant',
      site: 'Wafer Fab · Class 3 Cleanroom Complex',
      location: 'Regional Zone C',
      lat: 53.3639,
      lng: -6.4917,
      grid_region: 'Northern Interconnect',
      grid_carbon_intensity: 0.318,
      facility_type: 'Semiconductor Wafer Fabrication',
      square_footage: 1720000,
      headcount: 4900,
      annual_mwh: 34000,
      water_m3_yr: 1850000,
      waste_tons_yr: 1900,
      recycled_pct: 88.0,
      solar_kwp: 2100,
      status: 'monitored',
      created_at: new Date(Date.now() - 300 * 86400000).toISOString()
    },
    {
      id: '44444444-4444-4444-4444-444444444444',
      name: 'Aerospace Assembly Works',
      site: 'High-Bay Integration & Assembly Line',
      location: 'Regional Zone D',
      lat: 47.9253,
      lng: -122.2818,
      grid_region: 'Northwest Interconnect',
      grid_carbon_intensity: 0.114,
      facility_type: 'Aerospace Final Assembly',
      square_footage: 4300000,
      headcount: 30000,
      annual_mwh: 52000,
      water_m3_yr: 620000,
      waste_tons_yr: 3100,
      recycled_pct: 78.5,
      solar_kwp: 3200,
      status: 'monitored',
      created_at: new Date(Date.now() - 365 * 86400000).toISOString()
    }
  ],
  modules: [
    { id: 'm-1', key: 'energy', name: 'Energy & Electrical Infrastructure', description: 'Audits of 480V substation feeders, peak demand tariffs, baseload power factor, compressed air leaks, and chiller ΔT loops.', icon: 'Zap', badge: 'Active', is_active: true, order_index: 1 },
    { id: 'm-2', key: 'water', name: 'Water & Thermal Loops', description: 'Closed-loop cooling tower cycles of concentration (CoC), reverse osmosis reject streams, boiler steam traps, and rainwater harvesting.', icon: 'Droplets', badge: 'Active', is_active: true, order_index: 2 },
    { id: 'm-3', key: 'waste', name: 'Circular Economy & Material Streams', description: 'Certified landfill diversion ratios, polymer resin compaction, electronic scrap recovery, and industrial hazardous solvent recycling.', icon: 'Trash2', badge: 'Active', is_active: true, order_index: 3 },
    { id: 'm-4', key: 'thermal', name: 'Process Heating & Steam', description: 'Boiler combustion efficiency (O2 trim), economizer flue gas heat recovery, steam trap leakage rates, and heat pump electrification.', icon: 'Flame', badge: 'Active', is_active: true, order_index: 4 },
    { id: 'm-5', key: 'investment', name: 'CapEx & Decarbonization ROI', description: 'Financial payback modeling, IRA 48C tax credits, utility peak demand shaving arbitrage, and Scope 1-3 marginal abatement cost curves (MACC).', icon: 'TrendingUp', badge: 'Active', is_active: true, order_index: 5 }
  ],
  survey_questions: [
    // --- ENERGY MODULE QUESTIONS ---
    {
      id: 'q-energy-1-baseload',
      module_key: 'energy',
      question_text: 'What is your facility\'s continuous off-shift baseload electrical draw as a percentage of peak daytime demand?',
      question_type: 'single_choice',
      engineering_context: 'Facilities with baseloads >60% of peak during unpopulated nights or weekends typically suffer from unmanaged HVAC, idling compressors, or unzoned lighting.',
      is_required: true,
      order_index: 1,
      options: [
        { label: 'Severe (>68% of peak) — Heavy equipment and HVAC run continuously unthrottled', value: 'baseload_severe', score_penalty: 15 },
        { label: 'Moderate (45% - 68% of peak) — Basic manual shutdown routines with noticeable parasitic draw', value: 'baseload_moderate', score_penalty: 8 },
        { label: 'Optimized (<45% of peak) — Automated BMS setbacks, sleep states, and variable primary pumps', value: 'baseload_optimized', score_penalty: 0 },
        { label: 'Unmetered / Unknown — Only aggregate monthly utility bill available without 15-min interval data', value: 'baseload_unknown', score_penalty: 12 }
      ]
    },
    {
      id: 'q-energy-2-chiller',
      module_key: 'energy',
      question_text: 'What is the chilled water supply/return temperature differential (ΔT) across your central chiller plant?',
      question_type: 'single_choice',
      engineering_context: 'Low ΔT syndrome (<6°F) forces chillers and secondary distribution pumps to operate far outside design efficiency, increasing plant kWh by 15-25%.',
      is_required: true,
      order_index: 2,
      options: [
        { label: 'Degraded Low ΔT (<6°F / 3.3°C) — Frequent staging of excess chillers just to meet flow demand', value: 'chiller_low_dt', score_penalty: 14 },
        { label: 'Standard Constant Volume (7°F - 9°F) — Fixed setpoints with 3-way bypass valves', value: 'chiller_standard_dt', score_penalty: 6 },
        { label: 'High-Efficiency Variable Primary Flow (≥12°F / 6.7°C) — Active VFD staging & reset control', value: 'chiller_high_dt', score_penalty: 0 },
        { label: 'No Central Chilled Water Plant — Direct expansion (DX) rooftop packaged units only', value: 'chiller_dx_only', score_penalty: 4 }
      ]
    },
    {
      id: 'q-energy-3-air',
      module_key: 'energy',
      question_text: 'When was your plant compressed air distribution system last audited with ultrasonic leak detection?',
      question_type: 'single_choice',
      engineering_context: 'Compressed air is the most expensive industrial utility (requiring ~8 hp of electricity to generate 1 hp of air work). Unaudited systems lose 25-35% of output to leaks.',
      is_required: true,
      order_index: 3,
      options: [
        { label: 'Never or >18 months ago — System runs near maximum duty cycle continuously', value: 'air_leaks_high', score_penalty: 12 },
        { label: '6 - 18 months ago — Periodic tag-and-repair maintenance program in place', value: 'air_leaks_moderate', score_penalty: 5 },
        { label: 'Continuous Acoustic IoT Monitoring or <6 months audit with pressure dew point control', value: 'air_leaks_monitored', score_penalty: 0 },
        { label: 'Facility does not use centralized industrial compressed air', value: 'air_not_used', score_penalty: 0 }
      ]
    },
    {
      id: 'q-energy-4-pf',
      module_key: 'energy',
      question_text: 'What is the facility average Power Factor (PF) and are you billed utility reactive demand surcharges?',
      question_type: 'single_choice',
      engineering_context: 'A power factor below 0.90 indicates inductive motor loads drawing uncompensated reactive kVAR, leading to grid fines and transformer thermal losses.',
      is_required: true,
      order_index: 4,
      options: [
        { label: 'Low PF (<0.88) with regular monthly reactive power penalty charges on electric bills', value: 'pf_penalties', score_penalty: 10 },
        { label: 'Marginal PF (0.89 - 0.93) without direct penalty, but near utility tariff threshold', value: 'pf_marginal', score_penalty: 4 },
        { label: 'High PF (≥0.96) with automatic capacitor bank steps or active active harmonic filters (AHF)', value: 'pf_corrected', score_penalty: 0 }
      ]
    },
    {
      id: 'q-energy-5-lighting',
      module_key: 'energy',
      question_text: 'What percentage of manufacturing high-bays and warehouse storage zones feature networked daylight harvesting & occupancy sensors?',
      question_type: 'single_choice',
      engineering_context: 'Daylight harvesting dimmers automatically throttle high-bay fixtures during sunny hours, cutting lighting baseload by up to 60%.',
      is_required: true,
      order_index: 5,
      options: [
        { label: '<25% — High-bay lights remain on full manual illumination 24/7 during operations', value: 'light_manual', score_penalty: 8 },
        { label: '25% - 75% — Static LED fixtures installed, but lacking automated daylight/occupancy dimming', value: 'light_static_led', score_penalty: 3 },
        { label: '>85% — Networked DALI / 0-10V fixtures with continuous photocell daylight harvesting', value: 'light_smart_harvesting', score_penalty: 0 }
      ]
    },

    // --- WATER & THERMAL LOOP QUESTIONS ---
    {
      id: 'q-water-1-coc',
      module_key: 'water',
      question_text: 'At what Cycles of Concentration (CoC) do your evaporative cooling towers operate before blowdown purge?',
      question_type: 'single_choice',
      engineering_context: 'Increasing cooling tower concentration cycles from 3.0x to 6.0x reduces makeup water consumption by 20-30% and dramatically cuts sewer treatment costs.',
      is_required: true,
      order_index: 1,
      options: [
        { label: 'Low (<3.2 CoC) — Dumping high volume makeup water due to hard water scaling fears', value: 'coc_low', score_penalty: 15 },
        { label: 'Standard (3.5 - 5.0 CoC) — Automated conductivity bleed valve with chemical inhibitor dosing', value: 'coc_standard', score_penalty: 5 },
        { label: 'High Efficiency (≥6.5 CoC) — Acid feed / softening pre-treatment with side-stream filtration', value: 'coc_high', score_penalty: 0 },
        { label: 'No Evaporative Cooling Towers — Closed-loop glycol adiabatic dry coolers only', value: 'coc_dry_cooler', score_penalty: 0 }
      ]
    },
    {
      id: 'q-water-2-reclaim',
      module_key: 'water',
      question_text: 'What proportion of process rinse water, reverse osmosis (RO) reject, or condensate is recycled on-site?',
      question_type: 'single_choice',
      engineering_context: 'RO reject streams and AHU cooling coil condensate provide high-purity, soft water ideal for direct boiler makeup or cooling tower feedwater.',
      is_required: true,
      order_index: 2,
      options: [
        { label: '0% — 100% of RO reject and rinse discharge flows directly into municipal industrial sewer', value: 'water_recycle_none', score_penalty: 14 },
        { label: '15% - 40% — Condensate and single rinse tanks captured for secondary washdown use', value: 'water_recycle_partial', score_penalty: 6 },
        { label: '>60% — Dedicated ultrafiltration/RO closed-loop reclamation and rainwater cistern system', value: 'water_recycle_closed_loop', score_penalty: 0 }
      ]
    },

    // --- WASTE & CIRCULAR ECONOMY QUESTIONS ---
    {
      id: 'q-waste-1-diversion',
      module_key: 'waste',
      question_text: 'What is your audited plant-wide solid waste landfill diversion rate over the past 12 months?',
      question_type: 'single_choice',
      engineering_context: 'TRUE Zero Waste and ISO 14001 facilities maintain >90% diversion by segregated baling of corrugated cardboard, LDPE films, and metals.',
      is_required: true,
      order_index: 1,
      options: [
        { label: '<35% Diversion — Majority of manufacturing packaging and production scrap enters general landfill compactors', value: 'waste_div_poor', score_penalty: 16 },
        { label: '35% - 70% Diversion — Cardboard and scrap metals recycled; mixed plastics and organics landfilled', value: 'waste_div_moderate', score_penalty: 8 },
        { label: '>85% Diversion (Zero Waste Target) — Segregated polymer baling, composting, and circular remanufacturing', value: 'waste_div_excellent', score_penalty: 0 }
      ]
    },
    {
      id: 'q-waste-2-solvents',
      module_key: 'waste',
      question_text: 'How are industrial solvents, degreasers, and process cutting fluids managed?',
      question_type: 'single_choice',
      engineering_context: 'On-site vacuum solvent distillation recovers 85-95% of virgin chemical solvents, eliminating hazardous waste hauling manifest liabilities.',
      is_required: true,
      order_index: 2,
      options: [
        { label: 'Hauled off-site for high-temperature hazardous thermal incineration without material recovery', value: 'solvent_incinerate', score_penalty: 12 },
        { label: 'Blended off-site for secondary industrial kiln fuel substitution', value: 'solvent_fuel_blend', score_penalty: 6 },
        { label: 'On-site closed-loop fractional vacuum distillation or switched to water-based bio-degreasers', value: 'solvent_closed_loop', score_penalty: 0 },
        { label: 'Process does not utilize hazardous chemical solvents or oils', value: 'solvent_not_used', score_penalty: 0 }
      ]
    }
  ],
  survey_branch_rules: [
    { id: 'b-1', question_id: 'q-energy-1-baseload', trigger_option_value: 'baseload_severe', next_question_id: 'q-energy-2-chiller' },
    { id: 'b-2', question_id: 'q-energy-1-baseload', trigger_option_value: 'baseload_moderate', next_question_id: 'q-energy-2-chiller' }
  ],
  survey_sessions: [
    {
      id: 'session-demo',
      org_id: '11111111-1111-1111-1111-111111111111',
      module_key: 'energy',
      status: 'completed',
      created_at: new Date(Date.now() - 30 * 86400000).toISOString()
    }
  ],
  survey_answers: [
    { id: 'ans-1', session_id: 'session-demo', question_id: 'q-energy-1-baseload', answer_value: 'baseload_severe', created_at: new Date().toISOString() },
    { id: 'ans-2', session_id: 'session-demo', question_id: 'q-energy-2-chiller', answer_value: 'chiller_low_dt', created_at: new Date().toISOString() },
    { id: 'ans-3', session_id: 'session-demo', question_id: 'q-energy-3-air', answer_value: 'air_leaks_high', created_at: new Date().toISOString() }
  ],
  documents: [
    {
      id: 'doc-jul-2026',
      file_name: 'Apex_Plant04_Electric_Utility_July2026.pdf',
      file_size: 248900,
      file_type: 'PDF',
      storage_path: '/uploads/Apex_Plant04_Electric_Utility_July2026.pdf',
      status: 'parsed',
      created_at: new Date(Date.now() - 5 * 86400000).toISOString()
    },
    {
      id: 'doc-jun-2026',
      file_name: 'Apex_Municipal_Water_Meter_Q2_2026.xlsx',
      file_size: 112400,
      file_type: 'XLSX',
      storage_path: '/uploads/Apex_Municipal_Water_Meter_Q2_2026.xlsx',
      status: 'parsed',
      created_at: new Date(Date.now() - 35 * 86400000).toISOString()
    }
  ],
  document_extractions: [
    {
      id: 'ext-jul-2026',
      document_id: 'doc-jul-2026',
      billing_period: 'July 2026',
      consumption: 142500,
      unit: 'kWh',
      amount: 18525.50,
      confidence_score: 0.98,
      created_at: new Date(Date.now() - 5 * 86400000).toISOString()
    }
  ],
  utility_bills: [
    { id: 'bill-1', billing_period: 'March 2026', consumption: 168000, cost: 21840, peak_kw: 520, emissions_tco2: 64.7 },
    { id: 'bill-2', billing_period: 'April 2026', consumption: 159000, cost: 20670, peak_kw: 495, emissions_tco2: 61.2 },
    { id: 'bill-3', billing_period: 'May 2026', consumption: 151000, cost: 19630, peak_kw: 480, emissions_tco2: 58.1 },
    { id: 'bill-4', billing_period: 'June 2026', consumption: 146000, cost: 18980, peak_kw: 472, emissions_tco2: 56.2 },
    { id: 'bill-5', billing_period: 'July 2026', consumption: 142500, cost: 18525, peak_kw: 460, emissions_tco2: 54.8 }
  ],
  waste_records: [
    { id: 'w-1', period: 'July 2026', total_waste_kg: 12500, recycled_kg: 4800, composted_kg: 2100, landfill_kg: 5600, diversion_rate: 55.2 }
  ],
  analysis_results: [
    {
      id: 'res-latest',
      org_id: '11111111-1111-1111-1111-111111111111',
      primary_concern: 'Continuous chiller baseload draw & Low ΔT syndrome during night operations',
      probable_root_cause: 'Unthrottled secondary pump speeds and sub-optimal variable frequency drive (VFD) differential pressure setpoints keeping chiller plant operating at 68% load during unpopulated shifts.',
      company_need: 'Automated BMS night-purge scheduling, variable primary chiller staging, and ultrasonic compressed air leak elimination.',
      reasoning: 'Analysis of 142,500 kWh monthly electrical load across double-shift manufacturing shows baseload remains at 312 kW even when assembly lines are halted.',
      trade_offs: 'Low capital expenditure (<$3,500 for control reprogramming); yields immediate $14,200 annual utility savings with payback in under 4 months.',
      created_at: new Date().toISOString()
    }
  ],
  sustainability_scores: [
    {
      id: 'score-1',
      org_id: '11111111-1111-1111-1111-111111111111',
      overall_score: 62,
      grade: 'C',
      energy_score: 58,
      water_score: 64,
      waste_score: 66,
      created_at: new Date(Date.now() - 120 * 86400000).toISOString()
    },
    {
      id: 'score-2',
      org_id: '11111111-1111-1111-1111-111111111111',
      overall_score: 67,
      grade: 'B',
      energy_score: 65,
      water_score: 68,
      waste_score: 70,
      created_at: new Date(Date.now() - 60 * 86400000).toISOString()
    },
    {
      id: 'score-3',
      org_id: '11111111-1111-1111-1111-111111111111',
      overall_score: 74,
      grade: 'B+',
      energy_score: 76,
      water_score: 71,
      waste_score: 75,
      created_at: new Date().toISOString()
    }
  ],
  recommendations: [
    {
      id: 'rec-1',
      module_key: 'energy',
      category: 'HVAC & Controls',
      title: 'Automated BMS HVAC Scheduling & Variable Primary Chiller Staging',
      description: 'Program smart override timers and variable primary flow sequencing to eliminate low ΔT syndrome and throttle chillers during off-peak weekend windows.',
      cost_level: 'Low',
      impact_level: 'High',
      score_delta: 7,
      difficulty: 'Easy',
      disruption: 'Low',
      est_payback: '4 Months',
      est_annual_savings: '$14,200 / yr',
      co2_reduction: '18.4 t CO2e',
      capex_estimate: '$2,800'
    },
    {
      id: 'rec-2',
      module_key: 'energy',
      category: 'Renewables',
      title: 'Rooftop Solar PV Array Expansion (150 kWp)',
      description: 'Install high-efficiency monocrystalline solar panels with smart microinverters across Main Production Hall and Warehouse B roof.',
      cost_level: 'High',
      impact_level: 'High',
      score_delta: 12,
      difficulty: 'Hard',
      disruption: 'Medium',
      est_payback: '3.8 Years',
      est_annual_savings: '$32,600 / yr',
      co2_reduction: '44.8 t CO2e',
      capex_estimate: '$115,000'
    },
    {
      id: 'rec-3',
      module_key: 'energy',
      category: 'Compressed Air',
      title: 'Plant Ultrasonic Compressed Air Leak Audit & Auto-Isolation Solenoids',
      description: 'Perform complete ultrasonic acoustic survey across production headers and install automated section shutoff valves on unpopulated machine bays.',
      cost_level: 'Low',
      impact_level: 'High',
      score_delta: 6,
      difficulty: 'Easy',
      disruption: 'Low',
      est_payback: '3 Months',
      est_annual_savings: '$9,800 / yr',
      co2_reduction: '14.2 t CO2e',
      capex_estimate: '$2,400'
    },
    {
      id: 'rec-4',
      module_key: 'waste',
      category: 'Circular Economy',
      title: 'Establish Dedicated Clean Polymer Baler & Organics Composting',
      description: 'Divert LDPE packaging films, stretch wrap, and food waste from landfill compactors into certified municipal polymer recyclers and composting programs.',
      cost_level: 'Low',
      impact_level: 'Medium',
      score_delta: 5,
      difficulty: 'Easy',
      disruption: 'Low',
      est_payback: '7 Months',
      est_annual_savings: '$4,800 / yr',
      co2_reduction: '9.2 t CO2e',
      capex_estimate: '$1,500'
    },
    {
      id: 'rec-5',
      module_key: 'water',
      category: 'Water Loops',
      title: 'Cooling Tower Conductivity Controller & Closed-Loop Bleed Recycling',
      description: 'Install submetering and automated conductivity bleed control to increase cycles of concentration from 3.2x to 6.5x, saving 28,000 L of makeup water monthly.',
      cost_level: 'Medium',
      impact_level: 'High',
      score_delta: 6,
      difficulty: 'Medium',
      disruption: 'Medium',
      est_payback: '14 Months',
      est_annual_savings: '$8,600 / yr',
      co2_reduction: '5.1 t CO2e',
      capex_estimate: '$9,200'
    }
  ],
  action_plans: [
    {
      id: 'plan-1',
      org_id: '11111111-1111-1111-1111-111111111111',
      recommendation_id: 'rec-1',
      status: 'in_progress',
      assigned_to: 'Facilities Engineering Team',
      target_completion: '2026-09-30',
      created_at: new Date(Date.now() - 14 * 86400000).toISOString()
    },
    {
      id: 'plan-2',
      org_id: '11111111-1111-1111-1111-111111111111',
      recommendation_id: 'rec-3',
      status: 'completed',
      assigned_to: 'Maintenance Supervisor (R. Torres)',
      target_completion: '2026-08-15',
      created_at: new Date(Date.now() - 45 * 86400000).toISOString()
    }
  ],
  emission_factors: [
    { id: 'ef-ercot', category: 'electricity', region: 'US-ERCOT (Texas)', factor_value: 0.3850, unit: 'kg CO2e / kWh', source: 'EPA eGRID 2026 (ERCT Subregion)' },
    { id: 'ef-caiso', category: 'electricity', region: 'US-CAISO (California)', factor_value: 0.2180, unit: 'kg CO2e / kWh', source: 'EPA eGRID 2026 (CAMX Subregion)' },
    { id: 'ef-pjm', category: 'electricity', region: 'US-PJM (Mid-Atlantic/Midwest)', factor_value: 0.4420, unit: 'kg CO2e / kWh', source: 'EPA eGRID 2026 (RFCE Subregion)' },
    { id: 'ef-nwpp', category: 'electricity', region: 'US-NWPP (Northwest / Nevada)', factor_value: 0.2580, unit: 'kg CO2e / kWh', source: 'EPA eGRID 2026 (NWPP Hydro mix)' },
    { id: 'ef-entsoe-de', category: 'electricity', region: 'Germany (ENTSO-E)', factor_value: 0.3800, unit: 'kg CO2e / kWh', source: 'Umweltbundesamt / ENTSO-E 2026' },
    { id: 'ef-eirgrid', category: 'electricity', region: 'Ireland (EirGrid)', factor_value: 0.3180, unit: 'kg CO2e / kWh', source: 'SEAI / EirGrid Smart Grid' },
    { id: 'ef-water', category: 'water', region: 'Global Municipal Baseline', factor_value: 0.0003, unit: 'kg CO2e / litre', source: 'US Water Alliance & EPA' },
    { id: 'ef-waste-landfill', category: 'waste_landfill', region: 'EPA WARM Mixed Solid Waste', factor_value: 0.7200, unit: 'kg CO2e / kg', source: 'EPA WARM v15' }
  ],
  benchmarks: [
    { id: 'bm-1', category: 'energy', metric_name: 'Cleanroom / High-Tech Manufacturing (kWh / sq ft / yr)', median_value: 48.5, top_decile: 24.2, unit: 'kWh/sqft/yr' },
    { id: 'bm-2', category: 'energy', metric_name: 'General Industrial Assembly (kWh / sq ft / yr)', median_value: 16.8, top_decile: 9.5, unit: 'kWh/sqft/yr' },
    { id: 'bm-3', category: 'water', metric_name: 'Industrial Process Water Recycling Rate (%)', median_value: 42.0, top_decile: 82.0, unit: '%' },
    { id: 'bm-4', category: 'waste', metric_name: 'Manufacturing Landfill Waste Diversion (%)', median_value: 68.0, top_decile: 95.0, unit: '%' }
  ],
  iot_devices: [
    { id: 'iot-1', device_code: '480V_SUBSTATION_MAIN', meter_name: 'Main Substation 480V Feeder 01', zone: 'Substation Yard', metric: 'electricity', unit: 'kW', base: 284.5, variance: 18.0, status: 'online' },
    { id: 'iot-2', device_code: 'CHILLER_DELTA_T', meter_name: 'Chilled Water Loop Temperature Sensor', zone: 'HVAC Chiller Plant', metric: 'chw_delta_t', unit: '°F', base: 5.8, variance: 0.6, status: 'online' },
    { id: 'iot-3', device_code: 'COMPRESSED_AIR_SCFM', meter_name: 'Central Compressor Flow Meter', zone: 'Utility Bay 02', metric: 'compressed_air_flow', unit: 'SCFM', base: 420.0, variance: 45.0, status: 'online' },
    { id: 'iot-4', device_code: 'COOLING_TOWER_COC', meter_name: 'Cooling Tower Conductivity Analyzer', zone: 'Cooling Towers', metric: 'water_coc', unit: 'CoC', base: 3.2, variance: 0.2, status: 'online' },
    { id: 'iot-5', device_code: 'SOLAR_INVERTER_KWP', meter_name: 'Rooftop Solar PV Inverter Bank 01', zone: 'Rooftop Array', metric: 'solar_power', unit: 'kW', base: 98.4, variance: 12.0, status: 'online' },
    { id: 'iot-6', device_code: 'WASTE_COMPACTOR_LOAD', meter_name: 'Waste Compactor Bay Scale', zone: 'Recycling Docks', metric: 'waste_load', unit: 'kg', base: 240.0, variance: 30.0, status: 'online' }
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
        const parsed = JSON.parse(raw);
        this.store = { ...initialStore, ...parsed };
      } else {
        this.saveStore();
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
    const newRecord = {
      id: record.id || `id-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      ...record,
      created_at: record.created_at || new Date().toISOString()
    };
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

  exportAll() {
    return {
      version: '1.3.0',
      exported_at: new Date().toISOString(),
      storage_driver: 'generic-json-file',
      data: this.store
    };
  }

  importAll(incomingData) {
    if (!incomingData || typeof incomingData !== 'object') {
      throw new Error('Invalid backup data format');
    }
    const payload = incomingData.data || incomingData;
    this.store = { ...initialStore, ...payload };
    this.saveStore();
    return { success: true, count: Object.keys(this.store).length };
  }

  reset() {
    this.store = JSON.parse(JSON.stringify(initialStore));
    this.saveStore();
    return { success: true };
  }
}

export const db = new DataStore();
export default db;

