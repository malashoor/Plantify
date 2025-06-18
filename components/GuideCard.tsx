import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface GuideCardProps {
  guide: {
    id?: string;
    plantId?: string;
    plantName?: string;
    title?: string;
    schedule?: string;
    frequency?: string;
    issue?: string;
    solution?: string;
    severity?: 'low' | 'medium' | 'high';
    fertilizerType?: string;
    lastWatered?: string;
    nextFertilization?: string;
    notes?: string;
  };
  onPress?: () => void;
}

// Simple theme helper
const createTheme = (colorScheme: 'light' | 'dark' | null) => ({
  colors: {
    surface: colorScheme === 'dark' ? '#2A2A2A' : '#FFFFFF',
    text: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
    textSecondary: colorScheme === 'dark' ? '#BBBBBB' : '#666666',
    border: colorScheme === 'dark' ? '#444444' : '#E0E0E0',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
  },
});

const getSeverityColor = (severity: string | undefined, theme: any) => {
  switch (severity) {
    case 'high':
      return theme.colors.error;
    case 'medium':
      return theme.colors.warning;
    case 'low':
      return theme.colors.success;
    default:
      return theme.colors.textSecondary;
  }
};

const getSeverityIcon = (severity: string | undefined): keyof typeof Ionicons.glyphMap => {
  switch (severity) {
    case 'high':
      return 'warning';
    case 'medium':
      return 'alert-circle';
    case 'low':
      return 'checkmark-circle';
    default:
      return 'information-circle';
  }
};

export const GuideCard: React.FC<GuideCardProps> = ({ guide, onPress }) => {
  const colorScheme = useColorScheme();
  const theme = createTheme(colorScheme);

  const displayTitle = guide.issue || guide.plantName || guide.title || 'Plant Care Guide';
  const displayContent =
    guide.solution || guide.schedule || guide.frequency || guide.notes || 'No details available';

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{displayTitle}</Text>
          {guide.severity && (
            <View style={styles.severityContainer}>
              <Ionicons
                name={getSeverityIcon(guide.severity)}
                size={16}
                color={getSeverityColor(guide.severity, theme)}
              />
              <Text style={[styles.severity, { color: getSeverityColor(guide.severity, theme) }]}>
                {guide.severity.toUpperCase()}
              </Text>
            </View>
          )}
        </View>
      </View>

      <Text style={[styles.content, { color: theme.colors.textSecondary }]}>{displayContent}</Text>

      {guide.fertilizerType && (
        <Text style={[styles.detail, { color: theme.colors.textSecondary }]}>
          Fertilizer: {guide.fertilizerType}
        </Text>
      )}

      {guide.lastWatered && (
        <Text style={[styles.detail, { color: theme.colors.textSecondary }]}>
          Last watered: {new Date(guide.lastWatered).toLocaleDateString()}
        </Text>
      )}

      {guide.nextFertilization && (
        <Text style={[styles.detail, { color: theme.colors.textSecondary }]}>
          Next fertilization: {new Date(guide.nextFertilization).toLocaleDateString()}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  header: {
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  severityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  severity: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  detail: {
    fontSize: 12,
    marginTop: 4,
  },
});
