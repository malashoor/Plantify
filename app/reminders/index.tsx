import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Text,
  TouchableOpacity,
  useColorScheme,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useReminders } from '../../hooks/useReminders';

// Simple theme object
const createTheme = (colorScheme: 'light' | 'dark' | null) => ({
  colors: {
    primary: '#4CAF50',
    primaryDark: '#388E3C',
    background: colorScheme === 'dark' ? '#121212' : '#FFFFFF',
    surface: colorScheme === 'dark' ? '#1E1E1E' : '#F8F9FA',
    text: colorScheme === 'dark' ? '#FFFFFF' : '#212121',
    textSecondary: colorScheme === 'dark' ? '#AAAAAA' : '#757575',
    border: colorScheme === 'dark' ? '#333333' : '#E0E0E0',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
  },
});

// Simple ReminderCard component
const ReminderCard = ({ reminder, onComplete, onToggleActive, onDelete }: any) => {
  const colorScheme = useColorScheme();
  const theme = createTheme(colorScheme);

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'watering':
        return 'water';
      case 'fertilizing':
        return 'leaf';
      case 'pruning':
        return 'cut';
      case 'monitoring':
        return 'eye';
      default:
        return 'notifications';
    }
  };

  return (
    <View
      style={[
        styles.reminderCard,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
      ]}
    >
      <View style={styles.reminderHeader}>
        <View style={styles.reminderTitleRow}>
          <Ionicons
            name={getCategoryIcon(reminder.category)}
            size={20}
            color={theme.colors.primary}
            style={styles.categoryIcon}
          />
          <Text style={[styles.reminderTitle, { color: theme.colors.text }]}>{reminder.title}</Text>
        </View>
        <TouchableOpacity
          onPress={() => onToggleActive(reminder.id)}
          style={[
            styles.activeToggle,
            {
              backgroundColor: reminder.isActive
                ? theme.colors.success
                : theme.colors.textSecondary,
            },
          ]}
        >
          <Text style={styles.activeToggleText}>{reminder.isActive ? 'Active' : 'Inactive'}</Text>
        </TouchableOpacity>
      </View>

      {reminder.description && (
        <Text style={[styles.reminderDescription, { color: theme.colors.textSecondary }]}>
          {reminder.description}
        </Text>
      )}

      <View style={styles.reminderDetails}>
        <Text style={[styles.reminderTime, { color: theme.colors.textSecondary }]}>
          {formatTime(reminder.time)} • {reminder.frequency}
        </Text>
        {reminder.plantName && (
          <Text style={[styles.reminderPlant, { color: theme.colors.primary }]}>
            {reminder.plantName}
          </Text>
        )}
      </View>

      <View style={styles.reminderActions}>
        {!reminder.isCompleted && (
          <TouchableOpacity
            onPress={() => onComplete(reminder.id)}
            style={[styles.actionButton, { backgroundColor: theme.colors.success }]}
          >
            <Ionicons name="checkmark" size={16} color="white" />
            <Text style={styles.actionButtonText}>Complete</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => onDelete(reminder.id)}
          style={[styles.actionButton, { backgroundColor: theme.colors.error }]}
        >
          <Ionicons name="trash" size={16} color="white" />
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function RemindersScreen() {
  const colorScheme = useColorScheme();
  const theme = createTheme(colorScheme);
  const router = useRouter();
  const {
    reminders,
    isLoading,
    updateReminder,
    deleteReminder,
    getTodaysReminders,
    markComplete,
    toggleActive,
  } = useReminders();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const todaysReminders = getTodaysReminders();
    if (todaysReminders.length > 0) {
      const message = `You have ${todaysReminders.length} plant care reminders today.`;
      // Only speak if there are active reminders
      if (todaysReminders.some(r => r.isActive && !r.isCompleted)) {
        Speech.speak(message, {
          language: 'en',
          pitch: 1,
          rate: 0.9,
        });
      }
    }
  }, [reminders]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Refresh logic would go here
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleComplete = async (reminderId: string) => {
    try {
      await markComplete(reminderId);
      Alert.alert('Success', 'Reminder marked as complete!');
    } catch (error) {
      Alert.alert('Error', 'Failed to complete reminder');
    }
  };

  const handleToggleActive = async (reminderId: string) => {
    try {
      await toggleActive(reminderId);
    } catch (error) {
      Alert.alert('Error', 'Failed to toggle reminder');
    }
  };

  const handleDelete = async (reminderId: string) => {
    Alert.alert('Delete Reminder', 'Are you sure you want to delete this reminder?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteReminder(reminderId);
            Alert.alert('Success', 'Reminder deleted!');
          } catch (error) {
            Alert.alert('Error', 'Failed to delete reminder');
          }
        },
      },
    ]);
  };

  const activeReminders = reminders.filter(r => r.isActive && !r.isCompleted);
  const completedReminders = reminders.filter(r => r.isCompleted);
  const todaysReminders = getTodaysReminders();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Reminders</Text>
        <TouchableOpacity
          style={[styles.newButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => router.push('/reminders/new')}
        >
          <Ionicons name="add" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Today's Reminders */}
        {todaysReminders.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Today ({todaysReminders.length})
            </Text>
            {todaysReminders.map(reminder => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                onComplete={handleComplete}
                onToggleActive={handleToggleActive}
                onDelete={handleDelete}
              />
            ))}
          </View>
        )}

        {/* Active Reminders */}
        {activeReminders.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Active ({activeReminders.length})
            </Text>
            {activeReminders.map(reminder => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                onComplete={handleComplete}
                onToggleActive={handleToggleActive}
                onDelete={handleDelete}
              />
            ))}
          </View>
        )}

        {/* Completed Reminders */}
        {completedReminders.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Completed ({completedReminders.length})
            </Text>
            {completedReminders.slice(0, 3).map(reminder => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                onComplete={handleComplete}
                onToggleActive={handleToggleActive}
                onDelete={handleDelete}
              />
            ))}
          </View>
        )}

        {/* Empty State */}
        {reminders.length === 0 && !isLoading && (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-outline" size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyStateTitle, { color: theme.colors.text }]}>
              No reminders yet
            </Text>
            <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
              Create your first plant care reminder to get started!
            </Text>
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => router.push('/reminders/new')}
            >
              <Ionicons name="add" size={20} color="white" style={styles.createButtonIcon} />
              <Text style={styles.createButtonText}>Create First Reminder</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Loading State */}
        {isLoading && (
          <View style={styles.loadingState}>
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
              Loading reminders...
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      {reminders.length > 0 && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          onPress={() => router.push('/reminders/new')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    paddingTop: 50,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  newButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  reminderCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reminderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    marginRight: 8,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  activeToggle: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeToggleText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  reminderDescription: {
    fontSize: 14,
    marginBottom: 8,
    marginLeft: 28,
  },
  reminderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginLeft: 28,
  },
  reminderTime: {
    fontSize: 14,
  },
  reminderPlant: {
    fontSize: 14,
    fontWeight: '500',
  },
  reminderActions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 28,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  createButtonIcon: {
    marginRight: 8,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
