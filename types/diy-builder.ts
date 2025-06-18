// DIY System Builder Data Models

export interface SystemType {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // hours
  estimatedCost: {
    min: number;
    max: number;
    currency: string;
  };
  capacity: {
    plants: number;
    systemSize: string; // e.g., "2x4 ft", "60x120 cm"
  };
  advantages: string[];
  disadvantages: string[];
  bestFor: string[]; // crop types
  // RTL support
  nameAr?: string;
  descriptionAr?: string;
  advantagesAr?: string[];
  disadvantagesAr?: string[];
  bestForAr?: string[];
}

export interface BuildStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  estimatedTime: number; // minutes
  tools: Tool[];
  materials: MaterialUsage[];
  images: BuildImage[];
  videoUrl?: string;
  tips: string[];
  warnings: string[];
  checklistItems: ChecklistItem[];
  // RTL support
  titleAr?: string;
  descriptionAr?: string;
  tipsAr?: string[];
  warningsAr?: string[];
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  required: boolean;
  category: 'cutting' | 'drilling' | 'measuring' | 'assembly' | 'electrical' | 'plumbing';
  estimatedCost?: number;
  alternatives?: string[];
  // RTL support
  nameAr?: string;
  descriptionAr?: string;
  alternativesAr?: string[];
}

export interface Material {
  id: string;
  name: string;
  description: string;
  category: 'pipe' | 'container' | 'pump' | 'electrical' | 'growing_medium' | 'hardware' | 'lighting';
  unit: string; // ft, pieces, gallons, etc.
  estimatedCost: number;
  suppliers: Supplier[];
  specifications: Record<string, any>; // technical specs
  alternatives?: string[];
  // RTL support
  nameAr?: string;
  descriptionAr?: string;
  unitAr?: string;
  alternativesAr?: string[];
}

export interface MaterialUsage {
  materialId: string;
  quantity: number;
  notes?: string;
  optional: boolean;
  // For calculated quantities
  calculatedQuantity?: number;
  calculationFormula?: string;
}

export interface Supplier {
  id: string;
  name: string;
  website: string;
  region: string;
  estimatedPrice: number;
  availability: 'in_stock' | 'limited' | 'out_of_stock';
  shippingTime?: string;
}

export interface BuildImage {
  id: string;
  url: string;
  caption: string;
  type: 'step' | 'diagram' | 'result' | 'warning';
  annotations?: ImageAnnotation[];
  // RTL support
  captionAr?: string;
}

export interface ImageAnnotation {
  x: number; // percentage
  y: number; // percentage
  text: string;
  type: 'arrow' | 'circle' | 'rectangle' | 'text';
  textAr?: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  required: boolean;
  textAr?: string;
}

export interface SystemTemplate {
  id: string;
  systemType: SystemType;
  buildSteps: BuildStep[];
  totalEstimatedTime: number;
  totalEstimatedCost: number;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  plantCapacity: number;
  footprint: {
    length: number;
    width: number;
    height: number;
    unit: 'ft' | 'm';
  };
  requirements: {
    space: string;
    power: boolean;
    water: boolean;
    drainage: boolean;
  };
  compatibleCrops: string[]; // crop IDs
  maintenanceSchedule: MaintenanceTask[];
}

export interface MaintenanceTask {
  id: string;
  name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'seasonal';
  estimatedTime: number; // minutes
  difficulty: 'easy' | 'medium' | 'hard';
  tools: string[]; // tool IDs
  nameAr?: string;
  descriptionAr?: string;
}

export interface UserBuild {
  id: string;
  userId: string;
  templateId: string;
  name: string;
  status: 'planning' | 'in_progress' | 'completed' | 'paused';
  startDate: Date;
  targetCompletionDate?: Date;
  actualCompletionDate?: Date;
  currentStepId?: string;
  completedSteps: string[];
  modifications: BuildModification[];
  notes: string;
  images: UserBuildImage[];
  estimatedCost: number;
  actualCost?: number;
  // Integration with other modules
  linkedNutrientRecipe?: string;
  linkedLightingSetup?: string;
  linkedSensors?: string[];
  // Offline support
  isOffline: boolean;
  syncStatus: 'synced' | 'pending' | 'failed';
  lastModified: Date;
  // RTL support
  nameAr?: string;
  notesAr?: string;
}

