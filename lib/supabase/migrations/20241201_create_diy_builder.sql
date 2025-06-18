-- DIY System Builder Database Schema
-- This migration creates tables for the DIY hydroponic system builder

-- User builds table
CREATE TABLE IF NOT EXISTS user_builds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('planning', 'in_progress', 'completed', 'paused')),
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  target_completion_date TIMESTAMP WITH TIME ZONE,
  actual_completion_date TIMESTAMP WITH TIME ZONE,
  current_step_id TEXT,
  completed_steps TEXT[] DEFAULT '{}',
  modifications JSONB DEFAULT '[]',
  notes TEXT DEFAULT '',
  estimated_cost DECIMAL(10,2) DEFAULT 0,
  actual_cost DECIMAL(10,2),
  
  -- Integration with other modules
  linked_nutrient_recipe UUID,
  linked_lighting_setup UUID,
  linked_sensors TEXT[] DEFAULT '{}',
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Build steps table (for tracking step progress)
CREATE TABLE IF NOT EXISTS build_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id UUID REFERENCES user_builds(id) ON DELETE CASCADE,
  step_id TEXT NOT NULL,
  step_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  estimated_time INTEGER DEFAULT 0, -- minutes
  actual_time INTEGER, -- minutes
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
  notes TEXT DEFAULT '',
  tools_used TEXT[] DEFAULT '{}',
  materials_used JSONB DEFAULT '[]',
  completion_date TIMESTAMP WITH TIME ZONE,
  
  -- Progress tracking
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(build_id, step_id)
);

-- Build images table
CREATE TABLE IF NOT EXISTS build_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id UUID REFERENCES user_builds(id) ON DELETE CASCADE,
  step_id TEXT,
  image_url TEXT NOT NULL,
  caption TEXT DEFAULT '',
  image_type TEXT NOT NULL DEFAULT 'progress' CHECK (image_type IN ('progress', 'completion', 'problem', 'modification')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Image metadata
  file_size INTEGER,
  image_width INTEGER,
  image_height INTEGER,
  mime_type TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Materials inventory table (track what users have)
CREATE TABLE IF NOT EXISTS materials_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  material_id TEXT NOT NULL,
  material_name TEXT NOT NULL,
  quantity DECIMAL(10,3) DEFAULT 0,
  unit TEXT NOT NULL,
  cost_per_unit DECIMAL(10,2) DEFAULT 0,
  supplier TEXT,
  purchase_date DATE,
  expiry_date DATE,
  notes TEXT DEFAULT '',
  
  -- Status
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'depleted', 'expired')),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, material_id)
);

-- Build templates table (predefined system templates)
CREATE TABLE IF NOT EXISTS build_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_ar TEXT, -- Arabic translation
  description TEXT,
  description_ar TEXT, -- Arabic translation
  system_type TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  estimated_time INTEGER DEFAULT 0, -- hours
  estimated_cost_min DECIMAL(10,2) DEFAULT 0,
  estimated_cost_max DECIMAL(10,2) DEFAULT 0,
  plant_capacity INTEGER DEFAULT 0,
  
  -- Requirements
  space_requirements JSONB DEFAULT '{}',
  tool_requirements TEXT[] DEFAULT '{}',
  skill_requirements TEXT[] DEFAULT '{}',
  
  -- Template data
  build_steps JSONB DEFAULT '[]',
  materials_list JSONB DEFAULT '[]',
  
  -- Compatibility
  compatible_crops TEXT[] DEFAULT '{}',
  compatible_nutrients TEXT[] DEFAULT '{}',
  compatible_lighting TEXT[] DEFAULT '{}',
  
  -- Maintenance
  maintenance_schedule JSONB DEFAULT '[]',
  
  -- Metadata
  is_official BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Materials database table (comprehensive materials catalog)
