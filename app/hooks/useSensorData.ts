import { useState, useEffect } from 'react';

export interface SensorData {
  ph: number;
  ec: number;
  temperature: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
}

export interface SensorMeasurement {
  id: string;
  type: string;
  value: number;
  unit: string;
  timestamp: Date;
}

export function useSensorData() {
  const [sensorData, setSensorData] = useState<SensorData>({
    ph: 6.5,
    ec: 1.2,
    temperature: 22.5,
    nitrogen: 180,
    phosphorus: 45,
    potassium: 210,
  });
  
  const [sensorMeasurements, setSensorMeasurements] = useState<SensorMeasurement[]>([
    { id: '1', type: 'ph', value: 6.5, unit: 'pH', timestamp: new Date() },
    { id: '2', type: 'ec', value: 1.2, unit: 'mS/cm', timestamp: new Date() },
  ]);

  const [isLoading, setIsLoading] = useState(false);

  return {
    sensorData,
    sensorMeasurements,
    isLoading,
    isLoadingSensors: isLoading,
  };
} 