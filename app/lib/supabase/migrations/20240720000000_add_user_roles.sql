-- Create the user_role enum type
CREATE TYPE user_role AS ENUM ('child', 'grower', 'admin');

-- Add role column to users table with default 'grower'
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS role user_role NOT NULL DEFAULT 'grower';

-- Create a function to get current user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
DECLARE
  current_role user_role;
BEGIN
  SELECT role INTO current_role FROM auth.users WHERE id = auth.uid();
  RETURN current_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update plants RLS policies
DROP POLICY IF EXISTS "Users can view their own plants" ON plants;
DROP POLICY IF EXISTS "Users can insert their own plants" ON plants;
DROP POLICY IF EXISTS "Users can update their own plants" ON plants;
DROP POLICY IF EXISTS "Users can delete their own plants" ON plants;

CREATE POLICY "Admin users can view all plants" 
ON plants FOR SELECT 
USING (get_user_role() = 'admin');

CREATE POLICY "Non-admin users can view their own plants" 
ON plants FOR SELECT 
USING (auth.uid() = user_id AND get_user_role() IN ('grower', 'child'));

CREATE POLICY "Admin and grower users can insert plants" 
ON plants FOR INSERT 
WITH CHECK (auth.uid() = user_id AND get_user_role() IN ('admin', 'grower'));

CREATE POLICY "Admin and grower users can update their own plants" 
ON plants FOR UPDATE 
USING (auth.uid() = user_id AND get_user_role() IN ('admin', 'grower'))
WITH CHECK (auth.uid() = user_id AND get_user_role() IN ('admin', 'grower'));

CREATE POLICY "Admin and grower users can delete their own plants" 
ON plants FOR DELETE 
USING (auth.uid() = user_id AND get_user_role() IN ('admin', 'grower'));

-- Update hydroponic_systems RLS policies
DROP POLICY IF EXISTS "Users can view their own hydroponic systems" ON hydroponic_systems;
DROP POLICY IF EXISTS "Users can insert their own hydroponic systems" ON hydroponic_systems;
DROP POLICY IF EXISTS "Users can update their own hydroponic systems" ON hydroponic_systems;
DROP POLICY IF EXISTS "Users can delete their own hydroponic systems" ON hydroponic_systems;

CREATE POLICY "Admin users can view all hydroponic systems" 
ON hydroponic_systems FOR SELECT 
USING (get_user_role() = 'admin');

CREATE POLICY "Non-admin users can view their own hydroponic systems" 
ON hydroponic_systems FOR SELECT 
USING (auth.uid() = user_id AND get_user_role() IN ('grower', 'child'));

CREATE POLICY "Admin and grower users can insert hydroponic systems" 
ON hydroponic_systems FOR INSERT 
WITH CHECK (auth.uid() = user_id AND get_user_role() IN ('admin', 'grower'));

CREATE POLICY "Admin and grower users can update their own hydroponic systems" 
ON hydroponic_systems FOR UPDATE 
USING (auth.uid() = user_id AND get_user_role() IN ('admin', 'grower'))
WITH CHECK (auth.uid() = user_id AND get_user_role() IN ('admin', 'grower'));

CREATE POLICY "Admin and grower users can delete their own hydroponic systems" 
ON hydroponic_systems FOR DELETE 
USING (auth.uid() = user_id AND get_user_role() IN ('admin', 'grower'));

-- Update system_measurements RLS policies
DROP POLICY IF EXISTS "Users can view their own system measurements" ON system_measurements;
DROP POLICY IF EXISTS "Users can insert their own system measurements" ON system_measurements;
DROP POLICY IF EXISTS "Users can update their own system measurements" ON system_measurements;
DROP POLICY IF EXISTS "Users can delete their own system measurements" ON system_measurements;

CREATE POLICY "Admin users can view all system measurements" 
ON system_measurements FOR SELECT 
USING (get_user_role() = 'admin');

