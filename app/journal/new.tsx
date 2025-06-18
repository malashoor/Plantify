import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { View, StyleSheet, ScrollView, useColorScheme } from 'react-native';

import { JournalForm } from '../../components/journal/JournalForm';
import { useJournal } from '../../hooks/useJournal';
import type { JournalEntry } from 'types/journal';

// Simple theme object
const createTheme = (colorScheme: 'light' | 'dark' | null) => ({
  colors: {
    background: colorScheme === 'dark' ? '#1E1E1E' : '#FFFFFF',
  },
});

export default function NewJournalScreen() {
  const colorScheme = useColorScheme();
  const theme = createTheme(colorScheme);
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
