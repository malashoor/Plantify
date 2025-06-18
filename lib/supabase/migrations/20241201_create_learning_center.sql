-- Learning Center Database Schema Migration
-- Date: 2024-12-01
-- Description: Complete learning management system for hydroponic education

-- Enable Row Level Security
-- This migration creates all necessary tables for the educational learning center

-- Learning Modules Table
CREATE TABLE IF NOT EXISTS learning_modules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    title_ar TEXT,
    description TEXT NOT NULL,
    description_ar TEXT,
    category TEXT NOT NULL CHECK (category IN ('fundamentals', 'water_science', 'climate_control', 'pest_disease', 'maintenance')),
    difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    estimated_duration INTEGER NOT NULL DEFAULT 0, -- minutes
    prerequisites TEXT[] DEFAULT '{}', -- array of module IDs
    module_icon TEXT DEFAULT 'leaf-outline',
    color TEXT DEFAULT '#10B981',
    is_unlocked BOOLEAN DEFAULT false,
    lesson_count INTEGER DEFAULT 0,
    completion_reward JSONB, -- { type, title, description }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL
);

-- Learning Lessons Table
CREATE TABLE IF NOT EXISTS learning_lessons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    module_id UUID REFERENCES learning_modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    title_ar TEXT,
    description TEXT NOT NULL,
    description_ar TEXT,
    lesson_number INTEGER NOT NULL,
    estimated_duration INTEGER NOT NULL DEFAULT 0, -- minutes
    difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    tags TEXT[] DEFAULT '{}',
    learning_objectives TEXT[] DEFAULT '{}',
    learning_objectives_ar TEXT[] DEFAULT '{}',
    is_unlocked BOOLEAN DEFAULT false,
    is_completed BOOLEAN DEFAULT false,
    content JSONB NOT NULL DEFAULT '{}', -- lesson content structure
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL,
    UNIQUE(module_id, lesson_number)
);

-- User Learning Progress Table
CREATE TABLE IF NOT EXISTS learning_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    module_id UUID REFERENCES learning_modules(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES learning_lessons(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'bookmarked')),
    completion_percentage DECIMAL(5,2) DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    time_spent INTEGER DEFAULT 0, -- seconds
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()),
    bookmarked BOOLEAN DEFAULT false,
    notes TEXT DEFAULT '',
    notes_ar TEXT DEFAULT '',
    best_quiz_score DECIMAL(5,2), -- percentage
    study_streak INTEGER DEFAULT 0,
    total_study_time INTEGER DEFAULT 0, -- seconds
    weak_areas TEXT[] DEFAULT '{}',
    strong_areas TEXT[] DEFAULT '{}',
    is_offline BOOLEAN DEFAULT false,
    sync_status TEXT DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL,
    UNIQUE(user_id, module_id, lesson_id)
);

-- Learning Bookmarks Table
CREATE TABLE IF NOT EXISTS learning_bookmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES learning_lessons(id) ON DELETE CASCADE,
    section_id TEXT, -- specific section within lesson
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    timestamp_seconds INTEGER, -- for video/audio content
    notes TEXT DEFAULT '',
    notes_ar TEXT DEFAULT '',
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL
);

-- Learning Achievements Table
CREATE TABLE IF NOT EXISTS learning_achievements (
    id TEXT PRIMARY KEY, -- predefined achievement IDs
    type TEXT NOT NULL CHECK (type IN ('completion', 'streak', 'quiz_master', 'practice', 'exploration')),
    title TEXT NOT NULL,
    title_ar TEXT,
    description TEXT NOT NULL,
    description_ar TEXT,
    icon TEXT DEFAULT 'trophy',
    criteria JSONB NOT NULL DEFAULT '{}', -- achievement criteria
    points INTEGER DEFAULT 0,
    rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL
);

-- User Achievements Table (unlocked achievements)
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id TEXT REFERENCES learning_achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL,
    progress JSONB DEFAULT '{}', -- progress towards achievement
    UNIQUE(user_id, achievement_id)
);

-- Practice Links Table
CREATE TABLE IF NOT EXISTS practice_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lesson_id UUID REFERENCES learning_lessons(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('nutrient_calculator', 'lighting_calculator', 'diy_builder', 'external')),
    title TEXT NOT NULL,
    title_ar TEXT,
    description TEXT DEFAULT '',
    description_ar TEXT DEFAULT '',
    route TEXT, -- app route or external URL
    parameters JSONB DEFAULT '{}', -- route parameters
    icon TEXT DEFAULT 'link',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_learning_lessons_module_id ON learning_lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_user_id ON learning_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_module_id ON learning_progress(module_id);
