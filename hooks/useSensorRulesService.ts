import { useState, useEffect } from 'react';
import { SensorRule } from 'types/sensorRules';

interface SensorRulesService {
  rules: SensorRule[];
  isLoading: boolean;
  error: string | null;
  createRule: (rule: Omit<SensorRule, 'id'>) => Promise<void>;
  updateRule: (id: string, rule: Partial<SensorRule>) => Promise<void>;
  deleteRule: (id: string) => Promise<void>;
  refreshRules: () => Promise<void>;
}

export function useSensorRulesService(): SensorRulesService {
  const [rules, setRules] = useState<SensorRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for development
  const mockRules: SensorRule[] = [
    {
      id: '1',
      parameter: 'pH',
      condition: '<',
      threshold: 6.0,
      duration_minutes: 30,
      actions: {
        notification: true,
        sms: false,
        slack: null,
      },
    },
    {
      id: '2',
      parameter: 'EC',
      condition: '>',
      threshold: 2.5,
      duration_minutes: 15,
      actions: {
        notification: true,
        sms: true,
        slack: { channel: 'alerts' },
      },
    },
  ];

  const loadRules = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual API call
      // const response = await sensorRulesApi.getRules();
      // setRules(response.data);

      // For now, use mock data
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      setRules(mockRules);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sensor rules');
    } finally {
      setIsLoading(false);
    }
  };

  const createRule = async (newRule: Omit<SensorRule, 'id'>) => {
    try {
      // TODO: Replace with actual API call
      // const response = await sensorRulesApi.createRule(newRule);

      // For now, simulate creation
      const rule: SensorRule = {
        ...newRule,
        id: Date.now().toString(),
      };

      setRules(prev => [...prev, rule]);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create sensor rule');
    }
  };

  const updateRule = async (id: string, updates: Partial<SensorRule>) => {
    try {
      // TODO: Replace with actual API call
      // await sensorRulesApi.updateRule(id, updates);

      setRules(prev => prev.map(rule => (rule.id === id ? { ...rule, ...updates } : rule)));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update sensor rule');
    }
  };

  const deleteRule = async (id: string) => {
    try {
      // TODO: Replace with actual API call
      // await sensorRulesApi.deleteRule(id);

      setRules(prev => prev.filter(rule => rule.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete sensor rule');
    }
  };

  const refreshRules = async () => {
    await loadRules();
  };

  useEffect(() => {
    loadRules();
  }, []);

  return {
    rules,
    isLoading,
    error,
    createRule,
    updateRule,
    deleteRule,
    refreshRules,
  };
}
