import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'plantify_favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load persisted favorites on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(data => {
      if (data) {
        try {
          const parsed: string[] = JSON.parse(data);
          setFavorites(parsed);
        } catch {
          // ignore parse errors
        }
      }
    });
  }, []);

  // Persist whenever favorites change
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(favorites)).catch(() => {
      // handle write errors if needed
    });
  }, [favorites]);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => (prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]));
  };

  return { favorites, toggleFavorite };
}
