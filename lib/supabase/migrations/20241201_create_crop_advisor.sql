-- Smart Crop AI Advisor Database Schema Migration
-- Date: 2024-12-01
-- Description: AI-driven plant monitoring and autonomous optimization system

-- Plant Profiles Table
CREATE TABLE IF NOT EXISTS plant_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    crop_type TEXT NOT NULL,
    variety TEXT,
    planted_date DATE NOT NULL,
    expected_harvest_date DATE,
    current_stage TEXT NOT NULL CHECK (current_stage IN ('seedling', 'vegetative', 'flowering', 'fruiting', 'harvesting')),
    
    -- Optimal ranges (learned from successful grows)
    optimal_ranges JSONB NOT NULL DEFAULT '{}',
    
    -- Growth characteristics
    characteristics JSONB NOT NULL DEFAULT '{}',
    
    -- AI and user preferences
    ai_personality JSONB NOT NULL DEFAULT '{}',
    user_preferences JSONB NOT NULL DEFAULT '{}',
    
    -- Current status
    health_status JSONB NOT NULL DEFAULT '{}',
    last_assessment_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()),
    next_assessment_at TIMESTAMP WITH TIME ZONE,
    
    -- Integration data
    linked_nutrient_recipes UUID[],
    linked_lighting_setups UUID[],
    linked_build_journal UUID,
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL
);

-- Sensor Snapshots Table
CREATE TABLE IF NOT EXISTS sensor_snapshots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    plant_id UUID REFERENCES plant_profiles(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL,
    
    -- Environmental sensors
    temperature DECIMAL(4,1), -- Celsius
    humidity DECIMAL(4,1), -- percentage
    co2 DECIMAL(6,1), -- ppm
    airflow DECIMAL(4,2), -- m/s
    
    -- Lighting metrics
    ppfd DECIMAL(6,1), -- μmol/m²/s
    dli DECIMAL(4,1), -- mol/m²/d
    photoperiod DECIMAL(4,1), -- hours
    light_spectrum JSONB,
    
    -- Water and nutrients
    ph DECIMAL(3,1),
    ec DECIMAL(4,2), -- mS/cm
    tds DECIMAL(6,1), -- ppm
    water_temp DECIMAL(4,1), -- Celsius
    oxygen_level DECIMAL(4,1), -- mg/L
    
    -- Plant metrics
    plant_height DECIMAL(5,1), -- cm
    leaf_count INTEGER,
    leaf_color TEXT,
    root_health TEXT,
    
    -- Growth stage
    growth_stage TEXT CHECK (growth_stage IN ('seedling', 'vegetative', 'flowering', 'fruiting', 'harvesting')),
    days_from_seed INTEGER,
    
    -- Data quality
    data_quality TEXT CHECK (data_quality IN ('excellent', 'good', 'fair', 'poor')),
    sensor_status JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL
);

-- Growth Trends Table
CREATE TABLE IF NOT EXISTS growth_trends (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plant_id UUID REFERENCES plant_profiles(id) ON DELETE CASCADE,
    parameter TEXT NOT NULL,
    direction TEXT NOT NULL CHECK (direction IN ('improving', 'stable', 'declining', 'fluctuating')),
    rate DECIMAL(8,4) NOT NULL, -- change per day
    confidence TEXT NOT NULL CHECK (confidence IN ('very_high', 'high', 'medium', 'low', 'very_low')),
    timeframe INTEGER NOT NULL, -- days analyzed
    significance TEXT NOT NULL CHECK (significance IN ('critical', 'important', 'moderate', 'minor')),
    start_value DECIMAL(10,4) NOT NULL,
    current_value DECIMAL(10,4) NOT NULL,
    predicted_value DECIMAL(10,4), -- 7-day forecast
    last_analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL
);

-- Stress Indicators Table
CREATE TABLE IF NOT EXISTS stress_indicators (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plant_id UUID REFERENCES plant_profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('mild', 'moderate', 'severe', 'critical')),
    confidence TEXT NOT NULL CHECK (confidence IN ('very_high', 'high', 'medium', 'low', 'very_low')),
    symptoms TEXT[] DEFAULT '{}',
    likely_causes TEXT[] DEFAULT '{}',
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    affected_parameters TEXT[] DEFAULT '{}',
    time_to_action TEXT CHECK (time_to_action IN ('immediate', 'within_hours', 'within_day', 'monitor')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL
);

-- AI Recommendations Table
CREATE TABLE IF NOT EXISTS ai_recommendations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plant_id UUID REFERENCES plant_profiles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    confidence TEXT NOT NULL CHECK (confidence IN ('very_high', 'high', 'medium', 'low', 'very_low')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    reasoning TEXT,
    
    -- Specific adjustments
    adjustments JSONB DEFAULT '[]',
    
    -- Integration with existing modules
    module_integration JSONB DEFAULT '[]',
    
    -- Expected outcomes
    expected_results TEXT[] DEFAULT '{}',
    timeframe TEXT,
    success_metrics TEXT[] DEFAULT '{}',
    
    -- AI personality
    tone TEXT,
    voice_script TEXT,
    voice_script_ar TEXT,
    
    -- User interaction
    user_approval_required BOOLEAN DEFAULT false,
    automation_possible BOOLEAN DEFAULT false,
    alternative_options TEXT[] DEFAULT '{}',
    
    -- Tracking
    applied_at TIMESTAMP WITH TIME ZONE,
    user_response TEXT CHECK (user_response IN ('accepted', 'modified', 'rejected', 'ignored')),
    effectiveness_score INTEGER CHECK (effectiveness_score >= 0 AND effectiveness_score <= 100),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL
);

