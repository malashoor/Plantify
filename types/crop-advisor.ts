// Smart Crop AI Advisor Data Models
// Advanced AI-driven plant monitoring and autonomous optimization

export interface SensorSnapshot {
  id: string;
  userId: string;
  cropId: string;
  timestamp: Date;
  // Environmental sensors
  temperature: number; // Celsius
  humidity: number; // percentage
  co2: number; // ppm
  airflow: number; // m/s
  // Lighting metrics
  ppfd: number; // μmol/m²/s
  dli: number; // mol/m²/d
  photoperiod: number; // hours
  lightSpectrum: SpectrumReading;
  // Water and nutrients
  ph: number;
  ec: number; // mS/cm
  tds: number; // ppm
  waterTemp: number; // Celsius
  oxygenLevel: number; // mg/L
  // Plant metrics
  plantHeight: number; // cm
  leafCount: number;
  leafColor: PlantColor;
  rootHealth: RootHealthStatus;
  // Growth stage
  growthStage: GrowthStage;
  daysFromSeed: number;
  // Data quality
  dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
  sensorStatus: SensorStatus;
}

export interface SpectrumReading {
  red: number; // 620-750nm percentage
  blue: number; // 400-500nm percentage
  green: number; // 500-600nm percentage
  farRed: number; // 700-800nm percentage
  uv: number; // 280-400nm percentage
  white: number; // full spectrum percentage
}

export interface SensorStatus {
  temperatureActive: boolean;
  humidityActive: boolean;
  lightActive: boolean;
  phActive: boolean;
  ecActive: boolean;
  lastCalibration: Date;
  batteryLevel?: number; // percentage
}

export type PlantColor = 'vibrant_green' | 'light_green' | 'dark_green' | 'yellow' | 'purple' | 'brown' | 'pale';
export type RootHealthStatus = 'excellent' | 'good' | 'fair' | 'concerning' | 'poor';
export type GrowthStage = 'seedling' | 'vegetative' | 'flowering' | 'fruiting' | 'harvesting';

export interface GrowthTrend {
  id: string;
  cropId: string;
  parameter: TrendParameter;
  direction: 'improving' | 'stable' | 'declining' | 'fluctuating';
  rate: number; // change per day
  confidence: ConfidenceLevel;
  timeframe: number; // days analyzed
  significance: 'critical' | 'important' | 'moderate' | 'minor';
  startValue: number;
  currentValue: number;
  predictedValue?: number; // 7-day forecast
  lastAnalyzed: Date;
}

export type TrendParameter = 
  | 'growth_rate' | 'leaf_development' | 'plant_health' | 'yield_potential'
  | 'nutrient_uptake' | 'light_response' | 'temperature_tolerance' 
  | 'ph_stability' | 'ec_consistency' | 'root_development'
  | 'disease_resistance' | 'stress_recovery' | 'photosynthesis_efficiency';

export type ConfidenceLevel = 'very_high' | 'high' | 'medium' | 'low' | 'very_low';

export interface StressIndicator {
  id: string;
  type: StressType;
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  confidence: ConfidenceLevel;
  symptoms: string[];
  likelyCauses: string[];
  detectedAt: Date;
  isActive: boolean;
  affectedParameters: TrendParameter[];
  timeToAction: 'immediate' | 'within_hours' | 'within_day' | 'monitor';
}

export type StressType = 
  | 'light_stress' | 'heat_stress' | 'cold_stress' | 'drought_stress' | 'overwatering'
  | 'nutrient_deficiency' | 'nutrient_toxicity' | 'ph_lockout' | 'ec_imbalance'
  | 'disease_early' | 'pest_presence' | 'root_rot' | 'algae_growth'
  | 'co2_deficiency' | 'poor_airflow' | 'light_burn' | 'photoperiod_stress';

export interface Recommendation {
  id: string;
  type: RecommendationType;
  priority: 'critical' | 'high' | 'medium' | 'low';
  confidence: ConfidenceLevel;
  title: string;
  description: string;
  reasoning: string;
  
