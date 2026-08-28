// EcoMind Mock Data Repository

export const activeModules = [
  {
    id: 'energy',
    name: 'Energy & Electricity',
    icon: 'Zap',
    badge: 'Active',
    description: 'Automatic ingestion of grid power utility bills, renewable PPA records, submetering CSVs, and HVAC load data.',
    kpis: { score: 72, trend: '+4%', mainDriver: 'Peak HVAC Load' },
    route: '/survey/energy'
  },
  {
    id: 'water',
    name: 'Water Management',
    icon: 'Droplets',
    badge: 'Active',
    description: 'Analyze municipal water meter readings, wastewater treatment logs, cooling tower cycles, and rainwater harvesting metrics.',
    kpis: { score: 81, trend: '+8%', mainDriver: 'Recycling Efficiency' },
    route: '/survey/water'
  },
  {
    id: 'waste',
    name: 'Waste Management',
    icon: 'Trash2',
    badge: 'Active',
    description: 'Track municipal waste manifests, hazardous chemical logs, composting receipts, and circular economy diversion ratios.',
    kpis: { score: 68, trend: '-2%', mainDriver: 'Landfill Diversion' },
    route: '/survey/waste'
  }
];

export const futureModules = [
  {
    id: 'transport',
    name: 'Transport & Mobility',
    icon: 'Truck',
    badge: 'Coming Soon',
    description: 'Scope 3 corporate fleet telemetry, employee commuting logs, and supply chain logistics carbon intensity calculation.',
    disabled: true
  },
  {
    id: 'investment',
    name: 'Investment Planning',
    icon: 'TrendingUp',
    badge: 'Coming Soon',
    description: 'CapEx allocation engine for solar payback, thermal retrofit ROI, and green financing tax credit optimization.',
    disabled: true
  },
  {
    id: 'custom',
    name: 'Custom Module',
    icon: 'Layers',
    badge: 'Enterprise',
    description: 'Build tailor-made sustainability indicators and custom AI diagnostic models for unique industrial processes.',
    disabled: true
  }
];

export const sampleIngestionFiles = [
  {
    id: 'doc-1',
    name: 'Electricity_Bill.pdf',
    type: 'PDF',
    size: '2.4 MB',
    date: '2026-08-15',
    status: 'Ready for Extraction',
    category: 'Energy & Electricity',
    icon: 'FileText'
  },
  {
    id: 'doc-2',
    name: 'Water_Bill.pdf',
    type: 'PDF',
    size: '1.1 MB',
    date: '2026-08-10',
    status: 'Ready for Extraction',
    category: 'Water Management',
    icon: 'FileText'
  },
  {
    id: 'doc-3',
    name: 'Waste_Report.xlsx',
    type: 'XLSX',
    size: '4.8 MB',
    date: '2026-08-02',
    status: 'Ready for Extraction',
    category: 'Waste Management',
    icon: 'Spreadsheet'
  }
];

export const mockEcoScoreAnalysis = {
  overallScore: 74,
  grade: 'B+',
  organization: 'Apex Industrial Solutions',
  lastUpdated: '2026-08-28',
  breakdown: [
    { category: 'Energy & Electricity', score: 72, weight: '45%', status: 'Moderate', color: '#10b981' },
    { category: 'Water Management', score: 81, weight: '30%', status: 'Strong', color: '#0d9488' },
    { category: 'Waste Management', score: 68, weight: '25%', status: 'Needs Improvement', color: '#f59e0b' }
  ],
  rootCauseDiagnosis: [
    {
      id: 'diag-1',
      title: 'Off-Peak Energy Spikes in Facility B',
      severity: 'High Impact',
      confidence: '94%',
      finding: 'Chiller units running at 85% capacity between 11 PM and 4 AM on weekends due to override timers not resetting.',
      impact: '18.4 metric tons CO2e excess annually ($14,200 avoidable utility spend)'
    },
    {
      id: 'diag-2',
      title: 'Low Organic Waste Diversion',
      severity: 'Medium Impact',
      confidence: '88%',
      finding: 'Cafeteria and processing organic waste streams are mixed with general landfill compactors.',
      impact: '9.2 metric tons CO2e methane potential ($4,800 disposal fee reduction potential)'
    }
  ]
};

export const mockRecommendations = [
  {
    id: 'rec-1',
    category: 'Energy',
    title: 'Implement Automated BMS HVAC Scheduling Override',
    roi: '4 Months',
    estSavings: '$14,200 / yr',
    co2Reduction: '18.4 t CO2e',
    effort: 'Low',
    priority: 'High'
  },
  {
    id: 'rec-2',
    category: 'Waste',
    title: 'Establish Dedicated Organic Composting Pipeline',
    roi: '7 Months',
    estSavings: '$4,800 / yr',
    co2Reduction: '9.2 t CO2e',
    effort: 'Medium',
    priority: 'High'
  },
  {
    id: 'rec-3',
    category: 'Water',
    title: 'Cooling Tower Closed-Loop Recirculation Upgrade',
    roi: '14 Months',
    estSavings: '$8,600 / yr',
    co2Reduction: '5.1 t CO2e',
    effort: 'Medium',
    priority: 'Medium'
  }
];

export const mockProgressData = [
  { month: 'Mar 2026', score: 62, energy: 60, water: 70, waste: 58 },
  { month: 'Apr 2026', score: 65, energy: 63, water: 72, waste: 60 },
  { month: 'May 2026', score: 68, energy: 67, water: 75, waste: 61 },
  { month: 'Jun 2026', score: 71, energy: 69, water: 78, waste: 65 },
  { month: 'Jul 2026', score: 72, energy: 70, water: 80, waste: 66 },
  { month: 'Aug 2026', score: 74, energy: 72, water: 81, waste: 68 }
];
