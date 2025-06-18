-- Add environment and location columns to seeds table
ALTER TABLE seeds
ADD COLUMN environment text NOT NULL DEFAULT 'indoor',
ADD COLUMN latitude double precision,
ADD COLUMN longitude double precision,
ADD COLUMN city text,
ADD COLUMN country text;

-- Add location columns to user_profiles table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'latitude'
    ) THEN
        ALTER TABLE user_profiles
        ADD COLUMN latitude double precision,
        ADD COLUMN longitude double precision,
        ADD COLUMN city text,
        ADD COLUMN country text,
        ADD COLUMN location_updated_at timestamptz;
    END IF;
END $$;

-- Add check constraint for environment
ALTER TABLE seeds
ADD CONSTRAINT valid_environment 
CHECK (environment IN ('indoor', 'outdoor'));

-- Add indexes for location-based queries
CREATE INDEX IF NOT EXISTS seeds_location_idx 
ON seeds USING gist (
    ll_to_earth(latitude, longitude)
);

CREATE INDEX IF NOT EXISTS user_profiles_location_idx 
ON user_profiles USING gist (
    ll_to_earth(latitude, longitude)
); 