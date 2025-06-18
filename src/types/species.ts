export interface MoistureThresholds {
  min: number;
  optimal: number;
  max: number;
}

export interface GrowingMethod {
  type: 'soil' | 'hydroponic';
  nutrientSchedule?: {
    frequencyDays: number;
    solution: string;
    ppm: number;
  };
}

export interface EnvironmentFactors {
  evaporationRate: number;
  temperatureSensitivity: number;
  windSensitivity: number;
  humidityDependence: number;
}

export interface MoistureProfile {
  moistureThresholds: MoistureThresholds;
  wateringAmount: number;
  sensitivities: {
    overwatering: boolean;
    underwatering: boolean;
  };
  environmentFactors: {
    indoor: EnvironmentFactors;
    outdoor: EnvironmentFactors;
  };
}

export interface SpeciesProfile {
  id: string;
  name: string;
  scientificName: string;
  commonNames: string[];
  category: 'herb' | 'vegetable' | 'flower' | 'succulent' | 'tree' | 'houseplant';
  moisture: MoistureProfile;
  growingMethods: GrowingMethod[];
  recommendedEnvironments: ('indoor' | 'outdoor')[];
  careNotes: {
    watering: string[];
    environment: string[];
    seasonal: string[];
  };
}
