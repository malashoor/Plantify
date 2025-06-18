import AsyncStorage from '@react-native-async-storage/async-storage';

import { Platform } from 'react-native';

// Types
export interface HydroponicData {
  systemId: string;
  timestamp: string;
  ph: number;
  ec: number;
  tds: number;
  temperature: number;
  dissolvedOxygen: number;
  nutrientLevels: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    calcium: number;
    magnesium: number;
  };
}

// Get hydroponic data
export async function getHydroponicData(
  systemId: string,
): Promise<HydroponicData> {
  // Simulated data for testing
  return {
    systemId,
    timestamp: new Date().toISOString(),
    ph: 6.2,
    ec: 1.8,
    tds: 900,
    temperature: 23,
    dissolvedOxygen: 7.5,
    nutrientLevels: {
      nitrogen: 150,
      phosphorus: 50,
      potassium: 200,
      calcium: 180,
      magnesium: 50,
    },
  };
}
