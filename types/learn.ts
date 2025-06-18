// Educational Learning Center Data Models

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  category: 'fundamentals' | 'water_science' | 'climate_control' | 'pest_disease' | 'maintenance';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number; // minutes
  prerequisites: string[]; // module IDs
  lessons: Lesson[];
  moduleIcon: string;
  color: string;
  isUnlocked: boolean;
  completionReward?: {
    type: 'badge' | 'certificate' | 'unlock';
    title: string;
    description: string;
  };
  // RTL support
  titleAr?: string;
  descriptionAr?: string;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  lessonNumber: number;
  estimatedDuration: number; // minutes
  content: LessonContent;
  quiz?: Quiz;
  practiceLinks: PracticeLink[];
  isUnlocked: boolean;
  isCompleted: boolean;
  // Difficulty and tagging
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  learningObjectives: string[];
  // RTL support
  titleAr?: string;
  descriptionAr?: string;
  learningObjectivesAr?: string[];
}

export interface LessonContent {
  sections: LessonSection[];
  totalDuration: number;
  voiceNarration?: VoiceNarration;
  interactiveElements: InteractiveElement[];
  resources: LessonResource[];
}

export interface LessonSection {
  id: string;
  type: 'introduction' | 'concept' | 'demonstration' | 'example' | 'summary';
  title: string;
  content: string;
  duration: number; // seconds
  mediaElements: MediaElement[];
  keyPoints: string[];
  // Voice and timing
  voiceScript?: string;
  autoAdvance: boolean;
  pausePoints: number[]; // timestamps for automatic pauses
  // RTL support
  titleAr?: string;
  contentAr?: string;
  keyPointsAr?: string[];
  voiceScriptAr?: string;
}

export interface MediaElement {
  id: string;
  type: 'image' | 'diagram' | 'animation' | 'video' | 'interactive_chart';
  url: string;
  caption: string;
  alt: string; // accessibility
  duration?: number; // for videos/animations
  interactionPoints?: InteractionPoint[];
  // RTL support
  captionAr?: string;
  altAr?: string;
}

export interface InteractionPoint {
  x: number; // percentage
  y: number; // percentage
  type: 'hotspot' | 'annotation' | 'quiz_trigger';
  content: string;
  triggerTime?: number; // for videos
  contentAr?: string;
}

export interface VoiceNarration {
  segments: VoiceSegment[];
  totalDuration: number;
  language: 'en' | 'ar';
  speaker: 'careai_male' | 'careai_female';
  speed: number; // playback rate
}

export interface VoiceSegment {
  id: string;
  text: string;
  startTime: number;
  duration: number;
  emphasis?: 'normal' | 'strong' | 'calm';
  pauseAfter?: number; // seconds
}

export interface InteractiveElement {
  id: string;
  type: 'slider' | 'calculator' | 'simulator' | 'drag_drop' | 'matching';
  title: string;
  description: string;
  configuration: Record<string, any>;
  correctAnswers?: any[];
  feedback: {
    correct: string;
    incorrect: string;
    hint: string;
  };
  // RTL support
  titleAr?: string;
  descriptionAr?: string;
  feedbackAr?: {
    correct: string;
    incorrect: string;
    hint: string;
  };
}

export interface LessonResource {
  id: string;
  type: 'pdf' | 'link' | 'calculator' | 'checklist' | 'reference';
  title: string;
  description: string;
  url?: string;
  downloadable: boolean;
  // RTL support
  titleAr?: string;
  descriptionAr?: string;
}

export interface Quiz {
  id: string;
  lessonId: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  passingScore: number; // percentage
  maxAttempts: number;
  timeLimit?: number; // minutes
  shuffleQuestions: boolean;
  showCorrectAnswers: boolean;
  // RTL support
  titleAr?: string;
  descriptionAr?: string;
}

export interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'matching' | 'ordering' | 'calculation';
  question: string;
  options?: QuizOption[];
  correctAnswer: any;
  explanation: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  hints: string[];
  mediaElement?: MediaElement;
  // RTL support
  questionAr?: string;
  explanationAr?: string;
  hintsAr?: string[];
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
  feedback?: string;
  // RTL support
  textAr?: string;
  feedbackAr?: string;
}

