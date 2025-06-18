import { useState, useEffect } from 'react';

// Simple favorites hook using local state
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  const toggleFavorite = (plantId: string) => {
    setFavorites(prev => 
      prev.includes(plantId) 
        ? prev.filter(id => id !== plantId)
        : [...prev, plantId]
    );
  };

  const isFavorite = (plantId: string) => {
    return favorites.includes(plantId);
  };

  return {
    favorites,
    toggleFavorite,
    isFavorite
  };
} 