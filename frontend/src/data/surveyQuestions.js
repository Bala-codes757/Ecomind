// EcoMind Fallback Questions for Survey when running standalone or client-side
export const FALLBACK_SURVEY_QUESTIONS = {
  energy: [
    {
      id: 'q-energy-1',
      module_key: 'energy',
      question_text: 'What is your primary operational energy concern?',
      question_type: 'single_choice',
      order_index: 1,
      options: [
        { label: 'High electricity bill / peak tariffs', value: 'high_bill', score_penalty: 15 },
        { label: 'High overall electricity consumption', value: 'high_consumption', score_penalty: 12 },
        { label: 'Off-peak energy wastage & leaks', value: 'energy_leak', score_penalty: 10 },
        { label: 'Reduce Scope 1 & 2 carbon footprint', value: 'reduce_emissions', score_penalty: 0 },
        { label: "Don't know where energy is being consumed", value: 'unknown', score_penalty: 18 }
      ]
    },
    {
      id: 'q-energy-2-hvac',
      module_key: 'energy',
      question_text: 'Which equipment category consumes the most power during operations?',
      question_type: 'single_choice',
      order_index: 2,
      options: [
        { label: 'HVAC / Industrial Chillers & Cooling Towers', value: 'hvac', score_penalty: 10 },
        { label: 'Heavy Manufacturing Machinery & Motors', value: 'machinery', score_penalty: 8 },
        { label: 'Facility High-Bay Lighting', value: 'lighting', score_penalty: 4 },
        { label: 'Data Center / IT Server Infrastructure', value: 'it_servers', score_penalty: 6 },
        { label: 'Other Process Equipment', value: 'other', score_penalty: 5 }
      ]
    },
    {
      id: 'q-energy-3-schedule',
      module_key: 'energy',
      question_text: 'How many hours does your organization operate per day?',
      question_type: 'single_choice',
      order_index: 3,
      options: [
        { label: 'Standard Single Shift (8 Hours / 5 Days)', value: 'shift_8h', score_penalty: 0 },
        { label: 'Double Shift (16 Hours / 5 Days)', value: 'shift_16h', score_penalty: 5 },
        { label: '24/7 Continuous Operations', value: 'shift_24h', score_penalty: 10 }
      ]
    }
  ],
  water: [
    {
      id: 'q-water-1',
      module_key: 'water',
      question_text: 'What is your primary water management priority?',
      question_type: 'single_choice',
      order_index: 1,
      options: [
        { label: 'Cooling tower blowdown & evaporation optimization', value: 'cooling_towers', score_penalty: 8 },
        { label: 'Process water recycling & zero-liquid discharge', value: 'recycling', score_penalty: 0 },
        { label: 'High municipal water & sewer utility tariffs', value: 'high_tariffs', score_penalty: 12 },
        { label: 'Rainwater harvesting and stormwater capture', value: 'rainwater', score_penalty: 2 }
      ]
    },
    {
      id: 'q-water-2',
      module_key: 'water',
      question_text: 'Do you have submetering installed on your major water consuming processes?',
      question_type: 'single_choice',
      order_index: 2,
      options: [
        { label: 'Comprehensive digital telemetry across all loops', value: 'full_telemetry', score_penalty: 0 },
        { label: 'Main municipal revenue meter only', value: 'main_only', score_penalty: 14 },
        { label: 'Partial submetering on chillers/boilers only', value: 'partial', score_penalty: 6 }
      ]
    },
    {
      id: 'q-water-3',
      module_key: 'water',
      question_text: 'What percentage of industrial wastewater is treated and reused on site?',
      question_type: 'single_choice',
      order_index: 3,
      options: [
        { label: 'Greater than 50% closed-loop reuse', value: 'high_reuse', score_penalty: 0 },
        { label: '10% to 50% secondary process recycling', value: 'moderate_reuse', score_penalty: 5 },
        { label: 'Less than 10% or direct municipal sewer discharge', value: 'low_reuse', score_penalty: 15 }
      ]
    }
  ],
  waste: [
    {
      id: 'q-waste-1',
      module_key: 'waste',
      question_text: 'What is your primary waste stream concern?',
      question_type: 'single_choice',
      order_index: 1,
      options: [
        { label: 'High landfill tipping and disposal fees', value: 'landfill_fees', score_penalty: 12 },
        { label: 'Scrap material recycling and circular economy recovery', value: 'scrap_recycling', score_penalty: 0 },
        { label: 'Hazardous or regulated byproduct handling', value: 'hazardous', score_penalty: 15 },
        { label: 'Packaging and single-use material reduction', value: 'packaging', score_penalty: 6 }
      ]
    },
    {
      id: 'q-waste-2',
      module_key: 'waste',
      question_text: 'What is your current estimated facility landfill diversion rate?',
      question_type: 'single_choice',
      order_index: 2,
      options: [
        { label: 'Over 80% (Zero-Waste to Landfill certified)', value: 'over_80', score_penalty: 0 },
        { label: '50% - 80% (Systematic sorting and recycling)', value: '50_to_80', score_penalty: 5 },
        { label: '20% - 50% (Basic cardboard and scrap sorting)', value: '20_to_50', score_penalty: 10 },
        { label: 'Under 20% (Mostly unsegregated waste)', value: 'under_20', score_penalty: 18 }
      ]
    },
    {
      id: 'q-waste-3',
      module_key: 'waste',
      question_text: 'Do you track waste manifests and contractor recycling certificates digitally?',
      question_type: 'single_choice',
      order_index: 3,
      options: [
        { label: 'Yes, automated digital tracking with weight certificates', value: 'digital_tracked', score_penalty: 0 },
        { label: 'Paper receipts filed periodically', value: 'paper_tracked', score_penalty: 6 },
        { label: 'No structured tracking or verification', value: 'untracked', score_penalty: 14 }
      ]
    }
  ]
};
