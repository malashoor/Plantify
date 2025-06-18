import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood?: string;
  tags?: string[];
  created_at: string;
  updated_at?: string;
}

interface JournalCardProps {
  entry: JournalEntry;
  onPress: () => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

const createTheme = (colorScheme: 'light' | 'dark' | null) => ({
  colors: {
    background: colorScheme === 'dark' ? '#1E1E1E' : '#FFFFFF',
    surface: colorScheme === 'dark' ? '#2A2A2A' : '#FFFFFF',
    text: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
    textSecondary: colorScheme === 'dark' ? '#BBBBBB' : '#666666',
    primary: '#45B36B',
    border: colorScheme === 'dark' ? '#444444' : '#E0E0E0',
    error: '#F44336',
  },
});

const MOOD_CONFIG = {
  excellent: { icon: 'happy', color: '#4CAF50', label: 'Excellent' },
  good: { icon: 'happy-outline', color: '#8BC34A', label: 'Good' },
  okay: { icon: 'remove-circle-outline', color: '#FFC107', label: 'Okay' },
  poor: { icon: 'sad-outline', color: '#FF9800', label: 'Poor' },
  terrible: { icon: 'sad', color: '#F44336', label: 'Terrible' },
};

export const JournalCard: React.FC<JournalCardProps> = ({ entry, onPress, onDelete, onEdit }) => {
  const colorScheme = useColorScheme();
  const theme = createTheme(colorScheme);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this journal entry? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete?.(entry.id),
        },
      ]
    );
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  };

  const moodConfig = entry.mood ? MOOD_CONFIG[entry.mood as keyof typeof MOOD_CONFIG] : null;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
            {entry.title}
          </Text>
          <Text style={[styles.date, { color: theme.colors.textSecondary }]}>
            {formatDate(entry.created_at)}
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onEdit(entry.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="create-outline" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}

          {onDelete && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleDelete}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content Preview */}
      <Text style={[styles.content, { color: theme.colors.textSecondary }]} numberOfLines={3}>
        {truncateContent(entry.content)}
      </Text>

      {/* Footer */}
      <View style={styles.footer}>
        {/* Mood Indicator */}
        {moodConfig && (
          <View style={styles.moodContainer}>
            <Ionicons name={moodConfig.icon as any} size={16} color={moodConfig.color} />
            <Text style={[styles.moodText, { color: moodConfig.color }]}>{moodConfig.label}</Text>
          </View>
        )}

        {/* Tags */}
        {entry.tags && entry.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {entry.tags.slice(0, 3).map((tag, index) => (
              <View
                key={index}
                style={[styles.tag, { backgroundColor: theme.colors.primary + '20' }]}
              >
                <Text style={[styles.tagText, { color: theme.colors.primary }]}>{tag}</Text>
              </View>
            ))}
            {entry.tags.length > 3 && (
              <Text style={[styles.moreTagsText, { color: theme.colors.textSecondary }]}>
                +{entry.tags.length - 3} more
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Read More Indicator */}
      <View style={styles.readMoreContainer}>
        <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  moodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  moodText: {
    fontSize: 12,
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  readMoreContainer: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
