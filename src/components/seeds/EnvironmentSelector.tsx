import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Environment } from '../../types/seed';
import { useColorScheme } from 'react-native';

interface EnvironmentSelectorProps {
  value: Environment;
  onChange: (environment: Environment) => void;
  disabled?: boolean;
}

export function EnvironmentSelector({ value, onChange, disabled }: EnvironmentSelectorProps) {
  const { t } = useTranslation();
  const isDark = useColorScheme() === 'dark';

  const options: { value: Environment; icon: string; label: string }[] = [
    {
      value: 'indoor',
      icon: 'home-outline',
      label: t('seeds.environment.indoor'),
    },
    {
      value: 'outdoor',
      icon: 'sunny-outline',
      label: t('seeds.environment.outdoor'),
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.label, isDark && styles.labelDark]}>
        {t('seeds.environment.label')}
      </Text>
      <View style={styles.options}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.option,
              value === option.value && styles.optionSelected,
              isDark && styles.optionDark,
              value === option.value && isDark && styles.optionSelectedDark,
              disabled && styles.optionDisabled,
            ]}
            onPress={() => !disabled && onChange(option.value)}
            disabled={disabled}
            accessibilityRole="radio"
            accessibilityState={{ checked: value === option.value, disabled }}
            accessibilityLabel={option.label}
          >
            <Ionicons
              name={option.icon as any}
              size={24}
              color={
                value === option.value
                  ? isDark
                    ? '#22C55E'
                    : '#16A34A'
                  : isDark
                  ? '#9CA3AF'
                  : '#6B7280'
              }
            />
            <Text
              style={[
                styles.optionText,
                value === option.value && styles.optionTextSelected,
                isDark && styles.optionTextDark,
                value === option.value && isDark && styles.optionTextSelectedDark,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#111827',
  },
  labelDark: {
    color: '#F3F4F6',
  },
  options: {
    flexDirection: 'row',
    gap: 12,
  },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#F3F4F6',
  },
  optionDark: {
    backgroundColor: '#374151',
    borderColor: '#374151',
  },
  optionSelected: {
    borderColor: '#16A34A',
    backgroundColor: '#F0FDF4',
  },
  optionSelectedDark: {
    borderColor: '#22C55E',
    backgroundColor: '#064E3B',
  },
  optionDisabled: {
    opacity: 0.5,
  },
  optionText: {
    fontSize: 16,
    color: '#6B7280',
  },
  optionTextDark: {
    color: '#9CA3AF',
  },
  optionTextSelected: {
    color: '#16A34A',
    fontWeight: '500',
  },
  optionTextSelectedDark: {
    color: '#22C55E',
  },
}); 