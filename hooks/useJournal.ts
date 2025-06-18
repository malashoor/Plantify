import { useState } from 'react';

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  plant_id?: string;
  photos?: string[];
  mood?: 'happy' | 'concerned' | 'excited' | 'frustrated';
  weather?: string;
  created_at: string;
  updated_at: string;
}

export function useJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addEntry = async (entryData: Omit<JournalEntry, 'id' | 'created_at' | 'updated_at'>) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newEntry: JournalEntry = {
        ...entryData,
        id: `entry-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setEntries(prev => [newEntry, ...prev]);
      setIsLoading(false);
      return newEntry;
    } catch (err) {
      setError('Failed to create journal entry');
      setIsLoading(false);
      throw err;
    }
  };

  const updateEntry = async (id: string, updates: Partial<JournalEntry>) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setEntries(prev =>
        prev.map(entry =>
          entry.id === id ? { ...entry, ...updates, updated_at: new Date().toISOString() } : entry
        )
      );
      setIsLoading(false);
    } catch (err) {
      setError('Failed to update journal entry');
      setIsLoading(false);
      throw err;
    }
  };

  const deleteEntry = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      setEntries(prev => prev.filter(entry => entry.id !== id));
      setIsLoading(false);
    } catch (err) {
      setError('Failed to delete journal entry');
      setIsLoading(false);
      throw err;
    }
  };

  const getEntries = () => entries;

  const getEntry = (id: string) => entries.find(entry => entry.id === id);

  return {
    entries,
    addEntry,
    updateEntry,
    deleteEntry,
    getEntries,
    getEntry,
    isLoading,
    error,
  };
}
