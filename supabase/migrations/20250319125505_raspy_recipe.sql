/*
  # Admin Features Migration

  1. New Tables
    - user_activities: Track user actions
    - content_reports: Content moderation system
    - user_bans: User ban management
    - analytics_events: Analytics tracking
    - security_audit_logs: Security audit logging

  2. Security
    - RLS policies for admin access
    - Secure audit logging
*/

-- User Activities Table
CREATE TABLE IF NOT EXISTS user_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  action text NOT NULL,
  timestamp timestamptz NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Content Reports Table
CREATE TABLE IF NOT EXISTS content_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  content_type text NOT NULL,
  content_id text NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  timestamp timestamptz NOT NULL DEFAULT now(),
  reviewed_by uuid REFERENCES auth.users,
  reviewed_at timestamptz
);

-- User Bans Table
CREATE TABLE IF NOT EXISTS user_bans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  reason text NOT NULL,
  banned_at timestamptz NOT NULL DEFAULT now(),
  banned_by uuid REFERENCES auth.users,
  lifted_at timestamptz,
  lifted_by uuid REFERENCES auth.users
);

-- Analytics Events Table
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event text NOT NULL,
  properties jsonb DEFAULT '{}'::jsonb,
  timestamp timestamptz NOT NULL DEFAULT now()
);

-- Security Audit Logs Table
CREATE TABLE IF NOT EXISTS security_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  details jsonb NOT NULL,
  timestamp timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bans ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies only if they don't exist
DO $$
BEGIN
  -- User Activities policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_activities' 
    AND policyname = 'Admins can read all user activities'
  ) THEN
    CREATE POLICY "Admins can read all user activities"
      ON user_activities
      FOR SELECT
      TO authenticated
      USING (auth.jwt() ->> 'role' IN ('super_admin', 'support_admin'));
  END IF;

  -- Content Reports policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'content_reports' 
    AND policyname = 'Content moderators can manage reports'
  ) THEN
    CREATE POLICY "Content moderators can manage reports"
      ON content_reports
      FOR ALL
      TO authenticated
      USING (auth.jwt() ->> 'role' IN ('super_admin', 'content_moderator'));
  END IF;

  -- User Bans policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_bans' 
    AND policyname = 'Admins can manage user bans'
  ) THEN
    CREATE POLICY "Admins can manage user bans"
      ON user_bans
      FOR ALL
      TO authenticated
      USING (auth.jwt() ->> 'role' IN ('super_admin', 'content_moderator'));
  END IF;

  -- Analytics Events policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'analytics_events' 
    AND policyname = 'Analytics viewers can read analytics'
  ) THEN
    CREATE POLICY "Analytics viewers can read analytics"
      ON analytics_events
      FOR SELECT
      TO authenticated
      USING (auth.jwt() ->> 'role' IN ('super_admin', 'analytics_viewer'));
  END IF;

  -- Security Audit Logs policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'security_audit_logs' 
    AND policyname = 'Only super admins can access audit logs'
  ) THEN
    CREATE POLICY "Only super admins can access audit logs"
      ON security_audit_logs
      FOR ALL
      TO authenticated
      USING (auth.jwt() ->> 'role' = 'super_admin');
  END IF;
END
$$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_timestamp ON user_activities(timestamp);
CREATE INDEX IF NOT EXISTS idx_content_reports_status ON content_reports(status);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_action ON security_audit_logs(action);