CREATE POLICY "Non-admin users can view system measurements for their systems" 
ON system_measurements FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM hydroponic_systems hs 
    WHERE hs.id = system_measurements.system_id 
    AND hs.user_id = auth.uid() 
    AND get_user_role() IN ('grower', 'child')
  )
);

CREATE POLICY "Admin and grower users can insert system measurements" 
ON system_measurements FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM hydroponic_systems hs 
    WHERE hs.id = system_measurements.system_id 
    AND hs.user_id = auth.uid() 
    AND get_user_role() IN ('admin', 'grower')
  )
);

CREATE POLICY "Admin and grower users can update system measurements" 
ON system_measurements FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM hydroponic_systems hs 
    WHERE hs.id = system_measurements.system_id 
    AND hs.user_id = auth.uid() 
    AND get_user_role() IN ('admin', 'grower')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM hydroponic_systems hs 
    WHERE hs.id = system_measurements.system_id 
    AND hs.user_id = auth.uid() 
    AND get_user_role() IN ('admin', 'grower')
  )
);

CREATE POLICY "Admin and grower users can delete system measurements" 
ON system_measurements FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM hydroponic_systems hs 
    WHERE hs.id = system_measurements.system_id 
    AND hs.user_id = auth.uid() 
    AND get_user_role() IN ('admin', 'grower')
  )
);

-- Update reminders RLS policies
DROP POLICY IF EXISTS "Users can view their own reminders" ON reminders;
DROP POLICY IF EXISTS "Users can insert their own reminders" ON reminders;
DROP POLICY IF EXISTS "Users can update their own reminders" ON reminders;
DROP POLICY IF EXISTS "Users can delete their own reminders" ON reminders;

CREATE POLICY "Admin users can view all reminders" 
ON reminders FOR SELECT 
USING (get_user_role() = 'admin');

CREATE POLICY "Non-admin users can view their own reminders" 
ON reminders FOR SELECT 
USING (auth.uid() = user_id AND get_user_role() IN ('grower', 'child'));

CREATE POLICY "Admin and grower users can insert reminders" 
ON reminders FOR INSERT 
WITH CHECK (auth.uid() = user_id AND get_user_role() IN ('admin', 'grower'));

CREATE POLICY "Admin and grower users can update their own reminders" 
ON reminders FOR UPDATE 
USING (auth.uid() = user_id AND get_user_role() IN ('admin', 'grower'))
WITH CHECK (auth.uid() = user_id AND get_user_role() IN ('admin', 'grower'));

CREATE POLICY "Admin and grower users can delete their own reminders" 
ON reminders FOR DELETE 
USING (auth.uid() = user_id AND get_user_role() IN ('admin', 'grower'));

-- Update sensor_rules RLS policies
DROP POLICY IF EXISTS "Users can view their own sensor rules" ON sensor_rules;
DROP POLICY IF EXISTS "Users can insert their own sensor rules" ON sensor_rules;
DROP POLICY IF EXISTS "Users can update their own sensor rules" ON sensor_rules;
DROP POLICY IF EXISTS "Users can delete their own sensor rules" ON sensor_rules;

CREATE POLICY "Admin users can view all sensor rules" 
ON sensor_rules FOR SELECT 
USING (get_user_role() = 'admin');

CREATE POLICY "Non-admin users can view their own sensor rules" 
ON sensor_rules FOR SELECT 
USING (auth.uid() = user_id AND get_user_role() IN ('grower', 'child'));

CREATE POLICY "Admin and grower users can insert sensor rules" 
ON sensor_rules FOR INSERT 
WITH CHECK (auth.uid() = user_id AND get_user_role() IN ('admin', 'grower'));

CREATE POLICY "Admin and grower users can update their own sensor rules" 
ON sensor_rules FOR UPDATE 
USING (auth.uid() = user_id AND get_user_role() IN ('admin', 'grower'))
WITH CHECK (auth.uid() = user_id AND get_user_role() IN ('admin', 'grower'));

CREATE POLICY "Admin and grower users can delete their own sensor rules" 
ON sensor_rules FOR DELETE 
USING (auth.uid() = user_id AND get_user_role() IN ('admin', 'grower')); 