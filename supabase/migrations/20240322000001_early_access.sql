-- Create early access table
CREATE TABLE IF NOT EXISTS public.early_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  newsletter_opt_in BOOLEAN DEFAULT false,
  recaptcha_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- Enable RLS
ALTER TABLE public.early_access ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow anyone to insert (sign up)
CREATE POLICY "Allow public signup" ON public.early_access
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Only allow admins to view all records
CREATE POLICY "Allow admins to view all" ON public.early_access
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Create function to check for duplicate emails
CREATE OR REPLACE FUNCTION check_duplicate_email()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.early_access 
    WHERE email = NEW.email AND id != NEW.id
  ) THEN
    RAISE EXCEPTION 'Email already registered';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for duplicate email check
CREATE TRIGGER check_duplicate_email_trigger
  BEFORE INSERT OR UPDATE ON public.early_access
  FOR EACH ROW
  EXECUTE FUNCTION check_duplicate_email();

-- Create function to validate reCAPTCHA token
CREATE OR REPLACE FUNCTION validate_recaptcha_token(token TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  response JSONB;
  success BOOLEAN;
BEGIN
  -- Call reCAPTCHA API to validate token
  SELECT content::jsonb INTO response
  FROM http_post(
    'https://www.google.com/recaptcha/api/siteverify',
    jsonb_build_object(
      'secret', current_setting('app.settings.recaptcha_secret_key'),
      'response', token
    )::text,
    'application/json'
  );

  success := response->>'success';
  RETURN success;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger to validate reCAPTCHA token before insert
CREATE OR REPLACE FUNCTION validate_recaptcha_before_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.recaptcha_token IS NULL OR NOT validate_recaptcha_token(NEW.recaptcha_token) THEN
    RAISE EXCEPTION 'Invalid reCAPTCHA token';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER validate_recaptcha_trigger
  BEFORE INSERT ON public.early_access
  FOR EACH ROW
  EXECUTE FUNCTION validate_recaptcha_before_insert(); 