export interface PracticeLink {
  id: string;
  type: 'nutrient_calculator' | 'lighting_calculator' | 'diy_builder' | 'external';
  title: string;
  description: string;
  route?: string;
  parameters?: Record<string, any>;
  icon: string;
  // RTL support
  titleAr?: string;
  descriptionAr?: string;
}

export interface UserProgress {
  id: string;
  userId: string;
  moduleId: string;
  lessonId?: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'bookmarked';
  completionPercentage: number;
  timeSpent: number; // seconds
  lastAccessedAt: Date;
  bookmarked: boolean;
  notes: string;
  // Quiz tracking
  quizAttempts: QuizAttempt[];
  bestQuizScore?: number;
  // Learning analytics
  studyStreak: number; // consecutive days
  totalStudyTime: number; // seconds
  weakAreas: string[]; // topic tags where user struggles
  strongAreas: string[]; // topic tags where user excels
  // Offline support
  isOffline: boolean;
  syncStatus: 'synced' | 'pending' | 'failed';
  lastModified: Date;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  maxScore: number;
  percentage: number;
  timeSpent: number; // seconds
  answers: QuizAnswer[];
  completedAt: Date;
  passed: boolean;
}

export interface QuizAnswer {
  questionId: string;
  userAnswer: any;
  isCorrect: boolean;
  timeSpent: number; // seconds
  hintsUsed: number;
  points: number;
}

export interface Bookmark {
  id: string;
  userId: string;
  lessonId: string;
  sectionId?: string;
  title: string;
  description: string;
  timestamp?: number; // for video/audio content
  notes: string;
  tags: string[];
  createdAt: Date;
  // RTL support
  notesAr?: string;
}

export interface LearningGoal {
  id: string;
  userId: string;
  title: string;
  description: string;
  targetDate: Date;
  moduleIds: string[];
  lessonIds: string[];
  progress: number; // percentage
  status: 'active' | 'completed' | 'paused' | 'abandoned';
  reminderFrequency: 'daily' | 'weekly' | 'custom';
  createdAt: Date;
  // RTL support
  titleAr?: string;
  descriptionAr?: string;
}

export interface Achievement {
  id: string;
  type: 'completion' | 'streak' | 'quiz_master' | 'practice' | 'exploration';
  title: string;
  description: string;
  icon: string;
  criteria: Record<string, any>;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
  // RTL support
  titleAr?: string;
  descriptionAr?: string;
}

export interface LearningCenterState {
  modules: LearningModule[];
  currentModule: LearningModule | null;
  currentLesson: Lesson | null;
  userProgress: UserProgress[];
  bookmarks: Bookmark[];
  achievements: Achievement[];
  learningGoals: LearningGoal[];
  isLoading: boolean;
  error: string | null;
  // Voice and playback
  isVoiceEnabled: boolean;
  voiceSpeed: number;
  autoAdvance: boolean;
  // User preferences
  preferredDifficulty: 'beginner' | 'intermediate' | 'advanced';
  studyReminders: boolean;
  dailyGoalMinutes: number;
  // Offline support
  isOffline: boolean;
  downloadedContent: string[]; // lesson IDs
  syncStatus: 'synced' | 'syncing' | 'failed';
  // Learning analytics
  totalStudyTime: number;
  currentStreak: number;
  weeklyGoalProgress: number;
}

