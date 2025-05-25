import { useState, useCallback } from 'react';

import { supabase } from '../lib/supabase';
import type { JournalEntry } from '../types/journal';

import { useAuth } from './useAuth';

export function useJournal() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEntries = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setEntries(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch journal entries'));
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const addEntry = useCallback(async (entry: Omit<JournalEntry, 'id' | 'created_at'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Optimistic update
      const optimisticEntry: JournalEntry = {
        id: 'temp-' + Date.now(),
        created_at: new Date().toISOString(),
        user_id: user.id,
        ...entry,
      };
      setEntries(prev => [optimisticEntry, ...prev]);

      const { data, error: insertError } = await supabase
        .from('journal_entries')
        .insert([{ ...entry, user_id: user.id }])
        .select()
        .single();

      if (insertError) throw insertError;

      // Replace optimistic entry with real one
      setEntries(prev => prev.map(e => e.id === optimisticEntry.id ? data : e));
    } catch (err) {
      // Revert optimistic update
      setEntries(prev => prev.filter(e => !e.id.startsWith('temp-')));
      throw err instanceof Error ? err : new Error('Failed to add journal entry');
    }
  }, [user]);

  const updateEntry = useCallback(async (id: string, updates: Partial<JournalEntry>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Optimistic update
      setEntries(prev => prev.map(entry => 
        entry.id === id ? { ...entry, ...updates } : entry
      ));

      const { error: updateError } = await supabase
        .from('journal_entries')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (updateError) throw updateError;
    } catch (err) {
      // Revert optimistic update
      fetchEntries();
      throw err instanceof Error ? err : new Error('Failed to update journal entry');
    }
  }, [user, fetchEntries]);

  const deleteEntry = useCallback(async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Optimistic update
      setEntries(prev => prev.filter(entry => entry.id !== id));

      const { error: deleteError } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;
    } catch (err) {
      // Revert optimistic update
      fetchEntries();
      throw err instanceof Error ? err : new Error('Failed to delete journal entry');
    }
  }, [user, fetchEntries]);

  const getEntry = useCallback((id: string) => {
    const entry = entries.find(e => e.id === id);
    return {
      data: entry,
      isLoading: false,
      error: entry ? null : new Error('Entry not found'),
    };
  }, [entries]);

  return {
    entries,
    isLoading,
    error,
    fetchEntries,
    addEntry,
    updateEntry,
    deleteEntry,
    getEntry,
  };
} 