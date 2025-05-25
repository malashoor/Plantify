-- Drop existing types if they exist
DROP TYPE IF EXISTS growth_stage CASCADE;
DROP TYPE IF EXISTS plant_category CASCADE;
DROP TYPE IF EXISTS light_requirement CASCADE;
DROP TYPE IF EXISTS health_status CASCADE;

-- Create unified enums
CREATE TYPE growth_stage AS ENUM (
    'seed',
    'germination',
    'seedling',
    'vegetative',
    'flowering',
    'fruiting',
    'harvest'
);

CREATE TYPE plant_category AS ENUM (
    'vegetable',
    'herb',
    'flower',
    'fruit',
    'other'
);

CREATE TYPE light_requirement AS ENUM (
    'full_sun',
    'partial_sun',
    'shade'
);

CREATE TYPE health_status AS ENUM (
    'excellent',
    'good',
    'fair',
    'poor',
    'critical'
);

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name text NOT NULL,
    record_id uuid NOT NULL,
    action text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data jsonb,
    new_data jsonb,
    user_id uuid REFERENCES auth.users,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Create audit log function
CREATE OR REPLACE FUNCTION log_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO audit_logs (
        table_name,
        record_id,
        action,
        old_data,
        new_data,
        user_id
    ) VALUES (
        TG_TABLE_NAME,
        CASE
            WHEN TG_OP = 'DELETE' THEN OLD.id
            ELSE NEW.id
        END,
        TG_OP,
        CASE
            WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD)
            ELSE NULL
        END,
        CASE
            WHEN TG_OP = 'DELETE' THEN NULL
            ELSE row_to_json(NEW)
        END,
        auth.uid()
    );
    RETURN NULL;
END;
$$;

-- Update seed_types table
ALTER TABLE seed_types
    ALTER COLUMN category TYPE plant_category USING category::plant_category,
    ALTER COLUMN light_requirements TYPE light_requirement USING light_requirements::light_requirement;

-- Update growth_logs table
ALTER TABLE growth_logs
    ALTER COLUMN health_status TYPE health_status USING health_status::health_status;

-- Add audit triggers
CREATE TRIGGER audit_seed_types
    AFTER INSERT OR UPDATE OR DELETE ON seed_types
    FOR EACH ROW EXECUTE FUNCTION log_audit();

CREATE TRIGGER audit_seed_instances
    AFTER INSERT OR UPDATE OR DELETE ON seed_instances
    FOR EACH ROW EXECUTE FUNCTION log_audit();

CREATE TRIGGER audit_growth_logs
    AFTER INSERT OR UPDATE OR DELETE ON growth_logs
    FOR EACH ROW EXECUTE FUNCTION log_audit();

CREATE TRIGGER audit_growth_alerts
    AFTER INSERT OR UPDATE OR DELETE ON growth_alerts
    FOR EACH ROW EXECUTE FUNCTION log_audit();

-- Update RLS policies
ALTER TABLE seed_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE seed_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view seed types" ON seed_types;
DROP POLICY IF EXISTS "Only admins can modify seed types" ON seed_types;
DROP POLICY IF EXISTS "Users can view their own seed instances" ON seed_instances;
DROP POLICY IF EXISTS "Users can manage their own seed instances" ON seed_instances;
DROP POLICY IF EXISTS "Users can view their own growth logs" ON growth_logs;
DROP POLICY IF EXISTS "Users can manage their own growth logs" ON growth_logs;
DROP POLICY IF EXISTS "Users can view their own growth alerts" ON growth_alerts;
DROP POLICY IF EXISTS "Users can manage their own growth alerts" ON growth_alerts;

-- Create new policies with improved security
CREATE POLICY "Authenticated users can view seed types"
    ON seed_types FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can modify seed types"
    ON seed_types FOR ALL
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can view their own seed instances"
    ON seed_instances FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own seed instances"
    ON seed_instances FOR ALL
    USING (auth.uid() = user_id);

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

CREATE POLICY "Only admins can view audit logs"
    ON audit_logs FOR SELECT
    USING (auth.jwt() ->> 'role' = 'admin'); 