CREATE INDEX IF NOT EXISTS idx_learning_bookmarks_user_id ON learning_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_links_lesson_id ON practice_links(lesson_id);

-- Row Level Security (RLS) Policies

-- Learning Modules - Public read access
ALTER TABLE learning_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view learning modules" ON learning_modules FOR SELECT USING (true);

-- Learning Lessons - Public read access
ALTER TABLE learning_lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view learning lessons" ON learning_lessons FOR SELECT USING (true);

-- Learning Progress - User-specific access
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own progress" ON learning_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own progress" ON learning_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress" ON learning_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own progress" ON learning_progress FOR DELETE USING (auth.uid() = user_id);

-- Learning Bookmarks - User-specific access
ALTER TABLE learning_bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own bookmarks" ON learning_bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own bookmarks" ON learning_bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own bookmarks" ON learning_bookmarks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own bookmarks" ON learning_bookmarks FOR DELETE USING (auth.uid() = user_id);

-- Learning Achievements - Public read access
ALTER TABLE learning_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view learning achievements" ON learning_achievements FOR SELECT USING (true);

-- User Achievements - User-specific access
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own achievements" ON user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Practice Links - Public read access
ALTER TABLE practice_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view practice links" ON practice_links FOR SELECT USING (true);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::TEXT, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_learning_modules_updated_at BEFORE UPDATE ON learning_modules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_learning_lessons_updated_at BEFORE UPDATE ON learning_lessons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_learning_progress_updated_at BEFORE UPDATE ON learning_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_learning_bookmarks_updated_at BEFORE UPDATE ON learning_bookmarks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample learning modules
INSERT INTO learning_modules (id, title, title_ar, description, description_ar, category, difficulty, estimated_duration, prerequisites, module_icon, color, is_unlocked, lesson_count) VALUES
('hydroponics_fundamentals', 'Hydroponics Fundamentals', 'أساسيات الزراعة المائية', 'Master the core principles of soilless growing systems', 'أتقن المبادئ الأساسية لأنظمة النمو بدون تربة', 'fundamentals', 'beginner', 120, '{}', 'leaf-outline', '#10B981', true, 3),
('water_nutrient_science', 'Water & Nutrient Science', 'علم الماء والمغذيات', 'Deep dive into EC, pH, TDS, and nutrient mixing', 'غوص عميق في EC وpH وTDS وخلط المغذيات', 'water_science', 'intermediate', 180, '{"hydroponics_fundamentals"}', 'water-outline', '#3B82F6', false, 4),
('climate_lighting_control', 'Climate & Lighting Control', 'التحكم في المناخ والإضاءة', 'Environmental optimization for maximum yields', 'تحسين البيئة للحصول على أقصى إنتاجية', 'climate_control', 'intermediate', 150, '{"hydroponics_fundamentals"}', 'sunny-outline', '#F59E0B', false, 3),
('pest_disease_prevention', 'Pest & Disease Management', 'إدارة الآفات والأمراض', 'Identify, prevent, and treat common hydroponic issues', 'تحديد ومنع وعلاج مشاكل الزراعة المائية الشائعة', 'pest_disease', 'advanced', 200, '{"hydroponics_fundamentals", "water_nutrient_science"}', 'bug-outline', '#EF4444', false, 5),
('system_maintenance', 'System Maintenance & Troubleshooting', 'صيانة النظام واستكشاف الأخطاء', 'Keep your systems running at peak performance', 'حافظ على تشغيل أنظمتك بأقصى أداء', 'maintenance', 'intermediate', 160, '{"hydroponics_fundamentals", "water_nutrient_science"}', 'build-outline', '#8B5CF6', false, 4);

