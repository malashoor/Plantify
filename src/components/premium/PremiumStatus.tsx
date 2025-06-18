import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { usePremiumAccess } from '../../hooks/usePremiumAccess';

interface PremiumStatusProps {
  onUpgrade?: () => void;
}

export default function PremiumStatus({ onUpgrade }: PremiumStatusProps) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { isPremium, expiresAt, loading } = usePremiumAccess();

  if (loading) {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <Text style={[styles.loadingText, isDark && styles.textLightDark]}>
          {t('common.loading')}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.header}>
        <View style={styles.statusContainer}>
          <Ionicons
            name={isPremium ? 'star' : 'star-outline'}
            size={24}
            color={isDark ? '#A3E635' : '#45B36B'}
          />
          <Text style={[styles.status, isDark && styles.textDark]}>
            {t(isPremium ? 'premium.status.active' : 'premium.status.inactive')}
          </Text>
        </View>
        {isPremium && expiresAt && (
          <Text style={[styles.expires, isDark && styles.textLightDark]}>
            {t('premium.status.expires', {
              date: format(new Date(expiresAt), 'MMM d, yyyy'),
            })}
          </Text>
        )}
      </View>

      {!isPremium && (
        <View style={styles.features}>
          <Text style={[styles.featuresTitle, isDark && styles.textDark]}>
            {t('premium.description')}
          </Text>
          <View style={styles.featuresList}>
            {Object.values(PREMIUM_FEATURES).map(feature => (
              <View key={feature.id} style={styles.featureItem}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={isDark ? '#A3E635' : '#45B36B'}
                />
                <Text style={[styles.featureText, isDark && styles.textDark]}>{feature.name}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity
            style={[styles.upgradeButton, isDark && styles.upgradeButtonDark]}
            onPress={onUpgrade}
          >
            <Text style={styles.upgradeButtonText}>{t('premium.cta.upgrade')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  containerDark: {
    backgroundColor: '#1F2937',
  },
  header: {
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  status: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  expires: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  features: {
    marginTop: 16,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  featuresList: {
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#111827',
    marginLeft: 8,
  },
  upgradeButton: {
    backgroundColor: '#45B36B',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  upgradeButtonDark: {
    backgroundColor: '#A3E635',
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  textDark: {
    color: '#F3F4F6',
  },
  textLightDark: {
    color: '#9CA3AF',
  },
});
