import { useState, useEffect } from 'react';

// Basic sensor rule type
export interface SensorRule {
  id: string;
  name: string;
  type: string;
  conditions: any[];
  actions: any[];
  enabled: boolean;
}

export function useSensorRulesService() {
  const [rules, setRules] = useState<SensorRule[]>([]);
  const [loading, setLoading] = useState(false);

  const loadRules = async () => {
    setLoading(true);
    try {
      // Mock data for now
      const mockRules: SensorRule[] = [
        {
          id: '1',
          name: 'Low Moisture Alert',
          type: 'moisture',
          conditions: [{ type: 'moisture', operator: '<', value: 30 }],
          actions: [{ type: 'notification', message: 'Plant needs watering' }],
          enabled: true,
        },
      ];
      setRules(mockRules);
    } catch (error) {
      console.error('Error loading sensor rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const createRule = async (rule: Omit<SensorRule, 'id'>) => {
    const newRule: SensorRule = {
      ...rule,
      id: Date.now().toString(),
    };
    setRules(prev => [...prev, newRule]);
    return newRule;
  };

  const updateRule = async (id: string, updates: Partial<SensorRule>) => {
    setRules(prev => prev.map(rule => (rule.id === id ? { ...rule, ...updates } : rule)));
  };

  const deleteRule = async (id: string) => {
    setRules(prev => prev.filter(rule => rule.id !== id));
  };

  useEffect(() => {
    loadRules();
  }, []);

  return {
    rules,
    loading,
    createRule,
    updateRule,
    deleteRule,
    loadRules,
  };
}
