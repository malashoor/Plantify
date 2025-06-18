import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';

interface NewFeatureCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  route?: string;
  delay?: number;
}

export default function NewFeatureCard({ 
  icon, 
  title, 
  description, 
  route,
  delay = 0 
}: NewFeatureCardProps) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const opacity = new Animated.Value(0);
  const translateY = new Animated.Value(20);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY, delay]);

  const handlePress = () => {
    if (route) {
      Haptics.selectionAsync();
      navigation.navigate(route);
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.card}
        onPress={handlePress}
        disabled={!route}
        activeOpacity={route ? 0.7 : 1}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`${title} - ${description}`}
      >
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={24} color="#34D399" />
        </View>
        
        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>{t('common.new')}</Text>
            </View>
          </View>
          <Text style={styles.description}>{description}</Text>
          
          {route && (
            <View style={styles.learnMore}>
              <Text style={styles.learnMoreText}>
                {t('common.learn_more')}
              </Text>
              <Ionicons 
                name="chevron-forward" 
                size={16} 
                color="#34D399" 
                style={styles.learnMoreIcon}
              />
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  iconContainer: {
    backgroundColor: '#DCFCE7',
    padding: 10,
    borderRadius: 10,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontWeight: '600',
    fontSize: 16,
    color: '#111827',
    marginRight: 8,
  },
  newBadge: {
    backgroundColor: '#34D399',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  newBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  description: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
  learnMore: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  learnMoreText: {
    color: '#34D399',
    fontSize: 13,
    fontWeight: '600',
  },
  learnMoreIcon: {
    marginLeft: 2,
  },
}); 