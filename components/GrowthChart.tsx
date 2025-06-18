import React from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme } from 'react-native';

interface GrowthDataPoint {
  date: string;
  height: number;
  notes?: string;
  health?: 'excellent' | 'good' | 'fair' | 'poor';
}

interface GrowthChartProps {
  data: GrowthDataPoint[];
  style?: any;
}

// Simple theme helper
const createTheme = (colorScheme: 'light' | 'dark' | null) => ({
  colors: {
    surface: colorScheme === 'dark' ? '#2A2A2A' : '#FFFFFF',
    text: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
    textSecondary: colorScheme === 'dark' ? '#BBBBBB' : '#666666',
    border: colorScheme === 'dark' ? '#444444' : '#E0E0E0',
    primary: '#4CAF50',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
  },
});

const getHealthColor = (health: string | undefined, theme: any) => {
  switch (health) {
    case 'excellent':
      return theme.colors.success;
    case 'good':
      return theme.colors.primary;
    case 'fair':
      return theme.colors.warning;
    case 'poor':
      return theme.colors.error;
    default:
      return theme.colors.textSecondary;
  }
};

export const GrowthChart: React.FC<GrowthChartProps> = ({ data, style }) => {
  const colorScheme = useColorScheme();
  const theme = createTheme(colorScheme);

  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.surface }, style]}>
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
          No growth data available yet. Start tracking your plant's progress!
        </Text>
      </View>
    );
  }

  const maxHeight = Math.max(...data.map(point => point.height));
  const minHeight = Math.min(...data.map(point => point.height));
  const heightRange = maxHeight - minHeight || 1;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }, style]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Growth Progress</Text>

      <View style={styles.chartContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chart}>
            {/* Y-axis labels */}
            <View style={styles.yAxis}>
              <Text style={[styles.axisLabel, { color: theme.colors.textSecondary }]}>
                {maxHeight}cm
              </Text>
              <Text style={[styles.axisLabel, { color: theme.colors.textSecondary }]}>
                {Math.round((maxHeight + minHeight) / 2)}cm
              </Text>
              <Text style={[styles.axisLabel, { color: theme.colors.textSecondary }]}>
                {minHeight}cm
              </Text>
            </View>

            {/* Chart bars */}
            <View style={styles.barsContainer}>
              {data.map((point, index) => {
                const barHeight = ((point.height - minHeight) / heightRange) * 100 || 10;
                return (
                  <View key={index} style={styles.barColumn}>
                    <View style={styles.barContainer}>
                      <View
                        style={[
                          styles.bar,
                          {
                            height: `${barHeight}%`,
                            backgroundColor: getHealthColor(point.health, theme),
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.xAxisLabel, { color: theme.colors.textSecondary }]}>
                      {new Date(point.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                    <Text style={[styles.heightLabel, { color: theme.colors.text }]}>
                      {point.height}cm
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Growth summary */}
      {data.length > 1 && (
        <View style={styles.summary}>
          <Text style={[styles.summaryText, { color: theme.colors.textSecondary }]}>
            Total Growth: {(data[data.length - 1].height - data[0].height).toFixed(1)}cm over{' '}
            {Math.round(
              (new Date(data[data.length - 1].date).getTime() - new Date(data[0].date).getTime()) /
                (1000 * 60 * 60 * 24)
            )}{' '}
            days
          </Text>
        </View>
      )}

      {/* Health legend */}
      <View style={styles.legend}>
        <Text style={[styles.legendTitle, { color: theme.colors.text }]}>Health:</Text>
        <View style={styles.legendItems}>
          {['excellent', 'good', 'fair', 'poor'].map(health => (
            <View key={health} style={styles.legendItem}>
              <View
                style={[styles.legendColor, { backgroundColor: getHealthColor(health, theme) }]}
              />
              <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
                {health}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    fontStyle: 'italic',
    padding: 20,
  },
  chartContainer: {
    marginBottom: 16,
  },
  chart: {
    flexDirection: 'row',
    height: 150,
    minWidth: 300,
  },
  yAxis: {
    width: 50,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 8,
  },
  axisLabel: {
    fontSize: 12,
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
    maxWidth: 60,
  },
  barContainer: {
    height: 100,
    width: 20,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  bar: {
    width: '100%',
    borderRadius: 4,
    minHeight: 4,
  },
  xAxisLabel: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
  },
  heightLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 2,
  },
  summary: {
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  legend: {
    alignItems: 'center',
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  legendItems: {
    flexDirection: 'row',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendColor: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
  },
});
