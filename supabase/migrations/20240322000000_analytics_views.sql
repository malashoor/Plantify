-- Analytics Views and Functions

-- Weekly Journal Entries
CREATE OR REPLACE VIEW weekly_journal_entries AS
SELECT 
    date_trunc('week', created_at) as week,
    COUNT(*) as entry_count
FROM plant_journals
GROUP BY week
ORDER BY week DESC;

-- Most Common Seed Types
CREATE OR REPLACE VIEW common_seed_types AS
SELECT 
    st.name,
    st.scientific_name,
    COUNT(si.id) as instance_count
FROM seed_types st
JOIN seed_instances si ON st.id = si.seed_type_id
GROUP BY st.id, st.name, st.scientific_name
ORDER BY instance_count DESC;

-- Most Triggered Reminders
CREATE OR REPLACE VIEW triggered_reminders AS
SELECT 
    r.reminder_type,
    COUNT(*) as trigger_count
FROM reminders r
WHERE r.triggered_at IS NOT NULL
GROUP BY r.reminder_type
ORDER BY trigger_count DESC;

-- Daily Health Scans
CREATE OR REPLACE VIEW daily_health_scans AS
SELECT 
    date_trunc('day', created_at) as scan_date,
    COUNT(*) as scan_count
FROM health_scans
GROUP BY scan_date
ORDER BY scan_date DESC;

-- User Accessibility Features
CREATE OR REPLACE VIEW user_accessibility_stats AS
SELECT 
    COUNT(*) FILTER (WHERE uses_voice_commands = true) as voice_users,
    COUNT(*) FILTER (WHERE uses_dark_mode = true) as dark_mode_users,
    COUNT(*) as total_users
FROM user_preferences;

-- Function to get analytics data with date range
CREATE OR REPLACE FUNCTION get_analytics_data(
    start_date timestamp,
    end_date timestamp
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
BEGIN
    SELECT json_build_object(
        'weekly_journals', (
            SELECT json_agg(row_to_json(w))
            FROM weekly_journal_entries w
            WHERE week BETWEEN start_date AND end_date
        ),
        'common_seeds', (
            SELECT json_agg(row_to_json(c))
            FROM common_seed_types c
            LIMIT 10
        ),
        'reminders', (
            SELECT json_agg(row_to_json(r))
            FROM triggered_reminders r
        ),
        'health_scans', (
            SELECT json_agg(row_to_json(h))
            FROM daily_health_scans h
            WHERE scan_date BETWEEN start_date AND end_date
        ),
        'accessibility', (
            SELECT json_build_object(
                'voice_users', voice_users,
                'dark_mode_users', dark_mode_users,
                'total_users', total_users
            )
            FROM user_accessibility_stats
        )
    ) INTO result;
    
    RETURN result;
END;
$$;

-- RLS Policies
ALTER VIEW weekly_journal_entries ENABLE ROW LEVEL SECURITY;
ALTER VIEW common_seed_types ENABLE ROW LEVEL SECURITY;
ALTER VIEW triggered_reminders ENABLE ROW LEVEL SECURITY;
ALTER VIEW daily_health_scans ENABLE ROW LEVEL SECURITY;
ALTER VIEW user_accessibility_stats ENABLE ROW LEVEL SECURITY;

-- Admin-only access policies
CREATE POLICY "Admin only access to analytics views"
    ON weekly_journal_entries FOR SELECT
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin only access to analytics views"
    ON common_seed_types FOR SELECT
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin only access to analytics views"
    ON triggered_reminders FOR SELECT
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin only access to analytics views"
    ON daily_health_scans FOR SELECT
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin only access to analytics views"
    ON user_accessibility_stats FOR SELECT
    USING (auth.jwt() ->> 'role' = 'admin'); 