-- Conversational Requests Table
CREATE TABLE IF NOT EXISTS conversational_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    plant_id UUID REFERENCES plant_profiles(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    question_type TEXT CHECK (question_type IN ('diagnosis', 'optimization', 'prediction', 'learning', 'general')),
    context JSONB DEFAULT '{}',
    language TEXT DEFAULT 'en' CHECK (language IN ('en', 'ar')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL
);

-- Conversational Responses Table
CREATE TABLE IF NOT EXISTS conversational_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    request_id UUID REFERENCES conversational_requests(id) ON DELETE CASCADE,
    answer TEXT NOT NULL,
    answer_ar TEXT,
    confidence TEXT NOT NULL CHECK (confidence IN ('very_high', 'high', 'medium', 'low', 'very_low')),
    tone TEXT NOT NULL,
    
    -- Supporting information
    reasoning TEXT,
    data_points TEXT[] DEFAULT '{}',
    
    -- Interactive elements
    follow_up_questions TEXT[] DEFAULT '{}',
    action_buttons JSONB DEFAULT '[]',
    visual_aids JSONB DEFAULT '[]',
    
    -- Voice response
    voice_script TEXT,
    voice_script_ar TEXT,
    voice_emotion TEXT,
    
    -- Learning integration
    related_lessons TEXT[] DEFAULT '{}',
    practice_activities TEXT[] DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL
);

-- User Feedback Table
CREATE TABLE IF NOT EXISTS user_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    recommendation_id UUID REFERENCES ai_recommendations(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    outcome TEXT CHECK (outcome IN ('successful', 'partially_successful', 'unsuccessful', 'too_early')),
    comments TEXT,
    follow_up TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL
);

-- Automation Tasks Table
CREATE TABLE IF NOT EXISTS automation_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    plant_id UUID REFERENCES plant_profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('apply_recommendation', 'schedule_action', 'send_notification', 'log_data')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'executing', 'completed', 'failed', 'cancelled')),
    scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()),
    executed_at TIMESTAMP WITH TIME ZONE,
    parameters JSONB DEFAULT '{}',
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL
);

-- AI Analysis Results Table
CREATE TABLE IF NOT EXISTS ai_analysis_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plant_id UUID REFERENCES plant_profiles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Analysis components
    plant_health JSONB NOT NULL,
    confidence TEXT NOT NULL CHECK (confidence IN ('very_high', 'high', 'medium', 'low', 'very_low')),
    data_quality TEXT NOT NULL CHECK (data_quality IN ('excellent', 'good', 'fair', 'insufficient')),
    
    -- Analysis metadata
    analysis_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL,
    next_analysis_date TIMESTAMP WITH TIME ZONE,
    analysis_duration_ms INTEGER,
    
    -- Related data counts
    trends_count INTEGER DEFAULT 0,
    stress_indicators_count INTEGER DEFAULT 0,
    recommendations_count INTEGER DEFAULT 0,
    predictions_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL
);

