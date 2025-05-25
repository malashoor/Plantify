import { useTheme } from '@rneui/themed';
import { Stack, useRouter } from 'expo-router';
import React from 'react';

import { View, StyleSheet, ScrollView } from 'react-native';

import { JournalForm } from '../../components/journal/JournalForm';
import { useJournal } from '../../hooks/useJournal';
import type { JournalEntry } from '../../types/journal';

export default function NewJournalScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { addEntry } = useJournal();

  const handleSubmit = async (entry: Omit<JournalEntry, 'id' | 'created_at'>) => {
    try {
      await addEntry(entry);
      router.back();
    } catch (error) {
      // Error handling is done in the hook
      console.error('Failed to create journal entry:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen 
        options={{
          title: 'New Journal Entry',
          presentation: 'modal',
        }} 
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <JournalForm onSubmit={handleSubmit} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
}); 