export interface BuildModification {
  id: string;
  stepId: string;
  type: 'material_substitution' | 'quantity_change' | 'step_skip' | 'custom_step';
  description: string;
  originalValue?: any;
  newValue: any;
  reason: string;
  timestamp: Date;
  descriptionAr?: string;
  reasonAr?: string;
}

export interface UserBuildImage {
  id: string;
  stepId?: string;
  imageUri: string;
  caption: string;
  timestamp: Date;
  type: 'progress' | 'completion' | 'problem' | 'modification';
  captionAr?: string;
}

export interface MaterialsList {
  id: string;
  buildId: string;
  materials: MaterialsListItem[];
  totalCost: number;
  currency: string;
  generatedDate: Date;
  exportFormat: 'pdf' | 'csv' | 'json';
  includeSuppliers: boolean;
  includeAlternatives: boolean;
}

export interface MaterialsListItem {
  material: Material;
  quantity: number;
  estimatedCost: number;
  priority: 'essential' | 'recommended' | 'optional';
  category: string;
  notes?: string;
  suppliers: Supplier[];
}

export interface CalculationInput {
  systemLength: number;
  systemWidth: number;
  systemHeight: number;
  plantCount: number;
  plantSpacing: number;
  waterVolume?: number;
  customParameters?: Record<string, number>;
}

export interface CalculationResult {
  materials: MaterialCalculation[];
  totalCost: number;
  warnings: string[];
  recommendations: string[];
}

export interface MaterialCalculation {
  materialId: string;
  calculatedQuantity: number;
  formula: string;
  explanation: string;
  adjustments?: string[];
  explanationAr?: string;
  adjustmentsAr?: string[];
}

export interface PumpCalculation {
  flowRate: number; // GPH or LPH
  headHeight: number; // feet or meters
  recommendedPumps: PumpRecommendation[];
  powerConsumption: number; // watts
}

export interface PumpRecommendation {
  model: string;
  brand: string;
  flowRate: number;
  maxHead: number;
  powerConsumption: number;
  estimatedCost: number;
  features: string[];
  suitable: boolean;
  reason?: string;
}

export interface DIYBuilderState {
  selectedSystemType: SystemType | null;
  selectedTemplate: SystemTemplate | null;
  currentBuild: UserBuild | null;
  calculationInputs: CalculationInput | null;
  calculationResults: CalculationResult | null;
  materialsList: MaterialsList | null;
  currentStep: BuildStep | null;
  isLoading: boolean;
  error: string | null;
  // User settings
  units: {
    length: 'ft' | 'm' | 'cm';
    volume: 'gal' | 'L';
    weight: 'lb' | 'kg';
    currency: string;
  };
  // Offline support
  isOffline: boolean;
  savedBuilds: UserBuild[];
  // Progress tracking
  totalProgress: number; // percentage
  stepProgress: Record<string, number>; // step ID -> percentage
}

