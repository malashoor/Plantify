import { format } from 'date-fns';
import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Reminder } from '../types/reminder';

interface ReminderCardProps {
  reminder: Reminder;
  onComplete: () => void;
  onSnooze: () => void;
  onDismiss: () => void;
}

// Simple theme object
const createTheme = (colorScheme: 'light' | 'dark' | null) => ({
  colors: {
    primary: '#4CAF50',
    success: '#8BC34A',
    warning: '#FF9800',
    error: '#F44336',
    grey3: colorScheme === 'dark' ? '#BBBBBB' : '#666666',
    background: colorScheme === 'dark' ? '#1E1E1E' : '#FFFFFF',
    text: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
    border: colorScheme === 'dark' ? '#444444' : '#E0E0E0',
  },
});

// Custom Card component
const Card = ({ children, style }: { children: React.ReactNode; style?: any }) => (
  <View style={[styles.cardBase, style]}>{children}</View>
);

// Custom Button component
const Button = ({
  title,
  onPress,
  type = 'primary',
  iconName,
  theme,
  style,
}: {
  title: string;
  onPress: () => void;
  type?: 'primary' | 'outline' | 'clear';
  iconName?: keyof typeof Ionicons.glyphMap;
  theme: any;
  style?: any;
}) => {
  const getButtonStyle = () => {
    switch (type) {
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.colors.primary,
        };
      case 'clear':
        return {
          backgroundColor: 'transparent',
        };
      default:
        return {
          backgroundColor: theme.colors.primary,
        };
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'outline':
        return theme.colors.primary;
      case 'clear':
        return theme.colors.error;
      default:
        return 'white';
    }
  };

  return (
    <TouchableOpacity style={[styles.button, getButtonStyle(), style]} onPress={onPress}>
      <View style={styles.buttonContent}>
        {iconName && (
          <Ionicons name={iconName} size={20} color={getTextColor()} style={styles.buttonIcon} />
        )}
        <Text style={[styles.buttonText, { color: getTextColor() }]}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

export const ReminderCard: React.FC<ReminderCardProps> = ({
  reminder,
  onComplete,
  onSnooze,
  onDismiss,
}) => {
  const colorScheme = useColorScheme();
  const theme = createTheme(colorScheme);

  const getTypeIcon = (type: Reminder['type']) => {
    switch (type) {
      case 'journal':
        return { name: 'book' as keyof typeof Ionicons.glyphMap, color: theme.colors.primary };
      case 'seed':
        return { name: 'leaf' as keyof typeof Ionicons.glyphMap, color: theme.colors.success };
      case 'system':
        return { name: 'settings' as keyof typeof Ionicons.glyphMap, color: theme.colors.warning };
      default:
        return {
          name: 'notifications' as keyof typeof Ionicons.glyphMap,
          color: theme.colors.grey3,
        };
    }
  };

  const icon = getTypeIcon(reminder.type);

  return (
    <Card
      style={[
        styles.card,
        { backgroundColor: theme.colors.background, borderColor: theme.colors.border },
      ]}
    >
      <View style={styles.header}>
        <Ionicons name={icon.name} color={icon.color} size={24} />
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{reminder.title}</Text>
          <Text style={[styles.date, { color: theme.colors.grey3 }]}>
            {format(new Date(reminder.trigger_date), 'MMM d, yyyy h:mm a')}
          </Text>
        </View>
      </View>

      {reminder.repeat_interval && (
        <View style={styles.repeatContainer}>
          <Ionicons name="repeat" color={theme.colors.grey3} size={16} />
          <Text style={[styles.repeatText, { color: theme.colors.grey3 }]}>
            Repeats {reminder.repeat_interval}
          </Text>
        </View>
      )}

      <View style={styles.actions}>
        <Button
          title="Complete"
          onPress={onComplete}
          type="primary"
          iconName="checkmark"
          theme={theme}
          style={styles.actionButton}
        />
        <Button
          title="Snooze"
          onPress={onSnooze}
          type="outline"
          iconName="time"
          theme={theme}
          style={styles.actionButton}
        />
        <Button
          title="Dismiss"
          onPress={onDismiss}
          type="clear"
          iconName="close"
          theme={theme}
          style={styles.actionButton}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  cardBase: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
  },
  card: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 14,
    marginTop: 2,
  },
  repeatContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  repeatText: {
    marginLeft: 8,
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 4,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});
