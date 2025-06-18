import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

export type Environment = 'indoor' | 'outdoor' | 'hydroponic';

interface EnvironmentSelectorProps {
  value: Environment;
  onChange: (environment: Environment) => void;
  disabled?: boolean;
}

export function EnvironmentSelector({ value, onChange, disabled }: EnvironmentSelectorProps) {
  const { t } = useTranslation();
  const isDark = useColorScheme() === 'dark';

  const environments: { value: Environment; icon: string; label: string; description: string }[] = [
    {
      value: 'indoor',
      icon: 'home',
      label: t('onboarding.environment.indoor.label'),
      description: t('onboarding.environment.indoor.description'),
    },
    {
      value: 'outdoor',
      icon: 'sunny',
      label: t('onboarding.environment.outdoor.label'),
      description: t('onboarding.environment.outdoor.description'),
    },
    {
      value: 'hydroponic',
      icon: 'water',
      label: t('onboarding.environment.hydroponic.label'),
      description: t('onboarding.environment.hydroponic.description'),
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.label, isDark && styles.labelDark]}>
        {t('onboarding.environment.title')}
      </Text>
      <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
        {t('onboarding.environment.subtitle')}
      </Text>
      <View style={styles.environments}>
        {environments.map(env => (
          <TouchableOpacity
            key={env.value}
            style={[
              styles.environment,
              value === env.value && styles.environmentSelected,
              isDark && styles.environmentDark,
              value === env.value && isDark && styles.environmentSelectedDark,
              disabled && styles.environmentDisabled,
            ]}
            onPress={() => !disabled && onChange(env.value)}
            disabled={disabled}
            accessibilityRole="radio"
            accessibilityState={{ checked: value === env.value, disabled }}
            accessibilityLabel={env.label}
            accessibilityHint={env.description}
          >
            <View
              style={[
                styles.iconContainer,
                value === env.value && styles.iconContainerSelected,
                isDark && styles.iconContainerDark,
                value === env.value && isDark && styles.iconContainerSelectedDark,
              ]}
            >
              <Ionicons
                name={env.icon as any}
                size={32}
                color={
                  value === env.value
                    ? isDark
                      ? '#22C55E'
                      : '#16A34A'
                    : isDark
                      ? '#9CA3AF'
                      : '#6B7280'
                }
              />
            </View>
            <View style={styles.environmentContent}>
              <Text
                style={[
                  styles.environmentLabel,
                  value === env.value && styles.environmentLabelSelected,
                  isDark && styles.environmentLabelDark,
                  value === env.value && isDark && styles.environmentLabelSelectedDark,
                ]}
              >
                {env.label}
              </Text>
              <Text
                style={[styles.environmentDescription, isDark && styles.environmentDescriptionDark]}
                numberOfLines={2}
              >
                {env.description}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
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
  environments: {
    gap: 16,
  },
  environment: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#F3F4F6',
  },
  environmentDark: {
    backgroundColor: '#374151',
    borderColor: '#374151',
  },
  environmentSelected: {
    borderColor: '#16A34A',
    backgroundColor: '#F0FDF4',
  },
  environmentSelectedDark: {
    borderColor: '#22C55E',
    backgroundColor: '#064E3B',
  },
  environmentDisabled: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
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
  environmentContent: {
    flex: 1,
  },
  environmentLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  environmentLabelDark: {
    color: '#F3F4F6',
  },
  environmentLabelSelected: {
    color: '#16A34A',
  },
  environmentLabelSelectedDark: {
    color: '#22C55E',
  },
  environmentDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  environmentDescriptionDark: {
    color: '#9CA3AF',
  },
});