// Preset system templates
export const SYSTEM_TYPES: SystemType[] = [
  {
    id: 'nft',
    name: 'NFT (Nutrient Film Technique)',
    description: 'Continuous flow system where nutrient solution flows through channels',
    difficulty: 'intermediate',
    estimatedTime: 8,
    estimatedCost: { min: 150, max: 300, currency: 'USD' },
    capacity: { plants: 24, systemSize: '4x2 ft' },
    advantages: [
      'Water efficient',
      'Good oxygenation',
      'Easy harvest',
      'Scalable design'
    ],
    disadvantages: [
      'Power dependent',
      'Pump failure risk',
      'Root clogging possible'
    ],
    bestFor: ['lettuce', 'herbs', 'spinach', 'kale'],
    nameAr: 'تقنية الغشاء المغذي',
    descriptionAr: 'نظام التدفق المستمر حيث يتدفق المحلول المغذي عبر القنوات'
  },
  {
    id: 'dwc',
    name: 'Deep Water Culture (DWC)',
    description: 'Roots suspended in oxygenated nutrient solution',
    difficulty: 'beginner',
    estimatedTime: 4,
    estimatedCost: { min: 80, max: 150, currency: 'USD' },
    capacity: { plants: 6, systemSize: '2x2 ft' },
    advantages: [
      'Simple setup',
      'Fast growth',
      'Low maintenance',
      'Beginner friendly'
    ],
    disadvantages: [
      'Temperature sensitive',
      'Algae growth risk',
      'Limited mobility'
    ],
    bestFor: ['lettuce', 'basil', 'mint', 'cilantro'],
    nameAr: 'الزراعة المائية العميقة',
    descriptionAr: 'الجذور معلقة في محلول مغذي مؤكسج'
  },
  {
    id: 'dutch_bucket',
    name: 'Dutch Bucket System',
    description: 'Individual containers with drain-to-waste or recirculating system',
    difficulty: 'intermediate',
    estimatedTime: 6,
    estimatedCost: { min: 200, max: 400, currency: 'USD' },
    capacity: { plants: 8, systemSize: '8x2 ft' },
    advantages: [
      'Individual plant control',
      'Suitable for large plants',
      'Modular design',
      'Easy expansion'
    ],
    disadvantages: [
      'More complex plumbing',
      'Higher water usage',
      'Multiple containers to maintain'
    ],
    bestFor: ['tomatoes', 'peppers', 'cucumbers', 'eggplant'],
    nameAr: 'نظام الدلو الهولندي',
    descriptionAr: 'حاويات فردية مع نظام التصريف أو إعادة التدوير'
  },
  {
    id: 'kratky',
    name: 'Kratky Method',
    description: 'Passive hydroponic system with no pumps or electricity',
    difficulty: 'beginner',
    estimatedTime: 2,
    estimatedCost: { min: 30, max: 80, currency: 'USD' },
    capacity: { plants: 4, systemSize: '1x1 ft' },
    advantages: [
      'No electricity needed',
      'Very simple',
      'Low cost',
      'Silent operation'
    ],
    disadvantages: [
      'Limited plant types',
      'No circulation',
      'Slower growth',
      'Manual monitoring'
    ],
    bestFor: ['lettuce', 'herbs', 'leafy greens'],
    nameAr: 'طريقة كراتكي',
    descriptionAr: 'نظام الزراعة المائية السلبي بدون مضخات أو كهرباء'
  },
  {
    id: 'vertical_tower',
    name: 'Vertical Tower Garden',
    description: 'Space-efficient vertical growing system',
    difficulty: 'advanced',
    estimatedTime: 12,
    estimatedCost: { min: 300, max: 600, currency: 'USD' },
    capacity: { plants: 36, systemSize: '2x2x6 ft' },
    advantages: [
      'Space efficient',
      'High plant density',
      'Visual appeal',
      'Good for small spaces'
    ],
    disadvantages: [
      'Complex construction',
      'Uneven light distribution',
      'Top-heavy design',
      'Drainage challenges'
    ],
    bestFor: ['strawberries', 'herbs', 'lettuce', 'spinach'],
    nameAr: 'برج الحديقة العمودي',
    descriptionAr: 'نظام نمو عمودي موفر للمساحة'
  }
];

