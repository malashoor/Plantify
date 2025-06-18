// Nutrient Calculator Data Models

export interface NutrientElement {
  id: string;
  name: string;
  symbol: string;
  description: string;
  unit: 'ppm' | 'g/L' | 'mg/L';
  minValue: number;
  maxValue: number;
  optimalValue: number;
  category: 'macro' | 'micro' | 'secondary';
}

export interface CropStage {
  id: string;
  name: string;
  description: string;
  durationDays: number;
  order: number;
  // RTL support
  nameAr?: string;
  descriptionAr?: string;
}

export interface Crop {
  id: string;
  name: string;
  category: string;
  description: string;
  stages: CropStage[];
  // RTL support
  nameAr?: string;
  categoryAr?: string;
  descriptionAr?: string;
}

export interface NutrientRecipe {
  id: string;
  name: string;
  cropId: string;
  stageId: string;
  description: string;
  nutrients: NutrientElement[];
  ph: {
    min: number;
    max: number;
    optimal: number;
  };
  ec: {
    min: number;
    max: number;
    optimal: number;
  };
  waterVolume: number; // in liters
  isOfficial: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  // RTL support
  nameAr?: string;
  descriptionAr?: string;
}

export interface SavedRecipe {
  id: string;
  recipeId: string;
  userId: string;
  customName?: string;
  notes?: string;
  isFavorite: boolean;
  lastUsed: Date;
  useCount: number;
  // Offline support
  isOffline: boolean;
  syncStatus: 'synced' | 'pending' | 'failed';
}

export interface UnitSystem {
  type: 'metric' | 'imperial';
  volume: 'L' | 'gal' | 'fl oz';
  weight: 'g' | 'kg' | 'oz' | 'lb';
  concentration: 'ppm' | 'g/L' | 'mg/L' | 'oz/gal';
}

export interface NutrientCalculation {
  element: NutrientElement;
  targetPpm: number;
  actualAmount: number;
  unit: string;
  instructions: string;
  // Voice instruction support
  voiceInstructions: string;
  // RTL support
  instructionsAr?: string;
  voiceInstructionsAr?: string;
}

export interface CalculationResult {
  recipe: NutrientRecipe;
  calculations: NutrientCalculation[];
  totalCost?: number;
  waterVolume: number;
  unit: string;
  estimatedTime: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  warnings: string[];
  tips: string[];
  // RTL support
  warningsAr?: string[];
  tipsAr?: string[];
}

export interface VoiceFeedback {
  text: string;
  language: 'en' | 'ar';
  rate: number;
  pitch: number;
  volume: number;
}

export interface NutrientCalculatorState {
  selectedCrop: Crop | null;
  selectedStage: CropStage | null;
  selectedRecipe: NutrientRecipe | null;
  unitSystem: UnitSystem;
  waterVolume: number;
  calculations: CalculationResult | null;
  isLoading: boolean;
  error: string | null;
  // Offline support
  isOffline: boolean;
  savedRecipes: SavedRecipe[];
  // Voice settings
  voiceEnabled: boolean;
  voiceLanguage: 'en' | 'ar';
  voiceRate: number;
}

