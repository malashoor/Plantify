import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { useEmotions } from '../../hooks/useEmotions';
import { EmotionTrendChart } from '../../components/insights/EmotionTrendChart';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export function EmotionalInsightsScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const { emotions, isLoading, error } = useEmotions({
    userId: user?.id || '',
    days: 7,
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading your emotional journey...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text>Failed to load emotional insights</Text>
        <Text variant="caption" style={{ color: theme.colors.error }}>
          {error.message}
        </Text>
      </View>
    );
  }

  if (!emotions.length) {
    return (
      <View style={styles.container}>
        <Text>Start interacting with your plants to see your emotional journey!</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <EmotionTrendChart emotions={emotions} />

      <Card style={styles.insightsCard}>
        <Text variant="h2" style={styles.title}>
          Your Plant Care Style
        </Text>

        <View style={styles.insightRow}>
          <Badge label="Communication" color="#4CAF50" size="small" />
          <Text style={styles.insightText}>
            You express {emotions.length} emotions about your plants this week
          </Text>
        </View>

        <View style={styles.insightRow}>
          <Badge label="Engagement" color="#03A9F4" size="small" />
          <Text style={styles.insightText}>
            You check on your plants {Math.round(emotions.length / 7)} times per day
          </Text>
        </View>

        <View style={styles.insightRow}>
          <Badge label="Consistency" color="#9C27B0" size="small" />
          <Text style={styles.insightText}>
            You're most active with your plants in the {getMostActiveTime(emotions)}
          </Text>
        </View>
      </Card>

      <Card style={styles.tipsCard}>
        <Text variant="h2" style={styles.title}>
          Personalized Tips
        </Text>
        {generateTips(emotions).map((tip, index) => (
          <View key={index} style={styles.tipRow}>
            <Text style={styles.tipNumber}>{index + 1}</Text>
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}

function getMostActiveTime(emotions: Emotion[]): string {
  const hours = emotions.map(e => new Date(e.timestamp).getHours());
  const periods = {
    morning: hours.filter(h => h >= 5 && h < 12).length,
    afternoon: hours.filter(h => h >= 12 && h < 17).length,
    evening: hours.filter(h => h >= 17 && h < 22).length,
    night: hours.filter(h => h >= 22 || h < 5).length,
  };

  return Object.entries(periods).reduce(
    (max, [period, count]) => (count > max.count ? { period, count } : max),
    { period: 'morning', count: 0 }
  ).period;
}

function generateTips(emotions: Emotion[]): string[] {
  const tips: string[] = [];

  // Add tips based on emotional patterns
  const recentEmotions = emotions.slice(-3);
  const hasNegativeEmotions = recentEmotions.some(e => ['concern', 'frustration'].includes(e.type));
  const hasPositiveEmotions = recentEmotions.some(e => ['joy', 'satisfaction'].includes(e.type));

  if (hasNegativeEmotions) {
    tips.push('Try setting reminders for regular plant care to reduce stress and worry.');
    tips.push("Consider keeping a plant care journal to track what works and what doesn't.");
  }

  if (hasPositiveEmotions) {
    tips.push('Share your plant success stories with the community to inspire others!');
    tips.push("Document your thriving plants - it's great to look back on their progress.");
  }

  // Add general tips
  tips.push("Spend a few mindful minutes with your plants each day - it's good for both of you.");

  return tips;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  insightsCard: {
    marginTop: 16,
  },
  title: {
    marginBottom: 16,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightText: {
    flex: 1,
    marginLeft: 12,
  },
  tipsCard: {
    marginTop: 16,
  },
  tipRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tipNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 12,
    fontWeight: '600',
  },
  tipText: {
    flex: 1,
  },
});
