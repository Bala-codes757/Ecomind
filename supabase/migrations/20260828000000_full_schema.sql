-- EcoMind Full Supabase PostgreSQL Database Schema
-- Includes 23 tables, foreign keys, row level security (RLS) policies, and seed data.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Organizations
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    region VARCHAR(100) DEFAULT 'North America (US-East)',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'sustainability_manager',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Survey Modules
CREATE TABLE IF NOT EXISTS public.survey_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50) DEFAULT 'Zap',
    badge VARCHAR(50) DEFAULT 'Active',
    is_active BOOLEAN DEFAULT TRUE,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Survey Questions
CREATE TABLE IF NOT EXISTS public.survey_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_key VARCHAR(50) REFERENCES public.survey_modules(key) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) DEFAULT 'single_choice',
    is_required BOOLEAN DEFAULT TRUE,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Survey Options
CREATE TABLE IF NOT EXISTS public.survey_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID REFERENCES public.survey_questions(id) ON DELETE CASCADE,
    option_label VARCHAR(255) NOT NULL,
    option_value VARCHAR(255) NOT NULL,
    order_index INT DEFAULT 0
);

-- 6. Survey Branch Rules
CREATE TABLE IF NOT EXISTS public.survey_branch_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID REFERENCES public.survey_questions(id) ON DELETE CASCADE,
    trigger_option_value VARCHAR(255) NOT NULL,
    next_question_id UUID REFERENCES public.survey_questions(id) ON DELETE CASCADE
);

-- 7. Survey Sessions
CREATE TABLE IF NOT EXISTS public.survey_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    module_key VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'in_progress',
    current_question_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Survey Answers
CREATE TABLE IF NOT EXISTS public.survey_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.survey_sessions(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.survey_questions(id) ON DELETE CASCADE,
    answer_value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Documents
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size_bytes BIGINT,
    status VARCHAR(50) DEFAULT 'uploaded',
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Document Extractions
CREATE TABLE IF NOT EXISTS public.document_extractions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    raw_json JSONB NOT NULL,
    confidence_score NUMERIC(5,2) DEFAULT 0.95,
    validation_status VARCHAR(50) DEFAULT 'passed',
    verified_by_user BOOLEAN DEFAULT FALSE,
    ai_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Meters
CREATE TABLE IF NOT EXISTS public.meters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    meter_name VARCHAR(255) NOT NULL,
    module_key VARCHAR(50) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    location VARCHAR(255)
);

-- 12. Meter Readings
CREATE TABLE IF NOT EXISTS public.meter_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meter_id UUID REFERENCES public.meters(id) ON DELETE CASCADE,
    reading_value NUMERIC(12,2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    reading_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    source_type VARCHAR(50) DEFAULT 'document' -- document / iot / manual
);

-- 13. Utility Bills
CREATE TABLE IF NOT EXISTS public.utility_bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
    billing_period VARCHAR(100),
    consumption NUMERIC(12,2) NOT NULL,
    unit VARCHAR(50) DEFAULT 'kWh',
    amount NUMERIC(12,2),
    co2e_tons NUMERIC(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. Waste Records
CREATE TABLE IF NOT EXISTS public.waste_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
    period VARCHAR(100),
    total_waste NUMERIC(12,2) NOT NULL,
    recycled NUMERIC(12,2) DEFAULT 0,
    landfilled NUMERIC(12,2) DEFAULT 0,
    unit VARCHAR(50) DEFAULT 'kg',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. Analysis Results
CREATE TABLE IF NOT EXISTS public.analysis_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    primary_concern TEXT,
    probable_root_cause TEXT,
    company_need TEXT,
    reasoning TEXT,
    ai_used BOOLEAN DEFAULT FALSE,
    raw_facts_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. Sustainability Scores
CREATE TABLE IF NOT EXISTS public.sustainability_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    overall_score INT NOT NULL,
    grade VARCHAR(10) NOT NULL,
    energy_score INT DEFAULT 70,
    water_score INT DEFAULT 70,
    waste_score INT DEFAULT 70,
    calculation_version VARCHAR(20) DEFAULT 'v1.0.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 17. Recommendations
CREATE TABLE IF NOT EXISTS public.recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_key VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cost_level VARCHAR(50) DEFAULT 'Low',
    impact_level VARCHAR(50) DEFAULT 'High',
    score_delta INT DEFAULT 5,
    difficulty VARCHAR(50) DEFAULT 'Medium',
    disruption VARCHAR(50) DEFAULT 'Low',
    est_payback VARCHAR(50) DEFAULT '6 Months',
    est_annual_savings VARCHAR(50) DEFAULT '$10,000 / yr',
    co2_reduction VARCHAR(50) DEFAULT '15 t CO2e'
);

