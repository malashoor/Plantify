import React, { useMemo } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useTheme } from '@react-navigation/native';
import { format } from 'date-fns';
import { Text } from '../ui/Text';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Emotion } from '../../services/EmotionService';

interface EmotionTrendChartProps {
  emotions: Emotion[];
  days?: number;
}

const EMOTION_SCORES = {
  joy: 1,
  satisfaction: 0.8,
  curiosity: 0.6,
  neutral: 0.5,
  concern: 0.4,
  frustration: 0.2,
};

const EMOTION_COLORS = {
  joy: '#4CAF50',
  satisfaction: '#8BC34A',
  curiosity: '#03A9F4',
  neutral: '#9E9E9E',
  concern: '#FFC107',
  frustration: '#F44336',
};

export function EmotionTrendChart({ emotions, days = 7 }: EmotionTrendChartProps) {
  const theme = useTheme();
  const { width } = useWindowDimensions();

  const chartData = useMemo(() => {
    // Group emotions by day and calculate average score
    const now = new Date();
    const dayGroups = new Array(days).fill(null).map((_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (days - 1 - i));
      return {
        date,
        emotions: emotions.filter(e => {
          const emotionDate = new Date(e.timestamp);
          return emotionDate.toDateString() === date.toDateString();
        }),
      };
    });

    const data = dayGroups.map(group => {
      if (!group.emotions.length) {
        return {
          date: group.date,
          score: 0.5, // Neutral score for days with no data
          dominantEmotion: 'neutral' as Emotion['type'],
          intensity: 0,
        };
      }

      const scores = group.emotions.map(e => ({
        score: EMOTION_SCORES[e.type],
        intensity: e.intensity,
      }));

      const avgScore = scores.reduce((sum, s) => sum + s.score * s.intensity, 0) / scores.length;
      const avgIntensity = scores.reduce((sum, s) => sum + s.intensity, 0) / scores.length;

      // Find dominant emotion
      const emotionCounts = group.emotions.reduce((acc, e) => {
        acc[e.type] = (acc[e.type] || 0) + 1;
        return acc;
      }, {} as Record<Emotion['type'], number>);

      const dominantEmotion = Object.entries(emotionCounts)
        .reduce((max, [type, count]) => 
          count > (max.count || 0) ? { type, count } : max,
          { type: 'neutral' as Emotion['type'], count: 0 }
        ).type;

      return {
        date: group.date,
        score: avgScore,
        dominantEmotion,
        intensity: avgIntensity,
      };
    });

    return {
      labels: data.map(d => format(d.date, 'EEE')),
      datasets: [{
        data: data.map(d => d.score),
        color: (opacity = 1) => {
          const colors = data.map(d => EMOTION_COLORS[d.dominantEmotion]);
          return opacity === 0 ? colors[0] : colors[data.length - 1];
        },
      }],
      emotions: data,
    };
  }, [emotions, days]);

  const dominantEmotion = useMemo(() => {
    const recentEmotions = chartData.emotions.slice(-3);
    const emotionCounts = recentEmotions.reduce((acc, e) => {
      acc[e.dominantEmotion] = (acc[e.dominantEmotion] || 0) + 1;
      return acc;
    }, {} as Record<Emotion['type'], number>);

    return Object.entries(emotionCounts)
      .reduce((max, [type, count]) => 
        count > (max.count || 0) ? { type, count } : max,
        { type: 'neutral' as Emotion['type'], count: 0 }
      ).type;
  }, [chartData]);

  const trend = useMemo(() => {
    const scores = chartData.emotions.map(e => e.score);
    const recentAvg = scores.slice(-2).reduce((a, b) => a + b, 0) / 2;
    const olderAvg = scores.slice(0, 2).reduce((a, b) => a + b, 0) / 2;
    
    if (recentAvg > olderAvg + 0.1) return 'improving';
    if (recentAvg < olderAvg - 0.1) return 'declining';
    return 'stable';
  }, [chartData]);

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Text variant="h2" style={styles.title}>Emotional Journey</Text>
        <Badge
          label={trend}
          color={
            trend === 'improving' ? EMOTION_COLORS.joy :
            trend === 'declining' ? EMOTION_COLORS.concern :
            EMOTION_COLORS.neutral
          }
        />
      </View>

      <LineChart
        data={chartData}
        width={width - 48} // Account for padding
        height={220}
        chartConfig={{
          backgroundColor: theme.colors.card,
          backgroundGradientFrom: theme.colors.card,
          backgroundGradientTo: theme.colors.card,
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: () => theme.colors.text,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: theme.colors.primary,
          },
        }}
        bezier
        style={styles.chart}
      />

      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          Your plants seem to make you feel{' '}
          <Text style={{ color: EMOTION_COLORS[dominantEmotion] }}>
            {dominantEmotion}
          </Text>
          {' '}lately
        </Text>
        
        <View style={styles.badges}>
          {Object.entries(EMOTION_COLORS).map(([emotion, color]) => (
            <Badge
              key={emotion}
              label={emotion}
              color={color}
              size="small"
              style={styles.badge}
            />
          ))}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginHorizontal: 8,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  summary: {
    marginTop: 16,
  },
  summaryText: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 8,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  badge: {
    marginHorizontal: 4,
  },
}); 