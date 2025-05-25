/*
  # Create plants table

  1. New Tables
    - `plants`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text)
      - `scientific_name` (text)
      - `location` (text)
      - `category` (text)
      - `image_url` (text)
      - `watering_frequency` (integer)
      - `last_watered` (timestamptz)
      - `notes` (text)
      - `created_at` (timestamptz)
  2. Security
    - Enable RLS on `plants` table
    - Add policy for authenticated users to read/write their own data
*/

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

ALTER TABLE plants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own plants"
  ON plants
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plants"
  ON plants
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plants"
  ON plants
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plants"
  ON plants
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);