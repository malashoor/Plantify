-- Hydroponic Systems
CREATE TABLE IF NOT EXISTS hydroponic_systems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('NFT', 'DWC', 'Wick', 'Ebb and Flow', 'Aeroponics')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  notes text,
  is_active boolean DEFAULT true
);

-- System Measurements
CREATE TABLE IF NOT EXISTS system_measurements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  system_id uuid REFERENCES hydroponic_systems NOT NULL,
  nitrogen_level numeric(5,2),
  phosphorus_level numeric(5,2),
  potassium_level numeric(5,2),
  ph_level numeric(4,2),
  ec_level numeric(5,2),
  water_temperature numeric(4,1),
  measured_at timestamptz NOT NULL DEFAULT now(),
  notes text
);

-- Lighting Schedules
CREATE TABLE IF NOT EXISTS lighting_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  system_id uuid REFERENCES hydroponic_systems NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  intensity_percentage integer CHECK (intensity_percentage BETWEEN 0 AND 100),
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Planting Journal
CREATE TABLE IF NOT EXISTS plant_journals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  plant_id uuid REFERENCES plants NOT NULL,
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  notes text NOT NULL,
  photo_url text,
  emotion_tag text CHECK (emotion_tag IN ('excited', 'worried', 'confused', 'happy', 'satisfied', 'disappointed', 'neutral')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE hydroponic_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE lighting_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE plant_journals ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can view their own hydroponic systems"
  ON hydroponic_systems FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own hydroponic systems"
  ON hydroponic_systems FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own hydroponic systems"
  ON hydroponic_systems FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own hydroponic systems"
  ON hydroponic_systems FOR DELETE
  USING (auth.uid() = user_id);

-- System Measurements Policies
CREATE POLICY "Users can view their system measurements"
  ON system_measurements FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM hydroponic_systems
    WHERE hydroponic_systems.id = system_measurements.system_id
    AND hydroponic_systems.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their system measurements"
  ON system_measurements FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM hydroponic_systems
    WHERE hydroponic_systems.id = system_measurements.system_id
    AND hydroponic_systems.user_id = auth.uid()
  ));

-- Lighting Schedules Policies
CREATE POLICY "Users can manage their lighting schedules"
  ON lighting_schedules FOR ALL
  USING (EXISTS (
    SELECT 1 FROM hydroponic_systems
    WHERE hydroponic_systems.id = lighting_schedules.system_id
    AND hydroponic_systems.user_id = auth.uid()
  ));

-- Plant Journal Policies
CREATE POLICY "Users can view their plant journals"
  ON plant_journals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their plant journals"
  ON plant_journals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their plant journals"
  ON plant_journals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their plant journals"
  ON plant_journals FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX idx_hydroponic_systems_user_id ON hydroponic_systems(user_id);
CREATE INDEX idx_system_measurements_system_id ON system_measurements(system_id);
CREATE INDEX idx_lighting_schedules_system_id ON lighting_schedules(system_id);
CREATE INDEX idx_plant_journals_user_id ON plant_journals(user_id);
CREATE INDEX idx_plant_journals_plant_id ON plant_journals(plant_id);
CREATE INDEX idx_plant_journals_entry_date ON plant_journals(entry_date); 