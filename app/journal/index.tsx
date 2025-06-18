import { Stack, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet, useColorScheme, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ErrorMessage } from '../../components/common/ErrorMessage';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { JournalCard } from '../../components/journal/JournalCard';
import { useJournal } from '../../hooks/useJournal';

// Simple theme object
const createTheme = (colorScheme: 'light' | 'dark' | null) => ({
  colors: {
    background: colorScheme === 'dark' ? '#1E1E1E' : '#FFFFFF',
    text: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
    textSecondary: colorScheme === 'dark' ? '#BBBBBB' : '#666666',
    primary: '#45B36B',
    surface: colorScheme === 'dark' ? '#2A2A2A' : '#f8f9fa',
  },
});

export default function JournalScreen() {
  const colorScheme = useColorScheme();
  const theme = createTheme(colorScheme);
  const router = useRouter();
  const { entries, isLoading, error, deleteEntry } = useJournal();

  const handleEntryPress = (entryId: string) => {
    router.push(`/journal/${entryId}`);
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      await deleteEntry(entryId);
    } catch (error) {
      console.error('Failed to delete journal entry:', error);
    }
  };

  const handleNewEntry = () => {
    router.push('/journal/new');
  };

  const handleBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen
          options={{
            title: 'Plant Journal',
            headerLargeTitle: true,
            headerLeft: () => (
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            ),
          }}
        />
        <View style={styles.centerContainer}>
          <LoadingSpinner />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading journal entries...
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen
          options={{
            title: 'Plant Journal',
            headerLargeTitle: true,
            headerLeft: () => (
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            ),
          }}
        />
        <ErrorMessage message={error} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <Stack.Screen
        options={{
          title: 'Plant Journal',
          headerLargeTitle: true,
          headerLeft: () => (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      {entries.length === 0 ? (
        <View style={styles.emptyState}>
          <View
            style={[styles.emptyIconContainer, { backgroundColor: theme.colors.primary + '20' }]}
          >
            <Ionicons name="journal-outline" size={64} color={theme.colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
            No journal entries yet
          </Text>
          <Text style={[styles.emptyDescription, { color: theme.colors.textSecondary }]}>
            Start documenting your plant's journey! Add photos, notes, and track your plant's growth
            over time.
          </Text>
          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleNewEntry}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.startButtonText}>Create First Entry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={entries}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <JournalCard
                entry={item}
                onPress={() => handleEntryPress(item.id)}
                onDelete={handleDeleteEntry}
              />
            )}
            contentContainerStyle={styles.list}
            accessibilityRole="list"
            accessibilityLabel="Plant journal entries"
            showsVerticalScrollIndicator={false}
          />

          {/* Floating Action Button */}
          <TouchableOpacity
            style={[styles.fab, { backgroundColor: theme.colors.primary }]}
            onPress={handleNewEntry}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  list: {
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    maxWidth: 280,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#45B36B',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#45B36B',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});
