-- Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS plants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  scientific_name text,
  location text,
  category text,
  image_url text,
  watering_frequency integer,
  last_watered timestamptz,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE plants ENABLE ROW LEVEL SECURITY;

-- Create policies only if they don't exist
DO $$
BEGIN
  -- Check if the SELECT policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'plants' 
    AND policyname = 'Users can read their own plants'
  ) THEN
    CREATE POLICY "Users can read their own plants"
      ON plants
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  -- Check if the INSERT policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'plants' 
    AND policyname = 'Users can insert their own plants'
  ) THEN
    CREATE POLICY "Users can insert their own plants"
      ON plants
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Check if the UPDATE policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'plants' 
    AND policyname = 'Users can update their own plants'
  ) THEN
    CREATE POLICY "Users can update their own plants"
      ON plants
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  -- Check if the DELETE policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'plants' 
    AND policyname = 'Users can delete their own plants'
  ) THEN
    CREATE POLICY "Users can delete their own plants"
      ON plants
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Create care_tasks table
CREATE TABLE IF NOT EXISTS care_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id uuid REFERENCES plants NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  type text NOT NULL,
  description text,
  due_date date NOT NULL,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE care_tasks ENABLE ROW LEVEL SECURITY;

-- Create policies only if they don't exist
DO $$
BEGIN
  -- Check if the SELECT policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'care_tasks' 
    AND policyname = 'Users can read their own care tasks'
  ) THEN
    CREATE POLICY "Users can read their own care tasks"
      ON care_tasks
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  -- Check if the INSERT policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'care_tasks' 
    AND policyname = 'Users can insert their own care tasks'
  ) THEN
    CREATE POLICY "Users can insert their own care tasks"
      ON care_tasks
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Check if the UPDATE policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'care_tasks' 
    AND policyname = 'Users can update their own care tasks'
  ) THEN
    CREATE POLICY "Users can update their own care tasks"
      ON care_tasks
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  -- Check if the DELETE policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'care_tasks' 
    AND policyname = 'Users can delete their own care tasks'
  ) THEN
    CREATE POLICY "Users can delete their own care tasks"
      ON care_tasks
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Create plant_identifications table
CREATE TABLE IF NOT EXISTS plant_identifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  image_url text,
  scientific_name text,
  common_name text,
  family text,
  probability float,
  identified_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE plant_identifications ENABLE ROW LEVEL SECURITY;

-- Create policies only if they don't exist
DO $$
BEGIN
  -- Check if the SELECT policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'plant_identifications' 
    AND policyname = 'Users can read their own plant identifications'
  ) THEN
    CREATE POLICY "Users can read their own plant identifications"
      ON plant_identifications
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  -- Check if the INSERT policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'plant_identifications' 
    AND policyname = 'Users can insert their own plant identifications'
  ) THEN
    CREATE POLICY "Users can insert their own plant identifications"
      ON plant_identifications
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Check if the UPDATE policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'plant_identifications' 
    AND policyname = 'Users can update their own plant identifications'
  ) THEN
    CREATE POLICY "Users can update their own plant identifications"
      ON plant_identifications
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  -- Check if the DELETE policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'plant_identifications' 
    AND policyname = 'Users can delete their own plant identifications'
  ) THEN
    CREATE POLICY "Users can delete their own plant identifications"
      ON plant_identifications
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END
$$;