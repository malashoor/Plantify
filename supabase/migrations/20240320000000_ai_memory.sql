-- Create user_emotions table
CREATE TABLE IF NOT EXISTS user_emotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emotion_type TEXT NOT NULL CHECK (
    emotion_type IN ('joy', 'concern', 'frustration', 'curiosity', 'satisfaction', 'neutral')
  ),
  intensity FLOAT NOT NULL CHECK (intensity >= 0 AND intensity <= 1),
  context TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create memories table
CREATE TABLE IF NOT EXISTS memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (
    type IN ('conversation', 'insight', 'action', 'preference')
  ),
  content TEXT NOT NULL,
  context JSONB,
  importance FLOAT NOT NULL CHECK (importance >= 0 AND importance <= 1),
  timestamp TIMESTAMPTZ NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_emotions_user_id ON user_emotions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_emotions_timestamp ON user_emotions(timestamp);
CREATE INDEX IF NOT EXISTS idx_memories_user_id ON memories(user_id);
CREATE INDEX IF NOT EXISTS idx_memories_timestamp ON memories(timestamp);
CREATE INDEX IF NOT EXISTS idx_memories_type ON memories(type);
CREATE INDEX IF NOT EXISTS idx_memories_tags ON memories USING GIN(tags);

-- Enable full-text search for memories content
ALTER TABLE memories ADD COLUMN IF NOT EXISTS content_search tsvector
  GENERATED ALWAYS AS (to_tsvector('english', content)) STORED;

CREATE INDEX IF NOT EXISTS idx_memories_content_search ON memories USING GIN(content_search);

-- Add RLS policies
ALTER TABLE user_emotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

-- Users can only read and write their own emotions
CREATE POLICY "Users can read their own emotions"
  ON user_emotions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own emotions"
  ON user_emotions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only read and write their own memories
CREATE POLICY "Users can read their own memories"
  ON memories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own memories"
  ON memories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add functions for memory management
CREATE OR REPLACE FUNCTION get_recent_memories(
  p_user_id UUID,
  p_type TEXT[] DEFAULT NULL,
  p_limit INTEGER DEFAULT 10,
  p_min_importance FLOAT DEFAULT 0
)
RETURNS SETOF memories
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM memories
  WHERE user_id = p_user_id
    AND (p_type IS NULL OR type = ANY(p_type))
    AND importance >= p_min_importance
  ORDER BY timestamp DESC
  LIMIT p_limit;
END;
$$;

-- Add function for searching memories
CREATE OR REPLACE FUNCTION search_memories(
  p_user_id UUID,
  p_search_term TEXT,
  p_type TEXT[] DEFAULT NULL,
  p_limit INTEGER DEFAULT 10
)
RETURNS SETOF memories
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM memories
  WHERE user_id = p_user_id
    AND (p_type IS NULL OR type = ANY(p_type))
    AND content_search @@ plainto_tsquery('english', p_search_term)
  ORDER BY timestamp DESC
  LIMIT p_limit;
END;
$$;

-- Grant access to the functions
GRANT EXECUTE ON FUNCTION get_recent_memories TO authenticated;
GRANT EXECUTE ON FUNCTION search_memories TO authenticated; 