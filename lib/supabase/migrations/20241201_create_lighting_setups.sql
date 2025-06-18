-- Create table for lighting setups
CREATE TABLE lighting_setups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  crop_id TEXT NOT NULL,
  stage_id TEXT NOT NULL,
  led_configs JSONB NOT NULL,
  photoperiod JSONB NOT NULL,
  total_power_consumption DECIMAL(8,2) NOT NULL,
  total_coverage DECIMAL(8,2) NOT NULL,
  average_ppfd DECIMAL(8,2) NOT NULL,
  average_dli DECIMAL(8,2) NOT NULL,
  estimated_monthly_cost DECIMAL(8,2),
  is_active BOOLEAN DEFAULT FALSE,
  notes TEXT,
  notes_ar TEXT,
  is_offline BOOLEAN DEFAULT FALSE,
  sync_status TEXT DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending', 'failed')),
  last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for lighting profiles (official templates)
CREATE TABLE lighting_profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT,
  crop_id TEXT NOT NULL,
  stage_id TEXT NOT NULL,
  spectrum JSONB NOT NULL,
  photoperiod JSONB NOT NULL,
  dli_min DECIMAL(4,1) NOT NULL,
  dli_optimal DECIMAL(4,1) NOT NULL,
  dli_max DECIMAL(4,1) NOT NULL,
  ppfd_min INTEGER NOT NULL,
  ppfd_optimal INTEGER NOT NULL,
  ppfd_max INTEGER NOT NULL,
  recommendations JSONB,
  is_official BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for LED specifications
