-- Seeds table for hydroponic plants
CREATE TABLE IF NOT EXISTS "public"."seeds" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "scientific_name" text,
  "temp_min" numeric(4,1) NOT NULL,
  "temp_max" numeric(4,1) NOT NULL,
  "ph_min" numeric(3,1) NOT NULL,
  "ph_max" numeric(3,1) NOT NULL,
  "germ_days_min" integer NOT NULL,
  "germ_days_max" integer NOT NULL,
  "ec_min" numeric(3,1),
  "ec_max" numeric(3,1),
  "notes" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  "user_id" uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  "is_public" boolean DEFAULT false,
  CONSTRAINT "valid_ph_range" CHECK (ph_min < ph_max),
  CONSTRAINT "valid_temperature_range" CHECK (temp_min < temp_max),
  CONSTRAINT "valid_germination_days" CHECK (germ_days_min < germ_days_max)
);

-- Germination logs
CREATE TABLE IF NOT EXISTS "public"."germination_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "seed_id" uuid REFERENCES public.seeds(id) NOT NULL,
  "date" date NOT NULL DEFAULT CURRENT_DATE,
  "status" text NOT NULL CHECK (status IN ('started', 'sprouted', 'failed', 'transplanted')),
  "notes" text,
  "photo_url" text,
  "user_id" uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- Plant stages for tracking growth cycles
CREATE TABLE IF NOT EXISTS "public"."plant_stages" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "plant_id" uuid NOT NULL,
  "stage" text NOT NULL CHECK (stage IN ('germination', 'seedling', 'vegetative', 'flowering', 'harvest')),
  "started_at" timestamptz NOT NULL DEFAULT now(),
  "ended_at" timestamptz,
  "duration_days" integer,
  "notes" text,
  "user_id" uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "valid_stage_dates" CHECK (ended_at IS NULL OR ended_at > started_at)
);

-- Harvests for recording yield data
CREATE TABLE IF NOT EXISTS "public"."harvests" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "plant_id" uuid NOT NULL,
  "harvest_date" date NOT NULL DEFAULT CURRENT_DATE,
  "weight_g" numeric(7,2) NOT NULL,
  "quality_rating" integer CHECK (quality_rating BETWEEN 1 AND 5),
  "notes" text,
  "photo_url" text,
  "user_id" uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- Articles for hydroponic learning center
CREATE TABLE IF NOT EXISTS "public"."articles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" text NOT NULL,
  "content_md" text NOT NULL,
  "tags" text[] NOT NULL DEFAULT '{}',
  "author_id" uuid REFERENCES auth.users(id),
  "published_at" timestamptz,
  "is_published" boolean DEFAULT false,
  "thumbnail_url" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  "user_id" uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable Row Level Security
ALTER TABLE "public"."seeds" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."germination_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."plant_stages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."harvests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."articles" ENABLE ROW LEVEL SECURITY;

-- Create policies for seeds table
CREATE POLICY "Users can view public seeds"
  ON "public"."seeds"
  FOR SELECT
  USING (is_public OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own seeds"
  ON "public"."seeds"
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own seeds"
  ON "public"."seeds"
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own seeds"
  ON "public"."seeds"
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for germination_logs table
CREATE POLICY "Users can view their own germination logs"
  ON "public"."germination_logs"
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own germination logs"
  ON "public"."germination_logs"
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own germination logs"
  ON "public"."germination_logs"
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own germination logs"
  ON "public"."germination_logs"
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for plant_stages table
CREATE POLICY "Users can view their own plant stages"
  ON "public"."plant_stages"
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plant stages"
  ON "public"."plant_stages"
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plant stages"
  ON "public"."plant_stages"
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plant stages"
  ON "public"."plant_stages"
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for harvests table
CREATE POLICY "Users can view their own harvests"
  ON "public"."harvests"
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own harvests"
  ON "public"."harvests"
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own harvests"
  ON "public"."harvests"
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own harvests"
  ON "public"."harvests"
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for articles table
CREATE POLICY "Anyone can view published articles"
  ON "public"."articles"
  FOR SELECT
  USING (is_published OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own articles"
  ON "public"."articles"
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own articles"
  ON "public"."articles"
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own articles"
  ON "public"."articles"
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indices for performance
CREATE INDEX seeds_name_idx ON seeds (name);
CREATE INDEX seeds_user_id_idx ON seeds (user_id);
CREATE INDEX germination_logs_seed_id_idx ON germination_logs (seed_id);
CREATE INDEX germination_logs_user_id_idx ON germination_logs (user_id);
CREATE INDEX germination_logs_date_idx ON germination_logs (date);
CREATE INDEX plant_stages_plant_id_idx ON plant_stages (plant_id);
CREATE INDEX plant_stages_user_id_idx ON plant_stages (user_id);
CREATE INDEX plant_stages_stage_idx ON plant_stages (stage);
CREATE INDEX harvests_plant_id_idx ON harvests (plant_id);
CREATE INDEX harvests_user_id_idx ON harvests (user_id);
CREATE INDEX harvests_date_idx ON harvests (harvest_date);
CREATE INDEX articles_tags_idx ON articles USING GIN (tags);
CREATE INDEX articles_published_idx ON articles (is_published, published_at);

-- Add audit triggers for updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER seeds_updated_at
BEFORE UPDATE ON seeds
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER germination_logs_updated_at
BEFORE UPDATE ON germination_logs
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER plant_stages_updated_at
BEFORE UPDATE ON plant_stages
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER harvests_updated_at
BEFORE UPDATE ON harvests
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER articles_updated_at
BEFORE UPDATE ON articles
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Add comments for documentation
COMMENT ON TABLE seeds IS 'Seeds for hydroponic planting with optimal growing conditions';
COMMENT ON TABLE germination_logs IS 'Tracking germination process from start to transplant';
COMMENT ON TABLE plant_stages IS 'Growth stages of plants throughout their lifecycle';
COMMENT ON TABLE harvests IS 'Harvest data including weight and quality';
COMMENT ON TABLE articles IS 'Educational content for hydroponic learning center'; 