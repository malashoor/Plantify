-- Create notification_interactions table
CREATE TABLE IF NOT EXISTS "public"."notification_interactions" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "user_id" uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  "notification_id" text NOT NULL,
  "action" text NOT NULL,
  "additional_data" jsonb,
  "timestamp" timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

-- Set up row level security
ALTER TABLE "public"."notification_interactions" ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own notification interactions
CREATE POLICY "Users can view their own notification interactions"
  ON "public"."notification_interactions"
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow the service role to insert notification interactions
CREATE POLICY "Service role can insert notification interactions"
  ON "public"."notification_interactions"
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Create function to process notification interactions
CREATE OR REPLACE FUNCTION process_notification_interaction()
RETURNS TRIGGER AS $$
BEGIN
  -- You could add additional processing logic here if needed
  -- For example, you might want to update other tables based on the interaction

  -- If it's a "mark-done" action for a reminder/task, you could update the tasks table
  IF NEW.action = 'action' AND 
     (NEW.additional_data->>'actionIdentifier' = 'mark-done') AND
     (NEW.additional_data->>'taskId' IS NOT NULL) THEN
    
    -- Update the task as completed
    UPDATE tasks 
    SET is_completed = true, 
        completed_at = NOW()
    WHERE id = (NEW.additional_data->>'taskId')::uuid AND 
          user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to process notification interactions after insert
CREATE TRIGGER after_notification_interaction_insert
AFTER INSERT ON notification_interactions
FOR EACH ROW
EXECUTE FUNCTION process_notification_interaction();

-- Create index for faster queries
CREATE INDEX notification_interactions_user_id_idx ON notification_interactions(user_id);
CREATE INDEX notification_interactions_timestamp_idx ON notification_interactions(timestamp);
CREATE INDEX notification_interactions_action_idx ON notification_interactions(action);

-- Add RLS comment for documentation
COMMENT ON TABLE "public"."notification_interactions" IS 'Stores user interactions with notifications such as taps, dismissals, and snoozes';

-- Grant appropriate permissions
GRANT SELECT, INSERT ON "public"."notification_interactions" TO authenticated;
GRANT ALL ON "public"."notification_interactions" TO service_role; 