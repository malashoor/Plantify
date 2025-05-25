import { useTheme } from '@rneui/themed';
import { useRouter } from 'expo-router';
import React from 'react';

import { View, StyleSheet, Pressable } from 'react-native';

import type { JournalEntry } from '../../types/journal';
import { formatDate } from '../../utils/date';
import { Text } from '../common/Text';

interface JournalCardProps {
  entry: JournalEntry;
}

export function JournalCard({ entry }: JournalCardProps) {
  const { theme } = useTheme();
  const router = useRouter();

  const handlePress = () => {
    router.push(`/journal/${entry.id}`);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        { 
          backgroundColor: theme.colors.surface,
          opacity: pressed ? 0.7 : 1,
        }
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Journal entry for ${entry.plantName} from ${formatDate(entry.created_at)}`}
      accessibilityHint="Double tap to view full journal entry"
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.emoji} accessibilityLabel={`Plant emoji: ${entry.emoji}`}>
            {entry.emoji}
          </Text>
          <View style={styles.titleContainer}>
            <Text style={styles.plantName} numberOfLines={1}>
              {entry.plantName}
            </Text>
            <Text style={styles.date} numberOfLines={1}>
              {formatDate(entry.created_at)}
            </Text>
          </View>
        </View>
        
        <Text 
          style={styles.preview} 
          numberOfLines={2}
          accessibilityLabel="Journal entry preview"
        >
          {entry.note}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  emoji: {
    fontSize: 32,
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  plantName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  date: {
    fontSize: 14,
    opacity: 0.7,
  },
  preview: {
    fontSize: 14,
    lineHeight: 20,
  },
}); 