-- Harvest Records Table
CREATE TABLE IF NOT EXISTS harvest_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plant_id UUID REFERENCES plant_profiles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    harvest_date DATE NOT NULL,
    weight DECIMAL(8,2), -- grams
    quality TEXT CHECK (quality IN ('poor', 'fair', 'good', 'excellent')),
    notes TEXT,
    photos TEXT[], -- URLs or file paths
    total_grow_days INTEGER,
    final_metrics JSONB, -- final sensor snapshot
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_plant_profiles_user_id ON plant_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_plant_profiles_active ON plant_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_sensor_snapshots_plant_id ON sensor_snapshots(plant_id);
CREATE INDEX IF NOT EXISTS idx_sensor_snapshots_timestamp ON sensor_snapshots(timestamp);
CREATE INDEX IF NOT EXISTS idx_growth_trends_plant_id ON growth_trends(plant_id);
CREATE INDEX IF NOT EXISTS idx_stress_indicators_plant_id ON stress_indicators(plant_id);
CREATE INDEX IF NOT EXISTS idx_stress_indicators_active ON stress_indicators(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_plant_id ON ai_recommendations(plant_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_user_id ON ai_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversational_requests_user_id ON conversational_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_automation_tasks_user_id ON automation_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_automation_tasks_status ON automation_tasks(status);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_results_plant_id ON ai_analysis_results(plant_id);
CREATE INDEX IF NOT EXISTS idx_harvest_records_plant_id ON harvest_records(plant_id);

-- Row Level Security (RLS) Policies

-- Plant Profiles - User-specific access
ALTER TABLE plant_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own plants" ON plant_profiles FOR ALL USING (auth.uid() = user_id);

-- Sensor Snapshots - User-specific access
ALTER TABLE sensor_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own sensor data" ON sensor_snapshots FOR ALL USING (auth.uid() = user_id);

-- Growth Trends - User-specific access via plant_profiles
ALTER TABLE growth_trends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view trends for their plants" ON growth_trends FOR SELECT USING (
    EXISTS (SELECT 1 FROM plant_profiles WHERE id = plant_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert trends for their plants" ON growth_trends FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM plant_profiles WHERE id = plant_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update trends for their plants" ON growth_trends FOR UPDATE USING (
    EXISTS (SELECT 1 FROM plant_profiles WHERE id = plant_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete trends for their plants" ON growth_trends FOR DELETE USING (
    EXISTS (SELECT 1 FROM plant_profiles WHERE id = plant_id AND user_id = auth.uid())
);

-- Stress Indicators - User-specific access via plant_profiles
ALTER TABLE stress_indicators ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view stress indicators for their plants" ON stress_indicators FOR SELECT USING (
    EXISTS (SELECT 1 FROM plant_profiles WHERE id = plant_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert stress indicators for their plants" ON stress_indicators FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM plant_profiles WHERE id = plant_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update stress indicators for their plants" ON stress_indicators FOR UPDATE USING (
    EXISTS (SELECT 1 FROM plant_profiles WHERE id = plant_id AND user_id = auth.uid())
);

-- AI Recommendations - User-specific access
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own recommendations" ON ai_recommendations FOR ALL USING (auth.uid() = user_id);

-- Conversational Requests - User-specific access
ALTER TABLE conversational_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own requests" ON conversational_requests FOR ALL USING (auth.uid() = user_id);

-- Conversational Responses - User-specific access via requests
ALTER TABLE conversational_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view responses to their requests" ON conversational_responses FOR SELECT USING (
    EXISTS (SELECT 1 FROM conversational_requests WHERE id = request_id AND user_id = auth.uid())
);

-- User Feedback - User-specific access
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own feedback" ON user_feedback FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own feedback" ON user_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own feedback" ON user_feedback FOR UPDATE USING (auth.uid() = user_id);

-- Automation Tasks - User-specific access
ALTER TABLE automation_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own automation tasks" ON automation_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own automation tasks" ON automation_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own automation tasks" ON automation_tasks FOR UPDATE USING (auth.uid() = user_id);

-- AI Analysis Results - User-specific access
ALTER TABLE ai_analysis_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own analysis results" ON ai_analysis_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own analysis results" ON ai_analysis_results FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Harvest Records - User-specific access
ALTER TABLE harvest_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own harvest records" ON harvest_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own harvest records" ON harvest_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own harvest records" ON harvest_records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own harvest records" ON harvest_records FOR DELETE USING (auth.uid() = user_id);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::TEXT, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_plant_profiles_updated_at BEFORE UPDATE ON plant_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_recommendations_updated_at BEFORE UPDATE ON ai_recommendations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_automation_tasks_updated_at BEFORE UPDATE ON automation_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for development
INSERT INTO plant_profiles (id, user_id, name, crop_type, variety, planted_date, expected_harvest_date, current_stage, optimal_ranges, characteristics, ai_personality, user_preferences, health_status) VALUES
('sample_lettuce', auth.uid(), 'Buttercrunch Lettuce', 'lettuce', 'buttercrunch', CURRENT_DATE - INTERVAL '14 days', CURRENT_DATE + INTERVAL '30 days', 'vegetative',
 '{"temperature": {"min": 18, "max": 24, "optimal": 21}, "humidity": {"min": 60, "max": 70, "optimal": 65}, "ph": {"min": 5.5, "max": 6.5, "optimal": 6.0}, "ec": {"min": 1.2, "max": 1.8, "optimal": 1.5}, "ppfd": {"min": 200, "max": 400, "optimal": 300}, "dli": {"min": 12, "max": 18, "optimal": 15}, "photoperiod": {"min": 12, "max": 16, "optimal": 14}, "co2": {"min": 400, "max": 800, "optimal": 600}}',
 '{"lightSensitivity": "medium", "nutrientHunger": "moderate_feeder", "temperatureTolerance": "cold_sensitive", "phTolerance": "moderate", "growthRate": "fast", "yieldPotential": "medium", "diseaseSusceptibility": []}',
 '{"communicationStyle": "encouraging", "proactiveness": "balanced", "riskTolerance": "moderate", "learningAggressiveness": "moderate", "voicePersonality": "caring"}',
 '{"automationLevel": "assisted", "notificationFrequency": "important", "riskAppetite": "moderate", "learningOriented": true, "voiceEnabled": true, "hapticFeedback": true, "preferredUnits": "metric", "language": "en"}',
 '{"overall": "good", "components": {"growth": 85, "nutrition": 90, "environment": 80, "lighting": 85, "water": 88, "roots": 82}, "activeStressors": [], "riskFactors": [], "strengths": ["good_nutrition", "optimal_lighting"], "improvementAreas": ["temperature_stability"]}')
ON CONFLICT DO NOTHING; 