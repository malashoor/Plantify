import { useState } from 'react';

interface UseSensorRulesEngineProps {
  plantId?: string;
  systemId?: string;
  refreshInterval?: number;
}

export function useSensorRulesEngine({
  plantId,
  systemId,
  refreshInterval = 60000,
}: UseSensorRulesEngineProps) {
  const [rules] = useState([]);
  const [isRunning] = useState(false);

  const startEngine = () => {
    console.log('Sensor rules engine started (mock)');
  };

  const stopEngine = () => {
    console.log('Sensor rules engine stopped (mock)');
  };

  return {
    rules,
    isRunning,
    startEngine,
    stopEngine,
  };
}
