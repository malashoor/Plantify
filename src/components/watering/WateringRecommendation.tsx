import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { WateringAdjustment } from '../../services/SmartWateringService';
import { useTranslation } from 'react-i18next';

interface WateringRecommendationProps {
  adjustment: WateringAdjustment;
}

export const WateringRecommendation: React.FC<WateringRecommendationProps> = ({
  adjustment,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const getIcon = () => {
    if (adjustment.shouldSkip) return 'water-off';
    if (adjustment.shouldIncrease) return 'water-plus';
    return 'water-check';
  };

  const getColor = () => {
    if (adjustment.shouldSkip) return theme.colors.error;
    if (adjustment.shouldIncrease) return theme.colors.warning;
    return theme.colors.primary;
  };

  if (!adjustment.recommendation) return null;

  return (
    <Card style={styles.container}>
      <Card.Content style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name={getIcon()}
            size={24}
            color={getColor()}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.recommendation, { color: getColor() }]}>
            {adjustment.recommendation}
          </Text>
          <Text style={styles.reason} variant="bodySmall">
            {adjustment.reason}
          </Text>
          {adjustment.shouldSkip && (
            <Text style={styles.nextDate} variant="bodySmall">
              {t('watering.nextScheduled', {
                date: adjustment.nextWateringDate.toLocaleDateString(),
              })}
            </Text>
          )}
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    marginHorizontal: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  recommendation: {
    fontWeight: '600',
    marginBottom: 4,
  },
  reason: {
    opacity: 0.7,
    marginBottom: 2,
  },
  nextDate: {
    fontStyle: 'italic',
    opacity: 0.6,
  },
}); 