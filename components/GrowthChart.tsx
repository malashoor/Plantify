import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { LineChart, Grid, XAxis, YAxis } from 'react-native-svg-charts';
import { Text } from '@/components/ui/text';
import { Spacing, Colors } from '@/theme';
import type { GrowthPoint } from '@/hooks/useGrowthData';

interface GrowthChartProps {
  data: GrowthPoint[];
  metric?: keyof Omit<GrowthPoint, 'date'>;
}

export function GrowthChart({ data, metric = 'heightCm' }: GrowthChartProps) {
  const values = data.map(point => point[metric] || 0);
  const dates = data.map(point => point.date.slice(5)); // "MM-DD"
  
  const contentInset = { top: 20, bottom: 20, left: 10, right: 10 };
  const chartHeight = 200;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Growth History</Text>
      <View style={styles.chartContainer}>
        <YAxis
          data={values}
          contentInset={contentInset}
          svg={{ fill: Colors.text.secondary, fontSize: 12 }}
          numberOfTicks={5}
          formatLabel={(value: number) => `${value.toFixed(1)}`}
        />
        <View style={styles.chart}>
          <LineChart
            style={{ flex: 1, height: chartHeight }}
            data={values}
            svg={{ stroke: Colors.primary, strokeWidth: 2 }}
            contentInset={contentInset}
            curve={true}
          >
            <Grid />
          </LineChart>
          <XAxis
            style={{ marginTop: 8, height: 30 }}
            data={dates}
            formatLabel={(_: any, idx: number) => dates[idx]}
            contentInset={{ left: 16, right: 16 }}
            svg={{ fontSize: 10, fill: Colors.text.secondary }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.M,
  } as ViewStyle,
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: Spacing.M,
    color: Colors.text.primary,
  },
  chartContainer: {
    flexDirection: 'row',
    height: 250,
  } as ViewStyle,
  chart: {
    flex: 1,
    marginLeft: 8,
  } as ViewStyle,
}); 