// Preset nutrient solutions
export const COMMON_NUTRIENTS: NutrientElement[] = [
  // Macronutrients
  {
    id: 'nitrogen',
    name: 'Nitrogen',
    symbol: 'N',
    description: 'Essential for vegetative growth and chlorophyll production',
    unit: 'ppm',
    minValue: 100,
    maxValue: 300,
    optimalValue: 200,
    category: 'macro'
  },
  {
    id: 'phosphorus',
    name: 'Phosphorus',
    symbol: 'P',
    description: 'Important for root development and flowering',
    unit: 'ppm',
    minValue: 30,
    maxValue: 80,
    optimalValue: 50,
    category: 'macro'
  },
  {
    id: 'potassium',
    name: 'Potassium',
    symbol: 'K',
    description: 'Crucial for overall plant health and disease resistance',
    unit: 'ppm',
    minValue: 150,
    maxValue: 350,
    optimalValue: 250,
    category: 'macro'
  },
  // Secondary nutrients
  {
    id: 'calcium',
    name: 'Calcium',
    symbol: 'Ca',
    description: 'Essential for cell wall structure and nutrient uptake',
    unit: 'ppm',
    minValue: 100,
    maxValue: 200,
    optimalValue: 150,
    category: 'secondary'
  },
  {
    id: 'magnesium',
    name: 'Magnesium',
    symbol: 'Mg',
    description: 'Central component of chlorophyll molecule',
    unit: 'ppm',
    minValue: 30,
    maxValue: 70,
    optimalValue: 50,
    category: 'secondary'
  },
  {
    id: 'sulfur',
    name: 'Sulfur',
    symbol: 'S',
    description: 'Important for protein synthesis and oil production',
    unit: 'ppm',
    minValue: 50,
    maxValue: 150,
    optimalValue: 100,
    category: 'secondary'
  },
  // Micronutrients
  {
    id: 'iron',
    name: 'Iron',
    symbol: 'Fe',
    description: 'Essential for chlorophyll synthesis and enzyme function',
    unit: 'ppm',
    minValue: 2,
    maxValue: 6,
    optimalValue: 4,
    category: 'micro'
  },
  {
    id: 'manganese',
    name: 'Manganese',
    symbol: 'Mn',
    description: 'Important for photosynthesis and enzyme activation',
    unit: 'ppm',
    minValue: 0.5,
    maxValue: 2,
    optimalValue: 1,
    category: 'micro'
  },
  {
    id: 'zinc',
    name: 'Zinc',
    symbol: 'Zn',
    description: 'Critical for hormone production and growth regulation',
    unit: 'ppm',
    minValue: 0.3,
    maxValue: 1,
    optimalValue: 0.5,
    category: 'micro'
  },
  {
    id: 'copper',
    name: 'Copper',
    symbol: 'Cu',
    description: 'Essential for enzyme function and chlorophyll synthesis',
    unit: 'ppm',
    minValue: 0.1,
    maxValue: 0.5,
    optimalValue: 0.2,
    category: 'micro'
  },
  {
    id: 'boron',
    name: 'Boron',
    symbol: 'B',
    description: 'Important for cell wall formation and reproduction',
    unit: 'ppm',
    minValue: 0.3,
    maxValue: 1,
    optimalValue: 0.5,
    category: 'micro'
  },
  {
    id: 'molybdenum',
    name: 'Molybdenum',
    symbol: 'Mo',
    description: 'Essential for nitrogen fixation and enzyme function',
    unit: 'ppm',
    minValue: 0.01,
    maxValue: 0.1,
    optimalValue: 0.05,
    category: 'micro'
  }
];

// Common crop stages
export const COMMON_CROP_STAGES: CropStage[] = [
  {
    id: 'seedling',
    name: 'Seedling',
    description: 'First 2-3 weeks after germination',
    durationDays: 21,
    order: 1,
    nameAr: 'شتلة',
    descriptionAr: 'أول 2-3 أسابيع بعد الإنبات'
  },
  {
    id: 'vegetative',
    name: 'Vegetative Growth',
    description: 'Active leaf and stem development',
    durationDays: 42,
    order: 2,
    nameAr: 'النمو الخضري',
    descriptionAr: 'تطوير الأوراق والساق النشط'
  },
  {
    id: 'flowering',
    name: 'Flowering',
    description: 'Flower initiation and development',
    durationDays: 28,
    order: 3,
    nameAr: 'الإزهار',
    descriptionAr: 'بداية وتطوير الأزهار'
  },
  {
    id: 'fruiting',
    name: 'Fruiting',
    description: 'Fruit development and maturation',
    durationDays: 35,
    order: 4,
    nameAr: 'الإثمار',
    descriptionAr: 'تطوير ونضج الثمار'
  }
]; 