// Common tools for hydroponic builds
export const COMMON_TOOLS: Tool[] = [
  {
    id: 'drill',
    name: 'Power Drill',
    description: 'For drilling holes in pipes and containers',
    required: true,
    category: 'drilling',
    estimatedCost: 50,
    alternatives: ['Hand drill', 'Hole saw kit'],
    nameAr: 'مثقاب كهربائي',
    descriptionAr: 'لحفر الثقوب في الأنابيب والحاويات'
  },
  {
    id: 'hole_saw',
    name: 'Hole Saw Set',
    description: 'Various sizes for net pot holes',
    required: true,
    category: 'cutting',
    estimatedCost: 25,
    nameAr: 'مجموعة منشار الثقوب',
    descriptionAr: 'أحجام مختلفة لثقوب الأواني الشبكية'
  },
  {
    id: 'measuring_tape',
    name: 'Measuring Tape',
    description: 'For accurate measurements',
    required: true,
    category: 'measuring',
    estimatedCost: 15,
    nameAr: 'شريط القياس',
    descriptionAr: 'للقياسات الدقيقة'
  },
  {
    id: 'level',
    name: 'Spirit Level',
    description: 'Ensure system is level for proper flow',
    required: true,
    category: 'measuring',
    estimatedCost: 20,
    nameAr: 'ميزان الماء',
    descriptionAr: 'لضمان أن النظام مستوٍ للتدفق السليم'
  },
  {
    id: 'pipe_cutter',
    name: 'PVC Pipe Cutter',
    description: 'Clean cuts on PVC pipes',
    required: false,
    category: 'cutting',
    estimatedCost: 15,
    alternatives: ['Hacksaw', 'Miter saw'],
    nameAr: 'قاطع أنابيب PVC',
    descriptionAr: 'قطع نظيف لأنابيب PVC'
  }
];

// Common materials with specifications
export const COMMON_MATERIALS: Material[] = [
  {
    id: 'pvc_pipe_4in',
    name: '4" PVC Pipe',
    description: 'Main growing channels for NFT systems',
    category: 'pipe',
    unit: 'ft',
    estimatedCost: 3.50,
    specifications: {
      diameter: '4 inches',
      material: 'PVC',
      pressure_rating: '200 PSI',
      length_per_piece: '10 ft'
    },
    suppliers: [
      {
        id: 'home_depot',
        name: 'Home Depot',
        website: 'homedepot.com',
        region: 'US',
        estimatedPrice: 3.50,
        availability: 'in_stock'
      }
    ],
    nameAr: 'أنبوب PVC 4 بوصة',
    descriptionAr: 'قنوات النمو الرئيسية لأنظمة NFT'
  },
  {
    id: 'net_pots_3in',
    name: '3" Net Pots',
    description: 'Hold plants and growing medium',
    category: 'container',
    unit: 'pieces',
    estimatedCost: 0.75,
    specifications: {
      diameter: '3 inches',
      height: '2.5 inches',
      material: 'Plastic',
      drainage: 'Slotted bottom'
    },
    suppliers: [
      {
        id: 'amazon',
        name: 'Amazon',
        website: 'amazon.com',
        region: 'Global',
        estimatedPrice: 0.75,
        availability: 'in_stock'
      }
    ],
    nameAr: 'أواني شبكية 3 بوصة',
    descriptionAr: 'تحمل النباتات ووسط النمو'
  },
  {
    id: 'water_pump_400gph',
    name: '400 GPH Water Pump',
    description: 'Circulates nutrient solution',
    category: 'pump',
    unit: 'pieces',
    estimatedCost: 35,
    specifications: {
      flow_rate: '400 GPH',
      max_head: '8 ft',
      power: '25 watts',
      inlet_size: '0.75 inch',
      outlet_size: '0.75 inch'
    },
    suppliers: [
      {
        id: 'vivosun',
        name: 'VIVOSUN',
        website: 'vivosun.com',
        region: 'US',
        estimatedPrice: 35,
        availability: 'in_stock'
      }
    ],
    nameAr: 'مضخة مياه 400 جالون/ساعة',
    descriptionAr: 'تدوير المحلول المغذي'
  }
];

// Calculation formulas for different systems
export const CALCULATION_FORMULAS = {
  nft: {
    pipeLength: 'systemLength',
    netPotCount: 'Math.ceil(systemLength / plantSpacing)',
    pumpSize: 'Math.max(200, netPotCount * 15)', // GPH
    reservoirSize: 'netPotCount * 0.5' // gallons
  },
  dwc: {
    containerSize: 'plantCount * 2', // gallons per plant
    airStoneCount: 'Math.ceil(containerSize / 5)',
    pumpSize: 'containerSize * 2', // GPH for circulation
    netPotCount: 'plantCount'
  },
  dutch_bucket: {
    bucketCount: 'plantCount',
    pipeLength: 'plantCount * 2', // 2 ft spacing
    pumpSize: 'plantCount * 10', // GPH
    reservoirSize: 'plantCount * 1' // gallons
  }
}; 