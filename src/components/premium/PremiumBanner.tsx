import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import type { PremiumFeature } from '../../hooks/usePremiumAccess';

interface PremiumBannerProps {
  feature: PremiumFeature;
  variant?: 'inline' | 'overlay' | 'minimal';
  onUpgrade?: () => void;
}

export default function PremiumBanner({ 
  feature, 
  variant = 'inline',
  onUpgrade 
}: PremiumBannerProps) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      router.push('/premium');
    }
  };

  if (variant === 'minimal') {
    return (
      <TouchableOpacity
        style={[styles.minimalContainer, isDark && styles.minimalContainerDark]}
        onPress={handleUpgrade}
      >
        <Ionicons 
          name="lock-closed" 
          size={16} 
          color={isDark ? '#A3E635' : '#45B36B'} 
        />
        <Text style={[styles.minimalText, isDark && styles.minimalTextDark]}>
          {t('premium.upgrade')}
        </Text>
      </TouchableOpacity>
    );
  }

  if (variant === 'overlay') {
    return (
      <View style={[styles.overlayContainer, isDark && styles.overlayContainerDark]}>
        <View style={styles.content}>
          <Ionicons 
            name="lock-closed" 
            size={32} 
            color={isDark ? '#A3E635' : '#45B36B'} 
          />
          <Text style={[styles.title, isDark && styles.textDark]}>
            {feature.name}
          </Text>
          <Text style={[styles.description, isDark && styles.textLightDark]}>
            {feature.description}
          </Text>
          <TouchableOpacity
            style={[styles.button, isDark && styles.buttonDark]}
            onPress={handleUpgrade}
          >
            <Text style={styles.buttonText}>
              {t('premium.unlockNow')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.content}>
        <Ionicons 
          name="lock-closed" 
          size={24} 
          color={isDark ? '#A3E635' : '#45B36B'} 
        />
        <View style={styles.textContainer}>
          <Text style={[styles.title, isDark && styles.textDark]}>
            {feature.name}
          </Text>
          <Text style={[styles.description, isDark && styles.textLightDark]}>
            {feature.description}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.button, isDark && styles.buttonDark]}
        onPress={handleUpgrade}
      >
        <Text style={styles.buttonText}>
          {t('premium.upgrade')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  containerDark: {
    backgroundColor: '#1F2937',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
  },
  button: {
    backgroundColor: '#45B36B',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  buttonDark: {
    backgroundColor: '#A3E635',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 100,
  },
  overlayContainerDark: {
    backgroundColor: 'rgba(17, 24, 39, 0.95)',
  },
  minimalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  minimalContainerDark: {
    backgroundColor: '#374151',
  },
  minimalText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#45B36B',
    marginLeft: 4,
  },
  minimalTextDark: {
    color: '#A3E635',
  },
  textDark: {
    color: '#F3F4F6',
  },
  textLightDark: {
    color: '#9CA3AF',
  },
}); 