  // Specific adjustments
  adjustments: RecommendationAdjustment[];
  
  // Integration with existing modules
  moduleIntegration: ModuleIntegration[];
  
  // Expected outcomes
  expectedResults: string[];
  timeframe: string; // "within 24 hours", "2-3 days", etc.
  successMetrics: string[];
  
  // AI personality
  tone: AITone;
  voiceScript: string;
  voiceScriptAr?: string;
  
  // User interaction
  userApprovalRequired: boolean;
  automationPossible: boolean;
  alternativeOptions: string[];
  
  // Tracking
  createdAt: Date;
  appliedAt?: Date;
  userResponse?: 'accepted' | 'modified' | 'rejected' | 'ignored';
  effectivenessScore?: number; // 0-100
}

export type RecommendationType = 
  | 'lighting_adjustment' | 'nutrient_adjustment' | 'environmental_control'
  | 'water_management' | 'schedule_optimization' | 'preventive_action'
  | 'emergency_intervention' | 'harvest_timing' | 'maintenance_reminder';

export interface RecommendationAdjustment {
  parameter: string;
  currentValue: number | string;
  recommendedValue: number | string;
  unit: string;
  changeType: 'increase' | 'decrease' | 'maintain' | 'schedule' | 'replace';
  urgency: 'immediate' | 'gradual' | 'scheduled';
}

export interface ModuleIntegration {
  moduleType: 'nutrient_calculator' | 'lighting_calculator' | 'diy_builder' | 'learning_center';
  action: 'open' | 'auto_adjust' | 'create_recipe' | 'log_data' | 'suggest_lesson';
  parameters: Record<string, any>;
  autoExecute: boolean;
}

export type AITone = 'encouraging' | 'urgent' | 'informative' | 'celebratory' | 'concerned' | 'professional';

export interface PlantProfile {
  id: string;
  userId: string;
  name: string;
  cropType: string;
  variety: string;
  plantedDate: Date;
  expectedHarvestDate: Date;
  currentStage: GrowthStage;
  
  // Optimal ranges (learned from successful grows)
  optimalRanges: OptimalRanges;
  
  // Growth characteristics
  characteristics: PlantCharacteristics;
  
  // Historical performance
  growthHistory: GrowthTrend[];
  stressHistory: StressIndicator[];
  harvestHistory: HarvestRecord[];
  
  // AI learning
  aiPersonality: AIPersonality;
  userPreferences: UserPreferences;
  
  // Current status
  health: PlantHealthStatus;
  lastAssessment: Date;
  nextAssessment: Date;
  
  // Integration data
  linkedNutrientRecipes: string[]; // recipe IDs
  linkedLightingSetups: string[]; // setup IDs
  linkedBuildJournal?: string; // build ID
}

export interface OptimalRanges {
  temperature: { min: number; max: number; optimal: number };
  humidity: { min: number; max: number; optimal: number };
  ph: { min: number; max: number; optimal: number };
  ec: { min: number; max: number; optimal: number };
  ppfd: { min: number; max: number; optimal: number };
  dli: { min: number; max: number; optimal: number };
  photoperiod: { min: number; max: number; optimal: number };
  co2: { min: number; max: number; optimal: number };
}

export interface PlantCharacteristics {
  lightSensitivity: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  nutrientHunger: 'light_feeder' | 'moderate_feeder' | 'heavy_feeder';
  temperatureTolerance: 'cold_sensitive' | 'moderate' | 'heat_tolerant';
  phTolerance: 'narrow' | 'moderate' | 'wide';
  growthRate: 'slow' | 'moderate' | 'fast' | 'very_fast';
  yieldPotential: 'low' | 'medium' | 'high' | 'very_high';
  diseaseSusceptibility: DiseaseSusceptibility[];
}

export interface DiseaseSusceptibility {
  disease: string;
  risk: 'low' | 'medium' | 'high';
  symptoms: string[];
  prevention: string[];
}

