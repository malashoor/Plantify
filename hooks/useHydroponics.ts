import { useState } from 'react';

export function useHydroponics() {
  const [systems] = useState([]);
  const [isLoading] = useState(false);
  const [error] = useState(null);

  const addSystem = () => {
    console.log('Add hydroponic system (mock)');
  };

  const updateSystem = () => {
    console.log('Update hydroponic system (mock)');
  };

  const deleteSystem = () => {
    console.log('Delete hydroponic system (mock)');
  };

  const refreshSystems = () => {
    console.log('Refresh hydroponic systems (mock)');
  };

  return {
    systems,
    isLoading,
    error,
    addSystem,
    updateSystem,
    deleteSystem,
    refreshSystems
  };
} 