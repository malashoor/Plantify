// Lighting Configuration Calculator Data Models

export interface SpectrumRatio {
  blue: number;      // 400-500nm percentage (0-100)
  red: number;       // 600-700nm percentage (0-100)
  white: number;     // Full spectrum percentage (0-100)
  farRed?: number;   // 700-800nm percentage (0-100)
  uv?: number;       // 280-400nm percentage (0-100)
  green?: number;    // 500-600nm percentage (0-100)
}

export interface PhotoperiodSchedule {
  id: string;
  name: string;
  lightHours: number;        // Hours of light per day
  darkHours: number;         // Hours of darkness per day
  sunriseTime: string;       // HH:mm format
  sunsetTime: string;        // HH:mm format
  transitionDuration: number; // Minutes for sunrise/sunset simulation
  isActive: boolean;
  // RTL support
  nameAr?: string;
}

export interface LEDSpecification {
  id: string;
  brand: string;
  model: string;
  wattage: number;           // Actual power consumption
  ppfdAt12Inches: number;    // PPFD at 12 inches distance
  efficiency: number;        // μmol/J (micromoles per joule)
  spectrum: SpectrumRatio;
  coverage: {
    footprint: string;       // e.g., "2x2 ft", "60x60 cm"
    recommendedHeight: number; // inches/cm
  };
  price?: number;
  // RTL support
  brandAr?: string;
  modelAr?: string;
}

export interface LightingProfile {
  id: string;
  name: string;
  cropId: string;
  stageId: string;
  spectrum: SpectrumRatio;
  photoperiod: PhotoperiodSchedule;
  dli: {
    min: number;             // mol/m²/day
    optimal: number;         // mol/m²/day
    max: number;             // mol/m²/day
  };
  ppfd: {
    min: number;             // μmol/m²/s
    optimal: number;         // μmol/m²/s
    max: number;             // μmol/m²/s
  };
  recommendations: LightingRecommendation[];
  isOfficial: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  // RTL support
  nameAr?: string;
}

export interface LightingRecommendation {
  id: string;
  type: 'distance' | 'spectrum' | 'schedule' | 'intensity';
  title: string;
  description: string;
  value?: number;
  unit?: string;
  priority: 'low' | 'medium' | 'high';
  // Voice instruction support
  voiceInstructions: string;
  // RTL support
  titleAr?: string;
  descriptionAr?: string;
  voiceInstructionsAr?: string;
}

export interface LightingCalculation {
  ledSpec: LEDSpecification;
  distance: number;          // inches or cm
  ppfd: number;             // calculated PPFD
  dli: number;              // calculated DLI
  coverage: number;         // sq ft or sq m
  powerConsumption: number; // watts
  dailyCost: number;        // based on electricity rate
  monthlyCost: number;
  recommendations: LightingRecommendation[];
}

export interface LightingSetup {
  id: string;
  name: string;
  userId: string;
  cropId: string;
  stageId: string;
  ledConfigs: LEDConfiguration[];
  photoperiod: PhotoperiodSchedule;
  totalPowerConsumption: number;
  totalCoverage: number;
  averagePPFD: number;
  averageDLI: number;
  estimatedMonthlyCost: number;
  isActive: boolean;
  notes?: string;
  // Offline support
  isOffline: boolean;
  syncStatus: 'synced' | 'pending' | 'failed';
  lastUsed: Date;
  createdAt: Date;
  updatedAt: Date;
  // RTL support
  nameAr?: string;
  notesAr?: string;
}

export interface LEDConfiguration {
  id: string;
  ledSpec: LEDSpecification;
  quantity: number;
  distance: number;          // from canopy
  dimming: number;          // percentage (0-100)
  position: {
    x: number;              // grid position
    y: number;              // grid position
  };
}

export interface LightingTimer {
  id: string;
  setupId: string;
  photoperiod: PhotoperiodSchedule;
  isEnabled: boolean;
  nextStateChange: Date;    // next on/off time
  currentState: 'on' | 'off' | 'transitioning';
  notifications: {
    enabled: boolean;
    beforeMinutes: number;  // notify X minutes before change
  };
}

export interface AmbientLightReading {
  id: string;
  timestamp: Date;
  lux: number;
  location: string;
  sensorId?: string;
}

export interface LightingCalculatorState {
  selectedCrop: any | null;          // From nutrient calculator
  selectedStage: any | null;         // From nutrient calculator
  selectedProfile: LightingProfile | null;
  selectedLED: LEDSpecification | null;
  distance: number;                  // current distance setting
  photoperiod: PhotoperiodSchedule | null;
  calculations: LightingCalculation | null;
  setup: LightingSetup | null;
  isLoading: boolean;
  error: string | null;
  // Units
  units: {
    distance: 'inches' | 'cm';
    area: 'sqft' | 'sqm';
    temperature: 'F' | 'C';
  };
  // Offline support
  isOffline: boolean;
  savedSetups: LightingSetup[];
  // Voice settings
  voiceEnabled: boolean;
  voiceLanguage: 'en' | 'ar';
  voiceRate: number;
  // Timer integration
  timers: LightingTimer[];
  // Sensor integration
  ambientLight: AmbientLightReading | null;
  autoAdjust: boolean;
}

export interface PowerCost {
  kwhRate: number;          // cost per kWh
  currency: string;         // USD, EUR, etc.
  peakHours?: {
    start: string;          // HH:mm
    end: string;            // HH:mm
    rate: number;           // different rate during peak
  };
}

export interface GrowthPhaseTransition {
  fromStageId: string;
  toStageId: string;
  lightingChanges: {
    spectrum?: Partial<SpectrumRatio>;
    photoperiod?: Partial<PhotoperiodSchedule>;
    intensity?: number;     // percentage change
  };
  transitionDays: number;   // gradual change over X days
  notifications: boolean;
}