export interface HarvestRecord {
  date: Date;
  weight: number; // grams
  quality: 'poor' | 'fair' | 'good' | 'excellent';
  notes: string;
  photos?: string[];
  totalGrowDays: number;
  finalMetrics: SensorSnapshot;
}

export interface AIPersonality {
  communicationStyle: 'casual' | 'professional' | 'encouraging' | 'technical';
  proactiveness: 'reactive' | 'balanced' | 'proactive' | 'very_proactive';
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  learningAggressiveness: 'slow' | 'moderate' | 'fast' | 'adaptive';
  voicePersonality: 'caring' | 'enthusiastic' | 'calm' | 'authoritative';
}

export interface UserPreferences {
  automationLevel: 'manual' | 'assisted' | 'semi_auto' | 'full_auto';
  notificationFrequency: 'minimal' | 'important' | 'regular' | 'detailed';
  riskAppetite: 'safe' | 'moderate' | 'experimental';
  learningOriented: boolean;
  voiceEnabled: boolean;
  hapticFeedback: boolean;
  preferredUnits: 'metric' | 'imperial';
  language: 'en' | 'ar';
}

export interface PlantHealthStatus {
  overall: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  components: {
    growth: number; // 0-100
    nutrition: number; // 0-100
    environment: number; // 0-100
    lighting: number; // 0-100
    water: number; // 0-100
    roots: number; // 0-100
  };
  activeStressors: StressIndicator[];
  riskFactors: string[];
  strengths: string[];
  improvementAreas: string[];
}

export interface ConversationalRequest {
  id: string;
  userId: string;
  cropId: string;
  question: string;
  questionType: 'diagnosis' | 'optimization' | 'prediction' | 'learning' | 'general';
  context: ConversationContext;
  timestamp: Date;
  language: 'en' | 'ar';
}

export interface ConversationContext {
  recentChanges: string[]; // "increased PPFD yesterday", "changed nutrients"
  currentConcerns: string[]; // "yellowing leaves", "slow growth"
  userExperience: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  preferredDetail: 'simple' | 'detailed' | 'technical';
  timeAvailable: 'quick' | 'normal' | 'thorough';
}

export interface ConversationalResponse {
  id: string;
  requestId: string;
  answer: string;
  answerAr?: string;
  confidence: ConfidenceLevel;
  tone: AITone;
  
  // Supporting information
  reasoning: string;
  dataPoints: string[]; // "pH has been declining", "PPFD is optimal"
  recommendations: Recommendation[];
  
  // Interactive elements
  followUpQuestions: string[];
  actionButtons: ConversationAction[];
  visualAids: VisualAid[];
  
  // Voice response
  voiceScript: string;
  voiceScriptAr?: string;
  voiceEmotion: 'neutral' | 'concerned' | 'excited' | 'reassuring' | 'urgent';
  
  // Learning integration
  relatedLessons: string[]; // lesson IDs
  practiceActivities: string[];
  
  timestamp: Date;
}

export interface ConversationAction {
  id: string;
  label: string;
  labelAr?: string;
  type: 'open_module' | 'apply_recommendation' | 'schedule_reminder' | 'learn_more' | 'take_photo';
  route?: string;
  parameters?: Record<string, any>;
  icon: string;
  priority: number;
}

export interface VisualAid {
  type: 'chart' | 'diagram' | 'photo_comparison' | 'trend_graph' | 'gauge';
  title: string;
  data: any;
  description: string;
  interactive: boolean;
}

export interface AIAnalysisResult {
  plantHealth: PlantHealthStatus;
  trends: GrowthTrend[];
  stressIndicators: StressIndicator[];
  recommendations: Recommendation[];
  predictions: Prediction[];
  confidence: ConfidenceLevel;
  analysisDate: Date;
  dataQuality: 'excellent' | 'good' | 'fair' | 'insufficient';
  nextAnalysisDate: Date;
}

export interface Prediction {
  type: 'harvest_date' | 'yield_estimate' | 'problem_likelihood' | 'growth_milestone';
  prediction: string;
  confidence: ConfidenceLevel;
  timeframe: string;
  factors: string[];
  accuracy?: number; // Historical accuracy percentage
}

