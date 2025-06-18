import { useState, useEffect } from 'react';

export interface HydroponicSystem {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'maintenance';
  ph: number;
  nutrients: number;
  temperature: number;
  lightHours: number;
}

export function useHydroponics() {
  const [systems, setSystems] = useState<HydroponicSystem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock hydroponic systems data
    const mockSystems: HydroponicSystem[] = [
      {
        id: '1',
        name: 'Lettuce Garden',
        type: 'NFT',
        status: 'active',
        ph: 6.2,
        nutrients: 850,
        temperature: 22,
        lightHours: 14,
      },
      {
        id: '2',
        name: 'Herb Tower',
        type: 'Deep Water Culture',
        status: 'active',
        ph: 5.8,
        nutrients: 1200,
        temperature: 24,
        lightHours: 16,
      },
    ];

    setSystems(mockSystems);
    setLoading(false);
  }, []);

  const getSystemById = (id: string) => {
    return systems.find(system => system.id === id);
  };

  const updateSystem = (id: string, updates: Partial<HydroponicSystem>) => {
    setSystems(prev => prev.map(system => 
      system.id === id ? { ...system, ...updates } : system
    ));
  };

  return {
    systems,
    loading,
    getSystemById,
    updateSystem,
  };
} 