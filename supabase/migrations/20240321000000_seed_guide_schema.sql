-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for growth stages
CREATE TYPE growth_stage AS ENUM (
    'seed',
    'germination',
    'seedling',
    'vegetative',
    'flowering',
    'fruiting',
    'harvest'
);

-- Create seeds table
CREATE TABLE seeds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    species TEXT NOT NULL,
    variety TEXT,
    planted_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    current_stage growth_stage DEFAULT 'seed',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    image_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create growth_stages table
CREATE TABLE growth_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seed_id UUID REFERENCES seeds(id) ON DELETE CASCADE,
    stage growth_stage NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create seed_guides table
CREATE TABLE seed_guides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    species TEXT NOT NULL,
    variety TEXT,
    stages JSONB NOT NULL, -- Stores stage-specific instructions
    care_instructions JSONB NOT NULL, -- Stores care requirements
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create plant_logs table
CREATE TABLE plant_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seed_id UUID REFERENCES seeds(id) ON DELETE CASCADE,
    log_type TEXT NOT NULL, -- 'watering', 'fertilizing', 'pruning', etc.
    notes TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_seeds_user_id ON seeds(user_id);
CREATE INDEX idx_growth_stages_seed_id ON growth_stages(seed_id);
CREATE INDEX idx_plant_logs_seed_id ON plant_logs(seed_id);

-- Create RLS policies
ALTER TABLE seeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE seed_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE plant_logs ENABLE ROW LEVEL SECURITY;

-- Seeds policies
CREATE POLICY "Users can view their own seeds"
    ON seeds FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own seeds"
    ON seeds FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own seeds"
    ON seeds FOR UPDATE
    USING (auth.uid() = user_id);

-- Growth stages policies
CREATE POLICY "Users can view their seed growth stages"
    ON growth_stages FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM seeds
        WHERE seeds.id = growth_stages.seed_id
        AND seeds.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert growth stages for their seeds"
    ON growth_stages FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM seeds
        WHERE seeds.id = growth_stages.seed_id
        AND seeds.user_id = auth.uid()
    ));

-- Plant logs policies
CREATE POLICY "Users can view their seed logs"
    ON plant_logs FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM seeds
        WHERE seeds.id = plant_logs.seed_id
        AND seeds.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert logs for their seeds"
    ON plant_logs FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM seeds
        WHERE seeds.id = plant_logs.seed_id
        AND seeds.user_id = auth.uid()
    ));

-- Seed guides are public but only admins can modify
CREATE POLICY "Anyone can view seed guides"
    ON seed_guides FOR SELECT
    USING (true);

CREATE POLICY "Only admins can modify seed guides"
    ON seed_guides FOR ALL
    USING (auth.jwt() ->> 'role' = 'admin'); 