export interface CropAdvisorState {
  // Current analysis
  currentAnalysis: AIAnalysisResult | null;
  activeRecommendations: Recommendation[];
  plantProfiles: PlantProfile[];
  selectedPlantId: string | null;
  
  // Conversation
  conversationHistory: ConversationalResponse[];
  isThinking: boolean;
  
  // Real-time monitoring
  latestSensorData: SensorSnapshot | null;
  monitoringActive: boolean;
  alertsEnabled: boolean;
  
  // AI learning
  userFeedback: UserFeedback[];
  modelAccuracy: number;
  improvementSuggestions: string[];
  
  // Integration status
  moduleConnections: ModuleConnection[];
  automationQueue: AutomationTask[];
  
  // Settings
  aiPersonality: AIPersonality;
  userPreferences: UserPreferences;
  
  // State management
  isLoading: boolean;
  error: string | null;
  lastUpdate: Date;
  syncStatus: 'synced' | 'pending' | 'failed';
}

export interface UserFeedback {
  id: string;
  recommendationId: string;
  rating: number; // 1-5
  outcome: 'successful' | 'partially_successful' | 'unsuccessful' | 'too_early';
  comments: string;
  timestamp: Date;
  followUp?: string;
}

export interface ModuleConnection {
  moduleType: 'nutrient_calculator' | 'lighting_calculator' | 'diy_builder' | 'learning_center';
  isConnected: boolean;
  lastSync: Date;
  dataExchanged: string[];
}

export interface AutomationTask {
  id: string;
  type: 'apply_recommendation' | 'schedule_action' | 'send_notification' | 'log_data';
  status: 'pending' | 'executing' | 'completed' | 'failed' | 'cancelled';
  scheduledFor: Date;
  parameters: Record<string, any>;
  retryCount: number;
  maxRetries: number;
}

// Predefined AI responses for common scenarios
export const AI_RESPONSES = {
  PLANT_HEALTHY: {
    en: "Your plants are looking fantastic! All parameters are in optimal ranges.",
    ar: "نباتاتك تبدو رائعة! جميع المعايير في النطاقات المثلى.",
    tone: 'celebratory' as AITone
  },
  MINOR_ADJUSTMENT: {
    en: "I notice a small optimization opportunity. Would you like me to help?",
    ar: "ألاحظ فرصة تحسين صغيرة. هل تريد مني المساعدة؟",
    tone: 'encouraging' as AITone
  },
  URGENT_ACTION: {
    en: "Attention needed! I've detected a potential issue that requires immediate action.",
    ar: "انتباه مطلوب! لقد اكتشفت مشكلة محتملة تتطلب إجراءً فورياً.",
    tone: 'urgent' as AITone
  },
  LEARNING_MOMENT: {
    en: "This is a great learning opportunity! Let me explain what's happening.",
    ar: "هذه فرصة تعلم رائعة! دعني أشرح لك ما يحدث.",
    tone: 'informative' as AITone
  }
};

// Common stress detection patterns
export const STRESS_PATTERNS = {
  LIGHT_STRESS: {
    symptoms: ['leaf_curling', 'bleaching', 'stunted_growth'],
    indicators: ['ppfd_too_high', 'dli_excessive', 'heat_buildup'],
    solutions: ['reduce_intensity', 'increase_distance', 'adjust_schedule']
  },
  NUTRIENT_LOCKOUT: {
    symptoms: ['yellowing', 'brown_spots', 'slow_uptake'],
    indicators: ['ph_out_range', 'ec_too_high', 'imbalanced_ratios'],
    solutions: ['flush_system', 'adjust_ph', 'reduce_concentration']
  },
  HEAT_STRESS: {
    symptoms: ['wilting', 'leaf_edges_brown', 'rapid_transpiration'],
    indicators: ['temperature_high', 'poor_airflow', 'excessive_light'],
    solutions: ['increase_ventilation', 'reduce_temperature', 'adjust_lighting']
  }
}; 