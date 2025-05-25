-- Seed Types
CREATE TABLE IF NOT EXISTS seed_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  scientific_name text,
  family text,
  category text CHECK (category IN ('vegetable', 'herb', 'flower', 'fruit', 'other')),
  germination_days_min integer,
  germination_days_max integer,
  harvest_days_min integer,
  harvest_days_max integer,
  optimal_temperature_min numeric(4,1),
  optimal_temperature_max numeric(4,1),
  optimal_ph_min numeric(4,2),
  optimal_ph_max numeric(4,2),
  light_requirements text CHECK (light_requirements IN ('full_sun', 'partial_sun', 'shade')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users,
  is_verified boolean DEFAULT false
);

-- Seed Instances (User's Seeds)
CREATE TABLE IF NOT EXISTS seed_instances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  seed_type_id uuid REFERENCES seed_types NOT NULL,
  batch_code text,
  purchase_date date,
  expiry_date date,
  storage_location text,
  quantity integer,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Growth Stages
CREATE TABLE IF NOT EXISTS growth_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seed_type_id uuid REFERENCES seed_types NOT NULL,
  name text NOT NULL,
  description text,
  duration_days_min integer,
  duration_days_max integer,
  order_index integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Growth Stage Guides
CREATE TABLE IF NOT EXISTS growth_guides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  growth_stage_id uuid REFERENCES growth_stages NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  image_url text,
  video_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Growth Stage Nutrients
CREATE TABLE IF NOT EXISTS stage_nutrients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  growth_stage_id uuid REFERENCES growth_stages NOT NULL,
  nitrogen_level numeric(5,2),
  phosphorus_level numeric(5,2),
  potassium_level numeric(5,2),
  calcium_level numeric(5,2),
  magnesium_level numeric(5,2),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Plant Growth Logs
CREATE TABLE IF NOT EXISTS growth_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seed_instance_id uuid REFERENCES seed_instances NOT NULL,
  growth_stage_id uuid REFERENCES growth_stages NOT NULL,
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  height numeric(5,2),
  leaf_count integer,
  node_count integer,
  health_status text CHECK (health_status IN ('excellent', 'good', 'fair', 'poor', 'critical')),
  notes text,
  photo_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Growth Alerts
CREATE TABLE IF NOT EXISTS growth_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  growth_log_id uuid REFERENCES growth_logs NOT NULL,
  alert_type text CHECK (alert_type IN ('pest_risk', 'deficiency', 'disease', 'environmental', 'other')),
  severity text CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message text NOT NULL,
  is_resolved boolean DEFAULT false,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE seed_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE seed_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE stage_nutrients ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Anyone can view seed types"
  ON seed_types FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify seed types"
  ON seed_types FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can view their own seed instances"
  ON seed_instances FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own seed instances"
  ON seed_instances FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view growth stages"
  ON growth_stages FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify growth stages"
  ON growth_stages FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Anyone can view growth guides"
  ON growth_guides FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify growth guides"
  ON growth_guides FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Anyone can view stage nutrients"
  ON stage_nutrients FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify stage nutrients"
  ON stage_nutrients FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can view their own growth logs"
  ON growth_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM seed_instances
    WHERE seed_instances.id = growth_logs.seed_instance_id
    AND seed_instances.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage their own growth logs"
  ON growth_logs FOR ALL
  USING (EXISTS (
    SELECT 1 FROM seed_instances
    WHERE seed_instances.id = growth_logs.seed_instance_id
    AND seed_instances.user_id = auth.uid()
  ));

CREATE POLICY "Users can view their own growth alerts"
  ON growth_alerts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM growth_logs
    JOIN seed_instances ON seed_instances.id = growth_logs.seed_instance_id
    WHERE growth_logs.id = growth_alerts.growth_log_id
    AND seed_instances.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage their own growth alerts"
  ON growth_alerts FOR ALL
  USING (EXISTS (
    SELECT 1 FROM growth_logs
    JOIN seed_instances ON seed_instances.id = growth_logs.seed_instance_id
    WHERE growth_logs.id = growth_alerts.growth_log_id
    AND seed_instances.user_id = auth.uid()
  ));

-- Create indexes for better query performance
CREATE INDEX idx_seed_instances_user_id ON seed_instances(user_id);
CREATE INDEX idx_seed_instances_seed_type_id ON seed_instances(seed_type_id);
CREATE INDEX idx_growth_stages_seed_type_id ON growth_stages(seed_type_id);
CREATE INDEX idx_growth_guides_growth_stage_id ON growth_guides(growth_stage_id);
CREATE INDEX idx_stage_nutrients_growth_stage_id ON stage_nutrients(growth_stage_id);
CREATE INDEX idx_growth_logs_seed_instance_id ON growth_logs(seed_instance_id);
CREATE INDEX idx_growth_logs_growth_stage_id ON growth_logs(growth_stage_id);
CREATE INDEX idx_growth_alerts_growth_log_id ON growth_alerts(growth_log_id); 