CREATE TABLE IF NOT EXISTS materials_database (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_ar TEXT, -- Arabic translation
  description TEXT,
  description_ar TEXT, -- Arabic translation
  category TEXT NOT NULL,
  subcategory TEXT,
  unit TEXT NOT NULL,
  unit_ar TEXT, -- Arabic translation
  
  -- Specifications
  specifications JSONB DEFAULT '{}',
  dimensions JSONB DEFAULT '{}',
  weight DECIMAL(10,3),
  material_type TEXT,
  color TEXT,
  
  -- Pricing
  estimated_cost DECIMAL(10,2) DEFAULT 0,
  cost_range_min DECIMAL(10,2),
  cost_range_max DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  
  -- Suppliers
  suppliers JSONB DEFAULT '[]',
  availability TEXT DEFAULT 'available' CHECK (availability IN ('available', 'limited', 'out_of_stock', 'discontinued')),
  
  -- Alternatives
  alternatives TEXT[] DEFAULT '{}',
  substitutes TEXT[] DEFAULT '{}',
  
  -- Usage
  common_uses TEXT[] DEFAULT '{}',
  system_types TEXT[] DEFAULT '{}',
  
  -- Safety and handling
  safety_warnings TEXT[] DEFAULT '{}',
  handling_instructions TEXT,
  storage_requirements TEXT,
  
  -- Metadata
  is_featured BOOLEAN DEFAULT false,
  is_eco_friendly BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Build modifications table (track user customizations)
CREATE TABLE IF NOT EXISTS build_modifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id UUID REFERENCES user_builds(id) ON DELETE CASCADE,
  step_id TEXT,
  modification_type TEXT NOT NULL CHECK (modification_type IN ('material_substitution', 'quantity_change', 'step_skip', 'custom_step', 'tool_substitution')),
  original_value JSONB,
  new_value JSONB NOT NULL,
  reason TEXT,
  reason_ar TEXT, -- Arabic translation
  impact_assessment TEXT,
  cost_impact DECIMAL(10,2) DEFAULT 0,
  time_impact INTEGER DEFAULT 0, -- minutes
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Build sharing table (for community builds)
CREATE TABLE IF NOT EXISTS shared_builds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id UUID REFERENCES user_builds(id) ON DELETE CASCADE,
  shared_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  
  -- Sharing settings
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'unlisted', 'private')),
  allow_downloads BOOLEAN DEFAULT true,
  allow_modifications BOOLEAN DEFAULT true,
  
  -- Community metrics
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  rating_count INTEGER DEFAULT 0,
  
  -- Metadata
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Build comments table
CREATE TABLE IF NOT EXISTS build_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shared_build_id UUID REFERENCES shared_builds(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  parent_comment_id UUID REFERENCES build_comments(id) ON DELETE CASCADE,
  
  -- Moderation
  is_flagged BOOLEAN DEFAULT false,
  is_hidden BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Build ratings table
CREATE TABLE IF NOT EXISTS build_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shared_build_id UUID REFERENCES shared_builds(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  
  -- Rating categories
  difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
  clarity_rating INTEGER CHECK (clarity_rating >= 1 AND clarity_rating <= 5),
  result_quality_rating INTEGER CHECK (result_quality_rating >= 1 AND result_quality_rating <= 5),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(shared_build_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_builds_user_id ON user_builds(user_id);
CREATE INDEX IF NOT EXISTS idx_user_builds_status ON user_builds(status);
CREATE INDEX IF NOT EXISTS idx_user_builds_template_id ON user_builds(template_id);
CREATE INDEX IF NOT EXISTS idx_user_builds_created_at ON user_builds(created_at);

CREATE INDEX IF NOT EXISTS idx_build_steps_build_id ON build_steps(build_id);
CREATE INDEX IF NOT EXISTS idx_build_steps_status ON build_steps(status);
CREATE INDEX IF NOT EXISTS idx_build_steps_step_number ON build_steps(step_number);

CREATE INDEX IF NOT EXISTS idx_build_images_build_id ON build_images(build_id);
CREATE INDEX IF NOT EXISTS idx_build_images_step_id ON build_images(step_id);
CREATE INDEX IF NOT EXISTS idx_build_images_type ON build_images(image_type);

CREATE INDEX IF NOT EXISTS idx_materials_inventory_user_id ON materials_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_materials_inventory_material_id ON materials_inventory(material_id);
CREATE INDEX IF NOT EXISTS idx_materials_inventory_status ON materials_inventory(status);

CREATE INDEX IF NOT EXISTS idx_build_templates_system_type ON build_templates(system_type);
CREATE INDEX IF NOT EXISTS idx_build_templates_difficulty ON build_templates(difficulty);
CREATE INDEX IF NOT EXISTS idx_build_templates_active ON build_templates(is_active);

CREATE INDEX IF NOT EXISTS idx_materials_database_category ON materials_database(category);
CREATE INDEX IF NOT EXISTS idx_materials_database_availability ON materials_database(availability);
CREATE INDEX IF NOT EXISTS idx_materials_database_featured ON materials_database(is_featured);

CREATE INDEX IF NOT EXISTS idx_build_modifications_build_id ON build_modifications(build_id);
CREATE INDEX IF NOT EXISTS idx_build_modifications_type ON build_modifications(modification_type);

CREATE INDEX IF NOT EXISTS idx_shared_builds_visibility ON shared_builds(visibility);
CREATE INDEX IF NOT EXISTS idx_shared_builds_featured ON shared_builds(featured);
CREATE INDEX IF NOT EXISTS idx_shared_builds_rating ON shared_builds(rating);

-- Create triggers for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_builds_updated_at BEFORE UPDATE ON user_builds FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_build_steps_updated_at BEFORE UPDATE ON build_steps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_materials_inventory_updated_at BEFORE UPDATE ON materials_inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_build_templates_updated_at BEFORE UPDATE ON build_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_materials_database_updated_at BEFORE UPDATE ON materials_database FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shared_builds_updated_at BEFORE UPDATE ON shared_builds FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_build_comments_updated_at BEFORE UPDATE ON build_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_build_ratings_updated_at BEFORE UPDATE ON build_ratings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE user_builds ENABLE ROW LEVEL SECURITY;
ALTER TABLE build_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE build_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE build_modifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_builds ENABLE ROW LEVEL SECURITY;
ALTER TABLE build_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE build_ratings ENABLE ROW LEVEL SECURITY;

-- User builds policies
CREATE POLICY "Users can view their own builds" ON user_builds FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own builds" ON user_builds FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own builds" ON user_builds FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own builds" ON user_builds FOR DELETE USING (auth.uid() = user_id);

-- Build steps policies
CREATE POLICY "Users can view steps for their builds" ON build_steps FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_builds WHERE id = build_steps.build_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert steps for their builds" ON build_steps FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM user_builds WHERE id = build_steps.build_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update steps for their builds" ON build_steps FOR UPDATE USING (
  EXISTS (SELECT 1 FROM user_builds WHERE id = build_steps.build_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete steps for their builds" ON build_steps FOR DELETE USING (
  EXISTS (SELECT 1 FROM user_builds WHERE id = build_steps.build_id AND user_id = auth.uid())
);

-- Build images policies
CREATE POLICY "Users can view images for their builds" ON build_images FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_builds WHERE id = build_images.build_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert images for their builds" ON build_images FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM user_builds WHERE id = build_images.build_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update images for their builds" ON build_images FOR UPDATE USING (
  EXISTS (SELECT 1 FROM user_builds WHERE id = build_images.build_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete images for their builds" ON build_images FOR DELETE USING (
  EXISTS (SELECT 1 FROM user_builds WHERE id = build_images.build_id AND user_id = auth.uid())
);

-- Materials inventory policies
CREATE POLICY "Users can view their own inventory" ON materials_inventory FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own inventory" ON materials_inventory FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own inventory" ON materials_inventory FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own inventory" ON materials_inventory FOR DELETE USING (auth.uid() = user_id);

-- Build modifications policies
CREATE POLICY "Users can view modifications for their builds" ON build_modifications FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_builds WHERE id = build_modifications.build_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert modifications for their builds" ON build_modifications FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM user_builds WHERE id = build_modifications.build_id AND user_id = auth.uid())
);

-- Shared builds policies
CREATE POLICY "Anyone can view public shared builds" ON shared_builds FOR SELECT USING (visibility = 'public');
CREATE POLICY "Users can view their own shared builds" ON shared_builds FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_builds WHERE id = shared_builds.build_id AND user_id = auth.uid())
);
CREATE POLICY "Users can share their own builds" ON shared_builds FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM user_builds WHERE id = shared_builds.build_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update their own shared builds" ON shared_builds FOR UPDATE USING (
  EXISTS (SELECT 1 FROM user_builds WHERE id = shared_builds.build_id AND user_id = auth.uid())
);

-- Build comments policies
CREATE POLICY "Anyone can view comments on public builds" ON build_comments FOR SELECT USING (
  EXISTS (SELECT 1 FROM shared_builds WHERE id = build_comments.shared_build_id AND visibility = 'public')
);
CREATE POLICY "Authenticated users can insert comments" ON build_comments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update their own comments" ON build_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON build_comments FOR DELETE USING (auth.uid() = user_id);

-- Build ratings policies
CREATE POLICY "Anyone can view ratings for public builds" ON build_ratings FOR SELECT USING (
  EXISTS (SELECT 1 FROM shared_builds WHERE id = build_ratings.shared_build_id AND visibility = 'public')
);
CREATE POLICY "Authenticated users can rate builds" ON build_ratings FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update their own ratings" ON build_ratings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own ratings" ON build_ratings FOR DELETE USING (auth.uid() = user_id);

-- Public tables (no RLS needed)
-- build_templates and materials_database are public read-only

-- Insert some default build templates
INSERT INTO build_templates (template_id, name, name_ar, description, description_ar, system_type, difficulty, estimated_time, estimated_cost_min, estimated_cost_max, plant_capacity) VALUES
('nft_basic', 'Basic NFT System', 'نظام NFT الأساسي', 'A simple nutrient film technique system perfect for beginners', 'نظام تقنية الغشاء المغذي البسيط مثالي للمبتدئين', 'nft', 'beginner', 6, 120, 200, 12),
('dwc_starter', 'DWC Starter Kit', 'مجموعة بداية DWC', 'Deep water culture system for small spaces', 'نظام الزراعة المائية العميقة للمساحات الصغيرة', 'dwc', 'beginner', 3, 60, 120, 6),
('dutch_bucket_pro', 'Professional Dutch Bucket', 'الدلو الهولندي المحترف', 'Advanced dutch bucket system for larger plants', 'نظام الدلو الهولندي المتقدم للنباتات الكبيرة', 'dutch_bucket', 'intermediate', 8, 180, 350, 8),
('kratky_simple', 'Simple Kratky Setup', 'إعداد كراتكي البسيط', 'Passive hydroponic system requiring no electricity', 'نظام الزراعة المائية السلبي لا يتطلب كهرباء', 'kratky', 'beginner', 2, 30, 60, 4),
('vertical_tower', 'Vertical Tower Garden', 'برج الحديقة العمودي', 'Space-efficient vertical growing system', 'نظام نمو عمودي موفر للمساحة', 'vertical_tower', 'advanced', 12, 250, 500, 24);

-- Insert some common materials
INSERT INTO materials_database (material_id, name, name_ar, description, description_ar, category, unit, unit_ar, estimated_cost, suppliers) VALUES
('pvc_pipe_4in', '4" PVC Pipe', 'أنبوب PVC 4 بوصة', 'Main growing channel for NFT systems', 'قناة النمو الرئيسية لأنظمة NFT', 'pipe', 'ft', 'قدم', 3.50, '[{"name": "Home Depot", "price": 3.50}]'),
('net_pots_3in', '3" Net Pots', 'أواني شبكية 3 بوصة', 'Hold plants and growing medium', 'تحمل النباتات ووسط النمو', 'container', 'pieces', 'قطعة', 0.75, '[{"name": "Amazon", "price": 0.75}]'),
('water_pump_400gph', '400 GPH Water Pump', 'مضخة مياه 400 جالون/ساعة', 'Circulates nutrient solution', 'تدوير المحلول المغذي', 'pump', 'pieces', 'قطعة', 35.00, '[{"name": "Vivosun", "price": 35.00}]'),
('air_stone_4in', '4" Air Stone', 'حجر هواء 4 بوصة', 'Provides oxygenation in DWC systems', 'يوفر الأكسجة في أنظمة DWC', 'pump', 'pieces', 'قطعة', 8.00, '[{"name": "Amazon", "price": 8.00}]'),
('bucket_5gal', '5 Gallon Bucket', 'دلو 5 جالون', 'Container for dutch bucket systems', 'حاوية لأنظمة الدلو الهولندي', 'container', 'pieces', 'قطعة', 5.00, '[{"name": "Home Depot", "price": 5.00}]');

COMMENT ON TABLE user_builds IS 'User hydroponic system builds and projects';
COMMENT ON TABLE build_steps IS 'Individual steps in a build with progress tracking';
COMMENT ON TABLE build_images IS 'Photos and images associated with builds';
COMMENT ON TABLE materials_inventory IS 'User inventory of materials and supplies';
COMMENT ON TABLE build_templates IS 'Predefined system templates and blueprints';
COMMENT ON TABLE materials_database IS 'Comprehensive catalog of hydroponic materials';
COMMENT ON TABLE build_modifications IS 'User customizations and modifications to builds';
COMMENT ON TABLE shared_builds IS 'Community sharing of completed builds';
COMMENT ON TABLE build_comments IS 'User comments on shared builds';
COMMENT ON TABLE build_ratings IS 'User ratings and reviews of shared builds'; 