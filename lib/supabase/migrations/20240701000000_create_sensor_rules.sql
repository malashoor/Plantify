-- Create sensor rules table
CREATE TABLE sensor_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plant_id UUID REFERENCES plants(id) ON DELETE CASCADE,
  parameter TEXT NOT NULL CHECK (parameter IN ('pH', 'EC', 'temperature', 'nitrogen', 'phosphorus', 'potassium', 'water_level')),
  condition TEXT NOT NULL CHECK (condition IN ('<', '>', '<=', '>=')),
  threshold NUMERIC NOT NULL,
  duration_minutes INTEGER NOT NULL,
  actions JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE sensor_rules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own sensor rules"
ON sensor_rules FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sensor rules"
ON sensor_rules FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sensor rules"
ON sensor_rules FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sensor rules"
ON sensor_rules FOR DELETE
USING (auth.uid() = user_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER set_timestamp_sensor_rules
BEFORE UPDATE ON sensor_rules
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Add index for faster lookup
CREATE INDEX idx_sensor_rules_user_id ON sensor_rules(user_id);
CREATE INDEX idx_sensor_rules_plant_id ON sensor_rules(plant_id); 