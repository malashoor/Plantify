/*
  # Create plant_identifications table

  1. New Tables
    - `plant_identifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `image_url` (text)
      - `scientific_name` (text)
      - `common_name` (text)
      - `family` (text)
      - `probability` (float)
      - `identified_at` (timestamptz)
  2. Security
    - Enable RLS on `plant_identifications` table
    - Add policies for authenticated users to manage their own identifications
*/

-- Create the table if it doesn't exist
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