-- Insert sample lessons for Hydroponics Fundamentals
INSERT INTO learning_lessons (id, module_id, title, title_ar, description, description_ar, lesson_number, estimated_duration, difficulty, tags, learning_objectives, learning_objectives_ar, is_unlocked, content) VALUES
('intro_to_hydroponics', 'hydroponics_fundamentals', 'Introduction to Hydroponics', 'مقدمة في الزراعة المائية', 'What is hydroponics and why choose soilless growing?', 'ما هي الزراعة المائية ولماذا نختار النمو بدون تربة؟', 1, 30, 'beginner', '{"basics", "introduction", "principles"}', '{"Define hydroponics and its core principles", "Compare soil vs soilless growing advantages", "Identify the 6 essential elements plants need"}', '{"تعريف الزراعة المائية ومبادئها الأساسية", "مقارنة مزايا النمو بالتربة مقابل بدون تربة", "تحديد العناصر الستة الأساسية التي تحتاجها النباتات"}', true, '{"sections": [{"id": "intro", "type": "introduction", "title": "Welcome to Hydroponics", "content": "Hydroponics is the science of growing plants without soil...", "duration": 300}]}'),
('hydroponic_systems_overview', 'hydroponics_fundamentals', 'Types of Hydroponic Systems', 'أنواع أنظمة الزراعة المائية', 'NFT, DWC, Dutch Bucket, and more - choosing the right system', 'NFT وDWC والدلو الهولندي والمزيد - اختيار النظام المناسب', 2, 45, 'beginner', '{"systems", "nft", "dwc", "comparison"}', '{"Compare different hydroponic system types", "Understand water flow patterns and oxygenation", "Match system types to crop requirements"}', '{"مقارنة أنواع أنظمة الزراعة المائية المختلفة", "فهم أنماط تدفق الماء والأكسجة", "مطابقة أنواع الأنظمة مع متطلبات المحاصيل"}', true, '{"sections": [{"id": "systems", "type": "concept", "title": "System Types", "content": "There are six main types of hydroponic systems...", "duration": 450}]}'),
('growing_media', 'hydroponics_fundamentals', 'Growing Media & Root Support', 'وسائط النمو ودعم الجذور', 'From rockwool to clay pebbles - choosing the right medium', 'من الصوف الصخري إلى حصى الطين - اختيار الوسط المناسب', 3, 35, 'beginner', '{"media", "rockwool", "clay", "support"}', '{"Compare different growing media properties", "Understand drainage and aeration requirements", "Select media based on crop and system type"}', '{"مقارنة خصائص وسائط النمو المختلفة", "فهم متطلبات التصريف والتهوية", "اختيار الوسائط حسب نوع المحصول والنظام"}', true, '{"sections": [{"id": "media", "type": "concept", "title": "Growing Media Options", "content": "Growing media provides support and aeration...", "duration": 420}]}');

-- Insert sample practice links
INSERT INTO practice_links (lesson_id, type, title, title_ar, description, description_ar, route, parameters, icon, sort_order) VALUES
('intro_to_hydroponics', 'diy_builder', 'Explore System Types', 'استكشف أنواع الأنظمة', 'See different hydroponic systems you can build', 'انظر أنظمة الزراعة المائية المختلفة التي يمكنك بناؤها', '/diy-builder', '{}', 'construct', 1),
('hydroponic_systems_overview', 'diy_builder', 'Build an NFT System', 'ابني نظام NFT', 'Practice building a Nutrient Film Technique system', 'امارس بناء نظام تقنية الفيلم المغذي', '/diy-builder', '{"systemType": "nft"}', 'water', 1),
('hydroponic_systems_overview', 'nutrient_calculator', 'Calculate Nutrients', 'احسب المغذيات', 'Learn nutrient mixing for your system', 'تعلم خلط المغذيات لنظامك', '/nutrient-calculator', '{}', 'beaker', 2),
('growing_media', 'lighting_calculator', 'Optimize Lighting', 'حسّن الإضاءة', 'Configure lighting for different growing media', 'اضبط الإضاءة لوسائط النمو المختلفة', '/lighting-calculator', '{}', 'sunny', 1);

-- Insert sample achievements
INSERT INTO learning_achievements (id, type, title, title_ar, description, description_ar, icon, criteria, points, rarity) VALUES
('first_lesson', 'completion', 'First Steps', 'الخطوات الأولى', 'Complete your first lesson', 'أكمل درسك الأول', 'school', '{"completedLessons": 1}', 50, 'common'),
('first_module', 'completion', 'Knowledge Seeker', 'باحث المعرفة', 'Complete your first learning module', 'أكمل وحدة التعلم الأولى', 'library', '{"completedModules": 1}', 100, 'common'),
('study_streak_7', 'streak', 'Week Warrior', 'محارب الأسبوع', 'Study for 7 consecutive days', 'ادرس لمدة 7 أيام متتالية', 'flame', '{"streak": 7}', 200, 'rare'),
('quiz_master', 'quiz_master', 'Quiz Master', 'سيد الاختبارات', 'Score 100% on any quiz', 'احصل على 100% في أي اختبار', 'trophy', '{"perfectScore": true}', 150, 'rare'),
('practice_enthusiast', 'practice', 'Practice Enthusiast', 'متحمس الممارسة', 'Use practice links 10 times', 'استخدم روابط الممارسة 10 مرات', 'hammer', '{"practiceUses": 10}', 75, 'common'),
('study_time_3600', 'completion', 'Hour of Power', 'ساعة القوة', 'Study for 1 hour total', 'ادرس لمدة ساعة إجمالية', 'time', '{"totalTime": 3600}', 100, 'common'); 