CREATE TABLE led_specifications (
  id TEXT PRIMARY KEY,
  brand TEXT NOT NULL,
  brand_ar TEXT,
  model TEXT NOT NULL,
  model_ar TEXT,
  wattage INTEGER NOT NULL,
  ppfd_at_12_inches INTEGER NOT NULL,
  efficiency DECIMAL(3,1) NOT NULL,
  spectrum JSONB NOT NULL,
  coverage JSONB NOT NULL,
  price DECIMAL(8,2),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for lighting timers
CREATE TABLE lighting_timers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setup_id UUID REFERENCES lighting_setups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  photoperiod JSONB NOT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  next_state_change TIMESTAMP WITH TIME ZONE NOT NULL,
  current_state TEXT DEFAULT 'off' CHECK (current_state IN ('on', 'off', 'transitioning')),
  notifications JSONB DEFAULT '{"enabled": true, "beforeMinutes": 5}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for ambient light readings (for sensor integration)
CREATE TABLE ambient_light_readings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  lux INTEGER NOT NULL,
  location TEXT,
  sensor_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for power cost settings
CREATE TABLE power_cost_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  kwh_rate DECIMAL(6,4) NOT NULL DEFAULT 0.12,
  currency TEXT DEFAULT 'USD',
  peak_hours JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE lighting_setups ENABLE ROW LEVEL SECURITY;
ALTER TABLE lighting_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE led_specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE lighting_timers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambient_light_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE power_cost_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for lighting_setups
CREATE POLICY "Users can view their own lighting setups" ON lighting_setups
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lighting setups" ON lighting_setups
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lighting setups" ON lighting_setups
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lighting setups" ON lighting_setups
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for lighting_profiles (read-only for users, full access for admins)
CREATE POLICY "Anyone can view lighting profiles" ON lighting_profiles
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage lighting profiles" ON lighting_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Create policies for led_specifications (read-only for users, full access for admins)
CREATE POLICY "Anyone can view LED specifications" ON led_specifications
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage LED specifications" ON led_specifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Create policies for lighting_timers
CREATE POLICY "Users can manage their own lighting timers" ON lighting_timers
  FOR ALL USING (auth.uid() = user_id);

-- Create policies for ambient_light_readings
CREATE POLICY "Users can manage their own ambient light readings" ON ambient_light_readings
  FOR ALL USING (auth.uid() = user_id);

-- Create policies for power_cost_settings
CREATE POLICY "Users can manage their own power cost settings" ON power_cost_settings
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_lighting_setups_user_id ON lighting_setups(user_id);
CREATE INDEX idx_lighting_setups_crop_stage ON lighting_setups(crop_id, stage_id);
CREATE INDEX idx_lighting_setups_last_used ON lighting_setups(last_used);
CREATE INDEX idx_lighting_setups_sync_status ON lighting_setups(sync_status);

CREATE INDEX idx_lighting_profiles_crop_stage ON lighting_profiles(crop_id, stage_id);

CREATE INDEX idx_led_specifications_brand ON led_specifications(brand);
CREATE INDEX idx_led_specifications_wattage ON led_specifications(wattage);

CREATE INDEX idx_lighting_timers_setup_id ON lighting_timers(setup_id);
CREATE INDEX idx_lighting_timers_next_state_change ON lighting_timers(next_state_change);

CREATE INDEX idx_ambient_light_readings_user_timestamp ON ambient_light_readings(user_id, timestamp);

-- Create triggers for updating updated_at
CREATE TRIGGER update_lighting_setups_updated_at 
  BEFORE UPDATE ON lighting_setups 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lighting_profiles_updated_at 
  BEFORE UPDATE ON lighting_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lighting_timers_updated_at 
  BEFORE UPDATE ON lighting_timers 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_power_cost_settings_updated_at 
  BEFORE UPDATE ON power_cost_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default LED specifications
INSERT INTO led_specifications (
  id, brand, brand_ar, model, model_ar, wattage, ppfd_at_12_inches, efficiency, spectrum, coverage, price
) VALUES
(
  'spider_farmer_sf1000',
  'Spider Farmer',
  'سبايدر فارمر',
  'SF-1000',
  'SF-1000',
  100,
  516,
  2.7,
  '{"blue": 25, "red": 25, "white": 40, "farRed": 5, "uv": 2, "green": 3}',
  '{"footprint": "2x2 ft", "recommendedHeight": 12}',
  139.00
),
(
  'mars_hydro_ts1000',
  'Mars Hydro',
  'مارس هايدرو',
  'TS-1000',
  'TS-1000',
  150,
  525,
  2.35,
  '{"blue": 25, "red": 25, "white": 40, "farRed": 5, "uv": 2, "green": 3}',
  '{"footprint": "2x2 ft", "recommendedHeight": 12}',
  79.00
),
(
  'hlg_100v2',
  'Horticulture Lighting Group',
  'مجموعة إضاءة البستنة',
  'HLG 100 V2',
  'HLG 100 V2',
  95,
  400,
  2.8,
  '{"blue": 15, "red": 40, "white": 30, "farRed": 10, "uv": 3, "green": 2}',
  '{"footprint": "2x2 ft", "recommendedHeight": 18}',
  149.00
);

-- Insert default lighting profiles
INSERT INTO lighting_profiles (
  id, name, name_ar, crop_id, stage_id, spectrum, photoperiod, 
  dli_min, dli_optimal, dli_max, ppfd_min, ppfd_optimal, ppfd_max
) VALUES
(
  'lettuce_seedling_profile',
  'Lettuce Seedling Profile',
  'ملف شتلة الخس',
  'lettuce',
  'seedling',
  '{"blue": 30, "red": 20, "white": 45, "farRed": 5, "uv": 0, "green": 0}',
  '{"id": "seedling_16_8", "name": "16/8 Seedling", "lightHours": 16, "darkHours": 8, "sunriseTime": "07:00", "sunsetTime": "23:00"}',
  10.0, 14.0, 18.0, 100, 200, 300
),
(
  'tomato_vegetative_profile',
  'Tomato Vegetative Profile',
  'ملف طماطم خضري',
  'tomato',
  'vegetative',
  '{"blue": 25, "red": 25, "white": 40, "farRed": 5, "uv": 2, "green": 3}',
  '{"id": "vegetative_18_6", "name": "18/6 Vegetative", "lightHours": 18, "darkHours": 6, "sunriseTime": "06:00", "sunsetTime": "00:00"}',
  20.0, 25.0, 30.0, 300, 500, 700
),
(
  'basil_flowering_profile',
  'Basil Flowering Profile',
  'ملف ريحان مزهر',
  'basil',
  'flowering',
  '{"blue": 15, "red": 40, "white": 30, "farRed": 10, "uv": 3, "green": 2}',
  '{"id": "flowering_12_12", "name": "12/12 Flowering", "lightHours": 12, "darkHours": 12, "sunriseTime": "06:00", "sunsetTime": "18:00"}',
  14.0, 18.0, 22.0, 250, 400, 550
); 