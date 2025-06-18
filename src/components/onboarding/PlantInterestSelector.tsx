import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

export interface PlantInterest {
  id: string;
  name: string;
  icon: string;
}

interface PlantInterestSelectorProps {
  selectedInterests: string[];
  onInterestsChange: (interests: string[]) => void;
  disabled?: boolean;
}

export function PlantInterestSelector({ selectedInterests, onInterestsChange, disabled }: PlantInterestSelectorProps) {
  const { t } = useTranslation();
  const isDark = useColorScheme() === 'dark';
  const [customInterest, setCustomInterest] = useState('');

  const plantInterests: PlantInterest[] = [
    {
      id: 'vegetables',
      name: t('onboarding.interests.vegetables'),
      icon: 'leaf',
    },
    {
      id: 'herbs',
      name: t('onboarding.interests.herbs'),
      icon: 'flower',
    },
    {
      id: 'fruits',
      name: t('onboarding.interests.fruits'),
      icon: 'nutrition',
    },
    {
      id: 'flowers',
      name: t('onboarding.interests.flowers'),
      icon: 'rose',
    },
    {
      id: 'succulents',
      name: t('onboarding.interests.succulents'),
      icon: 'water',
    },
    {
      id: 'indoor',
      name: t('onboarding.interests.indoor'),
      icon: 'home',
    },
    {
      id: 'medicinal',
      name: t('onboarding.interests.medicinal'),
      icon: 'medkit',
    },
    {
      id: 'decorative',
      name: t('onboarding.interests.decorative'),
      icon: 'color-palette',
    },
    {
      id: 'air_purifying',
      name: t('onboarding.interests.air_purifying'),
      icon: 'cloud',
    },
    {
      id: 'rare',
      name: t('onboarding.interests.rare'),
      icon: 'star',
    },
    {
      id: 'bonsai',
      name: t('onboarding.interests.bonsai'),
      icon: 'leaf',
    },
    {
      id: 'carnivorous',
      name: t('onboarding.interests.carnivorous'),
      icon: 'bug',
    },
  ];

  const toggleInterest = (id: string) => {
    if (disabled) return;
    
    const newInterests = selectedInterests.includes(id)
      ? selectedInterests.filter(i => i !== id)
      : [...selectedInterests, id];
    
    onInterestsChange(newInterests);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, isDark && styles.labelDark]}>
        {t('onboarding.interests.title')}
      </Text>
      <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
        {t('onboarding.interests.subtitle')}
      </Text>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.interestsGrid}
        showsVerticalScrollIndicator={false}
      >
        {plantInterests.map((interest) => (
          <TouchableOpacity
            key={interest.id}
            style={[
              styles.interest,
              selectedInterests.includes(interest.id) && styles.interestSelected,
              isDark && styles.interestDark,
              selectedInterests.includes(interest.id) && isDark && styles.interestSelectedDark,
              disabled && styles.interestDisabled,
            ]}
            onPress={() => toggleInterest(interest.id)}
            disabled={disabled}
            accessibilityRole="checkbox"
            accessibilityState={{ 
              checked: selectedInterests.includes(interest.id),
              disabled 
            }}
            accessibilityLabel={interest.name}
          >
            <View style={[
              styles.iconContainer,
              selectedInterests.includes(interest.id) && styles.iconContainerSelected,
              isDark && styles.iconContainerDark,
              selectedInterests.includes(interest.id) && isDark && styles.iconContainerSelectedDark,
            ]}>
              <Ionicons
                name={interest.icon as any}
                size={32}
                color={
                  selectedInterests.includes(interest.id)
                    ? isDark
                      ? '#22C55E'
                      : '#16A34A'
                    : isDark
                    ? '#9CA3AF'
                    : '#6B7280'
                }
              />
            </View>
            <Text
              style={[
                styles.interestLabel,
                selectedInterests.includes(interest.id) && styles.interestLabelSelected,
                isDark && styles.interestLabelDark,
                selectedInterests.includes(interest.id) && isDark && styles.interestLabelSelectedDark,
              ]}
            >
              {interest.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    color: '#111827',
    textAlign: 'center',
  },
  labelDark: {
    color: '#F3F4F6',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  subtitleDark: {
    color: '#9CA3AF',
  },
  scrollView: {
    maxHeight: 400,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  interest: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#F3F4F6',
  },
  interestDark: {
    backgroundColor: '#374151',
    borderColor: '#374151',
  },
  interestSelected: {
    borderColor: '#16A34A',
    backgroundColor: '#F0FDF4',
  },
  interestSelectedDark: {
    borderColor: '#22C55E',
    backgroundColor: '#064E3B',
  },
  interestDisabled: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconContainerDark: {
    backgroundColor: '#4B5563',
  },
  iconContainerSelected: {
    backgroundColor: '#DCFCE7',
  },
  iconContainerSelectedDark: {
    backgroundColor: '#065F46',
  },
  interestLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    textAlign: 'center',
  },
  interestLabelDark: {
    color: '#F3F4F6',
  },
  interestLabelSelected: {
    color: '#16A34A',
  },
  interestLabelSelectedDark: {
    color: '#22C55E',
  },
}); 