// Preset lighting profiles for common crops and stages
export const COMMON_PHOTOPERIODS: PhotoperiodSchedule[] = [
  {
    id: 'vegetative_18_6',
    name: '18/6 Vegetative',
    lightHours: 18,
    darkHours: 6,
    sunriseTime: '06:00',
    sunsetTime: '00:00',
    transitionDuration: 30,
    isActive: false,
    nameAr: '18/6 خضري'
  },
  {
    id: 'flowering_12_12',
    name: '12/12 Flowering',
    lightHours: 12,
    darkHours: 12,
    sunriseTime: '06:00',
    sunsetTime: '18:00',
    transitionDuration: 30,
    isActive: false,
    nameAr: '12/12 إزهار'
  },
  {
    id: 'seedling_16_8',
    name: '16/8 Seedling',
    lightHours: 16,
    darkHours: 8,
    sunriseTime: '07:00',
    sunsetTime: '23:00',
    transitionDuration: 15,
    isActive: false,
    nameAr: '16/8 شتلة'
  },
  {
    id: 'continuous_24_0',
    name: '24/0 Continuous',
    lightHours: 24,
    darkHours: 0,
    sunriseTime: '00:00',
    sunsetTime: '23:59',
    transitionDuration: 0,
    isActive: false,
    nameAr: '24/0 مستمر'
  }
];

export const COMMON_SPECTRUM_RATIOS: { [key: string]: SpectrumRatio } = {
  seedling: {
    blue: 30,
    red: 20,
    white: 45,
    farRed: 5,
    uv: 0,
    green: 0
  },
  vegetative: {
    blue: 25,
    red: 25,
    white: 40,
    farRed: 5,
    uv: 2,
    green: 3
  },
  flowering: {
    blue: 15,
    red: 40,
    white: 30,
    farRed: 10,
    uv: 3,
    green: 2
  },
  fruiting: {
    blue: 20,
    red: 45,
    white: 25,
    farRed: 8,
    uv: 2,
    green: 0
  }
};

export const COMMON_LED_SPECIFICATIONS: LEDSpecification[] = [
  {
    id: 'spider_farmer_sf1000',
    brand: 'Spider Farmer',
    model: 'SF-1000',
    wattage: 100,
    ppfdAt12Inches: 516,
    efficiency: 2.7,
    spectrum: COMMON_SPECTRUM_RATIOS.vegetative,
    coverage: {
      footprint: '2x2 ft',
      recommendedHeight: 12
    },
    price: 139,
    brandAr: 'سبايدر فارمر',
    modelAr: 'SF-1000'
  },
  {
    id: 'mars_hydro_ts1000',
    brand: 'Mars Hydro',
    model: 'TS-1000',
    wattage: 150,
    ppfdAt12Inches: 525,
    efficiency: 2.35,
    spectrum: COMMON_SPECTRUM_RATIOS.vegetative,
    coverage: {
      footprint: '2x2 ft',
      recommendedHeight: 12
    },
    price: 79,
    brandAr: 'مارس هايدرو',
    modelAr: 'TS-1000'
  },
  {
    id: 'hlg_100v2',
    brand: 'Horticulture Lighting Group',
    model: 'HLG 100 V2',
    wattage: 95,
    ppfdAt12Inches: 400,
    efficiency: 2.8,
    spectrum: COMMON_SPECTRUM_RATIOS.flowering,
    coverage: {
      footprint: '2x2 ft',
      recommendedHeight: 18
    },
    price: 149,
    brandAr: 'مجموعة إضاءة البستنة',
    modelAr: 'HLG 100 V2'
  }
];

// DLI recommendations by crop and stage
export const DLI_RECOMMENDATIONS: { [cropId: string]: { [stageId: string]: { min: number; optimal: number; max: number } } } = {
  lettuce: {
    seedling: { min: 10, optimal: 14, max: 18 },
    vegetative: { min: 14, optimal: 17, max: 20 },
    flowering: { min: 12, optimal: 15, max: 18 },
    fruiting: { min: 12, optimal: 15, max: 18 }
  },
  tomato: {
    seedling: { min: 12, optimal: 15, max: 20 },
    vegetative: { min: 20, optimal: 25, max: 30 },
    flowering: { min: 25, optimal: 30, max: 40 },
    fruiting: { min: 30, optimal: 35, max: 45 }
  },
  basil: {
    seedling: { min: 8, optimal: 12, max: 16 },
    vegetative: { min: 12, optimal: 16, max: 20 },
    flowering: { min: 14, optimal: 18, max: 22 },
    fruiting: { min: 14, optimal: 18, max: 22 }
  }
};

// PPFD recommendations by crop and stage (μmol/m²/s)
export const PPFD_RECOMMENDATIONS: { [cropId: string]: { [stageId: string]: { min: number; optimal: number; max: number } } } = {
  lettuce: {
    seedling: { min: 100, optimal: 200, max: 300 },
    vegetative: { min: 200, optimal: 300, max: 400 },
    flowering: { min: 150, optimal: 250, max: 350 },
    fruiting: { min: 150, optimal: 250, max: 350 }
  },
  tomato: {
    seedling: { min: 150, optimal: 250, max: 350 },
    vegetative: { min: 300, optimal: 500, max: 700 },
    flowering: { min: 400, optimal: 600, max: 800 },
    fruiting: { min: 500, optimal: 700, max: 900 }
  },
  basil: {
    seedling: { min: 100, optimal: 180, max: 250 },
    vegetative: { min: 200, optimal: 350, max: 500 },
    flowering: { min: 250, optimal: 400, max: 550 },
    fruiting: { min: 250, optimal: 400, max: 550 }
  }
}; 