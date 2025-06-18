import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

interface ActionButtonProps {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  color: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

export default function ActionButton({ 
  title, 
  subtitle, 
  icon, 
  onPress, 
  color, 
  accessibilityLabel, 
  accessibilityHint,
  testID 
}: ActionButtonProps) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <TouchableOpacity 
      style={[
        styles.actionButton, 
        { borderLeftColor: color },
        isDark && styles.actionButtonDark
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || `${title}. ${subtitle}`}
      accessibilityHint={accessibilityHint || t('accessibility.action_hint', 'Double tap to activate')}
      testID={testID}
    >
      <View 
        style={[styles.actionIcon, { backgroundColor: color + '20' }]}
        importantForAccessibility="no"
      >
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View 
        style={styles.actionContent}
        accessibilityElementsHidden={true}
        importantForAccessibility="no-hide-descendants"
      >
        <Text style={[styles.actionTitle, isDark && styles.textDark]}>
          {title}
        </Text>
        <Text style={[styles.actionSubtitle, isDark && styles.textLightDark]}>
          {subtitle}
        </Text>
      </View>
      <Ionicons 
        name="chevron-forward" 
        size={20} 
        color={isDark ? '#AAAAAA' : '#666666'} 
        style={styles.chevron}
        accessibilityElementsHidden={true}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderLeftWidth: 4,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonDark: {
    backgroundColor: '#1F2937',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  textDark: {
    color: '#FFFFFF',
  },
  textLightDark: {
    color: '#9CA3AF',
  },
  chevron: {
    marginLeft: 8,
  },
}); 