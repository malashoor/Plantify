import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import type { UserRole } from '@hooks/useAuth';

interface RoleSelectorProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
  disabled?: boolean;
}

export function RoleSelector({ value, onChange, disabled }: RoleSelectorProps) {
  const { t } = useTranslation();
  const isDark = useColorScheme() === 'dark';

  const roles: { value: UserRole; icon: string; label: string; description: string }[] = [
    {
      value: 'grower',
      icon: 'leaf',
      label: t('onboarding.roles.grower.label'),
      description: t('onboarding.roles.grower.description'),
    },
    {
      value: 'child',
      icon: 'happy',
      label: t('onboarding.roles.child.label'),
      description: t('onboarding.roles.child.description'),
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.label, isDark && styles.labelDark]}>
        {t('onboarding.roles.title')}
      </Text>
      <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
        {t('onboarding.roles.subtitle')}
      </Text>
      <View style={styles.roles}>
        {roles.map((role) => (
          <TouchableOpacity
            key={role.value}
            style={[
              styles.role,
              value === role.value && styles.roleSelected,
              isDark && styles.roleDark,
              value === role.value && isDark && styles.roleSelectedDark,
              disabled && styles.roleDisabled,
            ]}
            onPress={() => !disabled && onChange(role.value)}
            disabled={disabled}
            accessibilityRole="radio"
            accessibilityState={{ checked: value === role.value, disabled }}
            accessibilityLabel={role.label}
            accessibilityHint={role.description}
          >
            <View style={[
              styles.iconContainer,
              value === role.value && styles.iconContainerSelected,
              isDark && styles.iconContainerDark,
              value === role.value && isDark && styles.iconContainerSelectedDark,
            ]}>
              <Ionicons
                name={role.icon as any}
                size={32}
                color={
                  value === role.value
                    ? isDark
                      ? '#22C55E'
                      : '#16A34A'
                    : isDark
                    ? '#9CA3AF'
                    : '#6B7280'
                }
              />
            </View>
            <View style={styles.roleContent}>
              <Text
                style={[
                  styles.roleLabel,
                  value === role.value && styles.roleLabelSelected,
                  isDark && styles.roleLabelDark,
                  value === role.value && isDark && styles.roleLabelSelectedDark,
                ]}
              >
                {role.label}
              </Text>
              <Text
                style={[
                  styles.roleDescription,
                  isDark && styles.roleDescriptionDark,
                ]}
                numberOfLines={2}
              >
                {role.description}
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
  roles: {
    gap: 16,
  },
  role: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#F3F4F6',
  },
  roleDark: {
    backgroundColor: '#374151',
    borderColor: '#374151',
  },
  roleSelected: {
    borderColor: '#16A34A',
    backgroundColor: '#F0FDF4',
  },
  roleSelectedDark: {
    borderColor: '#22C55E',
    backgroundColor: '#064E3B',
  },
  roleDisabled: {
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
  roleContent: {
    flex: 1,
  },
  roleLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  roleLabelDark: {
    color: '#F3F4F6',
  },
  roleLabelSelected: {
    color: '#16A34A',
  },
  roleLabelSelectedDark: {
    color: '#22C55E',
  },
  roleDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  roleDescriptionDark: {
    color: '#9CA3AF',
  },
}); 