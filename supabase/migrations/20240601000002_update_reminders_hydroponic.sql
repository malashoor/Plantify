-- Add new columns to reminders table to support hydroponic tasks
ALTER TABLE "public"."reminders" ADD COLUMN IF NOT EXISTS "context_type" text CHECK (context_type IN ('plant', 'hydroponic', 'medication', 'general'));
ALTER TABLE "public"."reminders" ADD COLUMN IF NOT EXISTS "priority" text CHECK (priority IN ('low', 'medium', 'high'));
ALTER TABLE "public"."reminders" ADD COLUMN IF NOT EXISTS "emotion_tone" text CHECK (emotion_tone IN ('neutral', 'positive', 'urgent', 'gentle'));
ALTER TABLE "public"."reminders" ADD COLUMN IF NOT EXISTS "category" text CHECK (category IN ('daily_check', 'nutrient_refill', 'harvest_alert', 'ph_balance', 'water_change', 'system_clean'));

-- Update the type enum to include hydroponic and medication
ALTER TABLE "public"."reminders" DROP CONSTRAINT IF EXISTS "reminders_type_check";
ALTER TABLE "public"."reminders" ADD CONSTRAINT "reminders_type_check" 
  CHECK (type IN ('journal', 'seed', 'system', 'hydroponic', 'medication'));

-- Set defaults for existing records
UPDATE "public"."reminders" SET "context_type" = 'plant' WHERE "context_type" IS NULL;
UPDATE "public"."reminders" SET "priority" = 'medium' WHERE "priority" IS NULL;
UPDATE "public"."reminders" SET "emotion_tone" = 'neutral' WHERE "emotion_tone" IS NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS "reminders_context_type_idx" ON "public"."reminders" ("context_type");
CREATE INDEX IF NOT EXISTS "reminders_category_idx" ON "public"."reminders" ("category");
CREATE INDEX IF NOT EXISTS "reminders_type_context_idx" ON "public"."reminders" ("type", "context_type");

-- Add comments for documentation
COMMENT ON COLUMN "public"."reminders"."context_type" IS 'The context for this reminder (plant, hydroponic, medication, general)';
COMMENT ON COLUMN "public"."reminders"."priority" IS 'Priority level for this reminder';
COMMENT ON COLUMN "public"."reminders"."emotion_tone" IS 'Emotion tone for notification messages';
COMMENT ON COLUMN "public"."reminders"."category" IS 'Category for hydroponic task reminders'; 