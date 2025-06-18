-- Create table for saved nutrient recipes
CREATE TABLE saved_nutrient_recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  custom_name TEXT,
  notes TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  use_count INTEGER DEFAULT 1,
  is_offline BOOLEAN DEFAULT FALSE,
  sync_status TEXT DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for official nutrient recipes
CREATE TABLE nutrient_recipes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT,
  crop_id TEXT NOT NULL,
  stage_id TEXT NOT NULL,
  description TEXT,
  description_ar TEXT,
  nutrients JSONB NOT NULL,
  ph_min DECIMAL(3,1) NOT NULL,
  ph_max DECIMAL(3,1) NOT NULL,
  ph_optimal DECIMAL(3,1) NOT NULL,
  ec_min DECIMAL(3,1) NOT NULL,
  ec_max DECIMAL(3,1) NOT NULL,
  ec_optimal DECIMAL(3,1) NOT NULL,
  water_volume INTEGER DEFAULT 10,
  is_official BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for crops
CREATE TABLE crops (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT,
  category TEXT NOT NULL,
  category_ar TEXT,
  description TEXT,
  description_ar TEXT,
  stages JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for crop stages
CREATE TABLE crop_stages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT,
  description TEXT,
  description_ar TEXT,
  duration_days INTEGER NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE saved_nutrient_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrient_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_stages ENABLE ROW LEVEL SECURITY;

-- Create policies for saved_nutrient_recipes
CREATE POLICY "Users can view their own saved recipes" ON saved_nutrient_recipes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved recipes" ON saved_nutrient_recipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved recipes" ON saved_nutrient_recipes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved recipes" ON saved_nutrient_recipes
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for nutrient_recipes (read-only for users, full access for admins)
CREATE POLICY "Anyone can view nutrient recipes" ON nutrient_recipes
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage nutrient recipes" ON nutrient_recipes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Create policies for crops (read-only for users, full access for admins)
CREATE POLICY "Anyone can view crops" ON crops
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage crops" ON crops
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Create policies for crop_stages (read-only for users, full access for admins)
CREATE POLICY "Anyone can view crop stages" ON crop_stages
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage crop stages" ON crop_stages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_saved_nutrient_recipes_user_id ON saved_nutrient_recipes(user_id);
CREATE INDEX idx_saved_nutrient_recipes_recipe_id ON saved_nutrient_recipes(recipe_id);
CREATE INDEX idx_saved_nutrient_recipes_last_used ON saved_nutrient_recipes(last_used);
CREATE INDEX idx_saved_nutrient_recipes_sync_status ON saved_nutrient_recipes(sync_status);

CREATE INDEX idx_nutrient_recipes_crop_stage ON nutrient_recipes(crop_id, stage_id);
CREATE INDEX idx_nutrient_recipes_official ON nutrient_recipes(is_official);

CREATE INDEX idx_crops_category ON crops(category);

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating updated_at
CREATE TRIGGER update_saved_nutrient_recipes_updated_at 
  BEFORE UPDATE ON saved_nutrient_recipes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nutrient_recipes_updated_at 
  BEFORE UPDATE ON nutrient_recipes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crops_updated_at 
  BEFORE UPDATE ON crops 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crop_stages_updated_at 
  BEFORE UPDATE ON crop_stages 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default crop stages
INSERT INTO crop_stages (id, name, name_ar, description, description_ar, duration_days, order_index) VALUES
('seedling', 'Seedling', 'شتلة', 'First 2-3 weeks after germination', 'أول 2-3 أسابيع بعد الإنبات', 21, 1),
('vegetative', 'Vegetative Growth', 'النمو الخضري', 'Active leaf and stem development', 'تطوير الأوراق والساق النشط', 42, 2),
('flowering', 'Flowering', 'الإزهار', 'Flower initiation and development', 'بداية وتطوير الأزهار', 28, 3),
('fruiting', 'Fruiting', 'الإثمار', 'Fruit development and maturation', 'تطوير ونضج الثمار', 35, 4);

-- Insert default crops
INSERT INTO crops (id, name, name_ar, category, category_ar, description, description_ar, stages) VALUES
('lettuce', 'Lettuce', 'خس', 'Leafy Greens', 'خضروات ورقية', 'Fast-growing leafy vegetable', 'خضروات ورقية سريعة النمو', 
 '["seedling", "vegetative", "flowering", "fruiting"]'::jsonb),
('tomato', 'Tomato', 'طماطم', 'Fruit Vegetables', 'خضروات ثمرية', 'Popular fruiting vegetable', 'خضروات ثمرية شائعة',
 '["seedling", "vegetative", "flowering", "fruiting"]'::jsonb),
('basil', 'Basil', 'ريحان', 'Herbs', 'أعشاب', 'Aromatic culinary herb', 'عشب طبخ عطري',
 '["seedling", "vegetative", "flowering", "fruiting"]'::jsonb);

-- Insert sample nutrient recipes
INSERT INTO nutrient_recipes (
  id, name, name_ar, crop_id, stage_id, description, description_ar,
  nutrients, ph_min, ph_max, ph_optimal, ec_min, ec_max, ec_optimal, water_volume
) VALUES
(
  'lettuce_seedling_basic',
  'Basic Lettuce Seedling',
  'خس شتلة أساسي',
  'lettuce',
  'seedling',
  'Gentle nutrient mix for young lettuce plants',
  'خليط غذائي لطيف لنباتات الخس الصغيرة',
  '[
    {"id": "nitrogen", "name": "Nitrogen", "symbol": "N", "optimalValue": 150, "category": "macro"},
    {"id": "phosphorus", "name": "Phosphorus", "symbol": "P", "optimalValue": 40, "category": "macro"},
    {"id": "potassium", "name": "Potassium", "symbol": "K", "optimalValue": 200, "category": "macro"},
    {"id": "calcium", "name": "Calcium", "symbol": "Ca", "optimalValue": 120, "category": "secondary"},
    {"id": "magnesium", "name": "Magnesium", "symbol": "Mg", "optimalValue": 40, "category": "secondary"},
    {"id": "iron", "name": "Iron", "symbol": "Fe", "optimalValue": 3, "category": "micro"}
  ]'::jsonb,
  5.5, 6.5, 6.0, 0.8, 1.2, 1.0, 10
),
(
  'tomato_veg_complete',
  'Complete Tomato Vegetative',
  'طماطم خضري كامل',
  'tomato',
  'vegetative',
  'Full spectrum nutrients for vegetative growth',
  'عناصر غذائية شاملة للنمو الخضري',
  '[
    {"id": "nitrogen", "name": "Nitrogen", "symbol": "N", "optimalValue": 200, "category": "macro"},
    {"id": "phosphorus", "name": "Phosphorus", "symbol": "P", "optimalValue": 50, "category": "macro"},
    {"id": "potassium", "name": "Potassium", "symbol": "K", "optimalValue": 250, "category": "macro"},
    {"id": "calcium", "name": "Calcium", "symbol": "Ca", "optimalValue": 150, "category": "secondary"},
    {"id": "magnesium", "name": "Magnesium", "symbol": "Mg", "optimalValue": 50, "category": "secondary"},
    {"id": "sulfur", "name": "Sulfur", "symbol": "S", "optimalValue": 100, "category": "secondary"},
    {"id": "iron", "name": "Iron", "symbol": "Fe", "optimalValue": 4, "category": "micro"},
    {"id": "manganese", "name": "Manganese", "symbol": "Mn", "optimalValue": 1, "category": "micro"},
    {"id": "zinc", "name": "Zinc", "symbol": "Zn", "optimalValue": 0.5, "category": "micro"},
    {"id": "copper", "name": "Copper", "symbol": "Cu", "optimalValue": 0.2, "category": "micro"},
    {"id": "boron", "name": "Boron", "symbol": "B", "optimalValue": 0.5, "category": "micro"},
    {"id": "molybdenum", "name": "Molybdenum", "symbol": "Mo", "optimalValue": 0.05, "category": "micro"}
  ]'::jsonb,
  5.8, 6.8, 6.3, 1.2, 1.8, 1.5, 10
); 