import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../themed';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '../../hooks/useThemeColor';
import { useTranslation } from '../../hooks/useTranslation';

const PREMIUM_FEATURES = [
  {
    id: 'advanced_calculator',
    icon: 'calculator',
    titleKey: 'premium.features.advancedCalculator.title',
    descriptionKey: 'premium.features.advancedCalculator.description',
  },
  {
    id: 'unlimited_ai',
    icon: 'chatbubbles',
    titleKey: 'premium.features.unlimitedAI.title',
    descriptionKey: 'premium.features.unlimitedAI.description',
  },
  {
    id: 'custom_journal',
    icon: 'book',
    titleKey: 'premium.features.customJournal.title',
    descriptionKey: 'premium.features.customJournal.description',
  },
  {
    id: 'priority_support',
    icon: 'star',
    titleKey: 'premium.features.prioritySupport.title',
    descriptionKey: 'premium.features.prioritySupport.description',
  },
];

export function PremiumFeatureList() {
  const { t } = useTranslation();
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');

  return (
    <View style={styles.container}>
      {PREMIUM_FEATURES.map(feature => (
        <View key={feature.id} style={[styles.featureCard, { borderColor }]}>
          <View style={styles.iconContainer}>
            <Ionicons name={feature.icon as any} size={24} color={tintColor} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{t(feature.titleKey)}</Text>
            <Text style={styles.description}>{t(feature.descriptionKey)}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 30,
  },
  featureCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  iconContainer: {
    marginRight: 16,
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    opacity: 0.7,
  },
});
