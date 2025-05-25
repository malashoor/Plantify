import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Line, Path, Text as SvgText } from 'react-native-svg';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { Text } from '@/components/ui/text';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';
import type { GrowthRecord } from '@/types/plant-growth';

type GrowthChartProps = {
  data: GrowthRecord[] | null;
  isLoading: boolean;
  error: Error | null;
  onRetry?: () => void;
  testID?: string;
};

export const GrowthChart = ({
  data,
  isLoading,
  error,
  onRetry,
  testID,
}: GrowthChartProps): JSX.Element => {
  const chartWidth = Dimensions.get('window').width - Spacing.LG * 2;
  const chartHeight = 220;
  const padding = 40;

  if (isLoading) {
    return <LoadingState message="Loading growth data..." />;
  }

  if (error) {
    return <ErrorState message={error.message} onRetry={onRetry} />;
  }

  if (!data?.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No growth data available</Text>
      </View>
    );
  }

  const maxHeight = Math.max(...data.map(record => record.heightCm));
  const maxLeaves = Math.max(...data.map(record => record.leafCount));
  const xStep = (chartWidth - padding * 2) / (data.length - 1);
  const yScale = (chartHeight - padding * 2) / Math.max(maxHeight, maxLeaves);

  const heightPoints = data.map((record, index) => ({
    x: padding + index * xStep,
    y: chartHeight - padding - record.heightCm * yScale,
  }));

  const leafPoints = data.map((record, index) => ({
    x: padding + index * xStep,
    y: chartHeight - padding - record.leafCount * yScale,
  }));

  const heightPath = heightPoints
    .map((point, index) => (index === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`))
    .join(' ');

  const leafPath = leafPoints
    .map((point, index) => (index === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`))
    .join(' ');

  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.title}>Growth History</Text>
      <Svg width={chartWidth} height={chartHeight}>
        {/* Grid lines */}
        {[...Array(5)].map((_, i) => (
          <Line
            key={`grid-${i}`}
            x1={padding}
            y1={padding + (chartHeight - padding * 2) * (i / 4)}
            x2={chartWidth - padding}
            y2={padding + (chartHeight - padding * 2) * (i / 4)}
            stroke={Colors.Border}
            strokeWidth="1"
            strokeDasharray="5,5"
          />
        ))}

        {/* Height line */}
        <Path
          d={heightPath}
          stroke={Colors.Primary}
          strokeWidth="2"
          fill="none"
        />

        {/* Leaf count line */}
        <Path
          d={leafPath}
          stroke={Colors.Indicator.Success}
          strokeWidth="2"
          fill="none"
        />

        {/* Labels */}
        {data.map((record, index) => (
          <SvgText
            key={`label-${index}`}
            x={padding + index * xStep}
            y={chartHeight - 10}
            fontSize="10"
            fill={Colors.Text.Secondary}
            textAnchor="middle"
          >
            {new Date(record.date).toLocaleDateString()}
          </SvgText>
        ))}
      </Svg>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: Colors.Primary }]} />
          <Text style={styles.legendText}>Height (cm)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: Colors.Indicator.Success }]} />
          <Text style={styles.legendText}>Leaf Count</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.MD,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.Text.Primary,
    marginBottom: Spacing.MD,
  },
  emptyContainer: {
    padding: Spacing.LG,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.Text.Secondary,
    textAlign: 'center',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.MD,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.SM,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.XS,
  },
  legendText: {
    fontSize: 12,
    color: Colors.Text.Secondary,
  },
}); 