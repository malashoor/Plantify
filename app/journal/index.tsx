import { useTheme } from '@rneui/themed';
import { Stack } from 'expo-router';
import React, { useEffect } from 'react';

import { View, FlatList, StyleSheet } from 'react-native';

import { ErrorMessage } from '../../components/common/ErrorMessage';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Text } from '../../components/common/Text';
import { JournalCard } from '../../components/journal/JournalCard';
import { useJournal } from '../../hooks/useJournal';

export default function JournalScreen() {
  const { theme } = useTheme();
  const { entries, isLoading, error, fetchEntries } = useJournal();

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error.message} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen 
        options={{
          title: 'Plant Journal',
          headerLargeTitle: true,
        }} 
      />
      
      {entries.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            No journal entries yet. Start documenting your plant's journey!
          </Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <JournalCard entry={item} />}
          contentContainerStyle={styles.list}
          accessibilityRole="list"
          accessibilityLabel="Plant journal entries"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    textAlign: 'center',
    fontSize: 16,
  },
}); 