// Predefined learning modules
export const LEARNING_MODULES: LearningModule[] = [
  {
    id: 'hydroponics_fundamentals',
    title: 'Hydroponics Fundamentals',
    description: 'Master the core principles of soilless growing systems',
    category: 'fundamentals',
    difficulty: 'beginner',
    estimatedDuration: 120, // 2 hours
    prerequisites: [],
    lessons: [], // Will be populated
    moduleIcon: 'leaf-outline',
    color: '#10B981',
    isUnlocked: true,
    titleAr: 'أساسيات الزراعة المائية',
    descriptionAr: 'أتقن المبادئ الأساسية لأنظمة النمو بدون تربة'
  },
  {
    id: 'water_nutrient_science',
    title: 'Water & Nutrient Science',
    description: 'Deep dive into EC, pH, TDS, and nutrient mixing',
    category: 'water_science',
    difficulty: 'intermediate',
    estimatedDuration: 180, // 3 hours
    prerequisites: ['hydroponics_fundamentals'],
    lessons: [], // Will be populated
    moduleIcon: 'water-outline',
    color: '#3B82F6',
    isUnlocked: false,
    titleAr: 'علم الماء والمغذيات',
    descriptionAr: 'غوص عميق في EC وpH وTDS وخلط المغذيات'
  },
  {
    id: 'climate_lighting_control',
    title: 'Climate & Lighting Control',
    description: 'Environmental optimization for maximum yields',
    category: 'climate_control',
    difficulty: 'intermediate',
    estimatedDuration: 150, // 2.5 hours
    prerequisites: ['hydroponics_fundamentals'],
    lessons: [], // Will be populated
    moduleIcon: 'sunny-outline',
    color: '#F59E0B',
    isUnlocked: false,
    titleAr: 'التحكم في المناخ والإضاءة',
    descriptionAr: 'تحسين البيئة للحصول على أقصى إنتاجية'
  },
  {
    id: 'pest_disease_prevention',
    title: 'Pest & Disease Management',
    description: 'Identify, prevent, and treat common hydroponic issues',
    category: 'pest_disease',
    difficulty: 'advanced',
    estimatedDuration: 200, // 3.3 hours
    prerequisites: ['hydroponics_fundamentals', 'water_nutrient_science'],
    lessons: [], // Will be populated
    moduleIcon: 'bug-outline',
    color: '#EF4444',
    isUnlocked: false,
    titleAr: 'إدارة الآفات والأمراض',
    descriptionAr: 'تحديد ومنع وعلاج مشاكل الزراعة المائية الشائعة'
  },
  {
    id: 'system_maintenance',
    title: 'System Maintenance & Troubleshooting',
    description: 'Keep your systems running at peak performance',
    category: 'maintenance',
    difficulty: 'intermediate',
    estimatedDuration: 160, // 2.7 hours
    prerequisites: ['hydroponics_fundamentals', 'water_nutrient_science'],
    lessons: [], // Will be populated
    moduleIcon: 'build-outline',
    color: '#8B5CF6',
    isUnlocked: false,
    titleAr: 'صيانة النظام واستكشاف الأخطاء',
    descriptionAr: 'حافظ على تشغيل أنظمتك بأقصى أداء'
  }
];

// Sample lesson structure for Hydroponics Fundamentals
export const SAMPLE_LESSONS = {
  hydroponics_fundamentals: [
    {
      id: 'intro_to_hydroponics',
      title: 'Introduction to Hydroponics',
      description: 'What is hydroponics and why choose soilless growing?',
      learningObjectives: [
        'Define hydroponics and its core principles',
        'Compare soil vs soilless growing advantages',
        'Identify the 6 essential elements plants need'
      ],
      practiceLinks: [
        {
          id: 'practice_systems',
          type: 'diy_builder',
          title: 'Explore System Types',
          description: 'See different hydroponic systems you can build'
        }
      ]
    },
    {
      id: 'hydroponic_systems_overview',
      title: 'Types of Hydroponic Systems',
      description: 'NFT, DWC, Dutch Bucket, and more - choosing the right system',
      learningObjectives: [
        'Compare different hydroponic system types',
        'Understand water flow patterns and oxygenation',
        'Match system types to crop requirements'
      ],
      practiceLinks: [
        {
          id: 'practice_nft',
          type: 'diy_builder',
          title: 'Build an NFT System',
          description: 'Practice building a Nutrient Film Technique system',
          parameters: { systemType: 'nft' }
        }
      ]
    },
    {
      id: 'growing_media',
      title: 'Growing Media & Root Support',
      description: 'From rockwool to clay pebbles - choosing the right medium',
      learningObjectives: [
        'Compare different growing media properties',
        'Understand drainage and aeration requirements',
        'Select media based on crop and system type'
      ]
    }
  ]
};

// Common quiz question types for reuse
export const QUIZ_TEMPLATES = {
  multiple_choice: {
    type: 'multiple_choice' as const,
    points: 10,
    showCorrectAnswers: true
  },
  true_false: {
    type: 'true_false' as const,
    points: 5,
    showCorrectAnswers: true
  },
  calculation: {
    type: 'calculation' as const,
    points: 15,
    showCorrectAnswers: true
  }
}; 