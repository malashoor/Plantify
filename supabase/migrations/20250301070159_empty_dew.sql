/*
  # Create care tasks table

  1. New Tables
    - `care_tasks`
      - `id` (uuid, primary key)
      - `plant_id` (uuid, foreign key to plants)
      - `user_id` (uuid, foreign key to auth.users)
      - `type` (text)
      - `description` (text)
      - `due_date` (date)
      - `completed` (boolean)
      - `created_at` (timestamptz)
  2. Security
    - Enable RLS on `care_tasks` table
    - Add policy for authenticated users to read/write their own data
*/

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

ALTER TABLE care_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own care tasks"
  ON care_tasks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own care tasks"
  ON care_tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own care tasks"
  ON care_tasks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own care tasks"
  ON care_tasks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);