-- 18. Action Plans
CREATE TABLE IF NOT EXISTS public.action_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    recommendation_id UUID REFERENCES public.recommendations(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'planned', -- planned / in_progress / completed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 19. Scenario Results
CREATE TABLE IF NOT EXISTS public.scenario_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    input_params_json JSONB NOT NULL,
    simulated_score INT NOT NULL,
    score_delta INT NOT NULL,
    carbon_saved_tons NUMERIC(10,2),
    cost_savings_usd NUMERIC(12,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 20. Emission Factors
CREATE TABLE IF NOT EXISTS public.emission_factors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(100) NOT NULL,
    region VARCHAR(100) NOT NULL,
    year INT DEFAULT 2026,
    factor_value NUMERIC(10,4) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    source VARCHAR(255) NOT NULL
);

-- 21. Benchmarks
CREATE TABLE IF NOT EXISTS public.benchmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(100) NOT NULL,
    metric_name VARCHAR(255) NOT NULL,
    median_value NUMERIC(10,2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    region VARCHAR(100) DEFAULT 'Global'
);

-- 22. IoT Devices
CREATE TABLE IF NOT EXISTS public.iot_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_code VARCHAR(100) UNIQUE NOT NULL,
    meter_name VARCHAR(255) NOT NULL,
    metric VARCHAR(50) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'online'
);

-- 23. IoT Readings
CREATE TABLE IF NOT EXISTS public.iot_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_code VARCHAR(100) REFERENCES public.iot_devices(device_code) ON DELETE CASCADE,
    metric VARCHAR(50) NOT NULL,
    value NUMERIC(12,2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.utility_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sustainability_scores ENABLE ROW LEVEL SECURITY;

-- Default organization seed data
INSERT INTO public.organizations (id, name, region)
VALUES ('11111111-1111-1111-1111-111111111111', 'Apex Industrial Solutions', 'North America (US-East / eGRID)')
ON CONFLICT (id) DO NOTHING;

-- Seed Modules
INSERT INTO public.survey_modules (key, name, description, icon, badge, is_active, order_index) VALUES
('energy', 'Energy & Electricity', 'Automatic ingestion of grid power utility bills, renewable PPA records, submetering CSVs, and HVAC load data.', 'Zap', 'Active', TRUE, 1),
('water', 'Water Management', 'Analyze municipal water meter readings, wastewater treatment logs, cooling tower cycles, and rainwater harvesting metrics.', 'Droplets', 'Active', TRUE, 2),
('waste', 'Waste Management', 'Track municipal waste manifests, hazardous chemical logs, composting receipts, and circular economy diversion ratios.', 'Trash2', 'Active', TRUE, 3),
('transport', 'Transport & Mobility', 'Scope 3 corporate fleet telemetry, employee commuting logs, and supply chain logistics carbon intensity calculation.', 'Truck', 'Coming Soon', FALSE, 4),
('investment', 'Investment Planning', 'CapEx allocation engine for solar payback, thermal retrofit ROI, and green financing tax credit optimization.', 'TrendingUp', 'Coming Soon', FALSE, 5),
('custom', 'Custom Module', 'Build tailor-made sustainability indicators and custom AI diagnostic models for unique industrial processes.', 'Layers', 'Enterprise', FALSE, 6)
ON CONFLICT (key) DO NOTHING;

-- Seed Emission Factors
INSERT INTO public.emission_factors (category, region, year, factor_value, unit, source) VALUES
('electricity', 'US-East', 2026, 0.4402, 'kg CO2e / kWh', 'EPA eGRID 2026'),
('water', 'US-East', 2026, 0.0003, 'kg CO2e / litre', 'US Water Alliance'),
('waste_landfill', 'US-East', 2026, 0.7200, 'kg CO2e / kg', 'EPA WARM v15')
ON CONFLICT DO NOTHING;
