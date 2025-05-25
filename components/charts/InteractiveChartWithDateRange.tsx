import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { DateRangeSelector } from './DateRangeSelector';
import { InteractiveTrendChart } from './InteractiveTrendChart';
import { ChartDataset } from '@/types';
import { useChartData } from '@/hooks/useChartData';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface InteractiveChartWithDateRangeProps<T> {
  data: T[];
  mapFunction: (item: T, index: number) => ChartDataset[];
  title: string;
  unit?: string;
  initialDateRange?: DateRange;
  useVictory?: boolean;
  bezier?: boolean;
  height?: number;
  width?: number;
  testID?: string;
}

export function InteractiveChartWithDateRange<T>({
  data,
  mapFunction,
  title,
  unit = '',
  initialDateRange,
  useVictory = true,
  bezier = true,
  height,
  width,
  testID = 'interactive-chart-with-date-range',
}: InteractiveChartWithDateRangeProps<T>) {
  const [selectedPoint, setSelectedPoint] = useState<any>(null);
  
  const { 
    datasets, 
    dateRange, 
    updateDateRange, 
    isLoading 
  } = useChartData({
    data,
    mapFunction,
    initialDateRange,
  });
  
  const handleRangeSelected = useCallback((range: DateRange) => {
    updateDateRange(range);
  }, [updateDateRange]);
  
  const handlePointPress = useCallback((point: any) => {
    setSelectedPoint(point);
    // Additional handling could go here, like showing more details elsewhere
  }, []);
  
  return (
    <View style={styles.container} testID={testID}>
      <DateRangeSelector
        onRangeSelected={handleRangeSelected}
        initialRange={dateRange}
        testID={`${testID}-date-range`}
      />
      
      {isLoading ? (
        // TODO: Replace with your loading component
        <View style={styles.loadingContainer} />
      ) : datasets.length === 0 ? (
        // TODO: Replace with your empty state component
        <View style={styles.emptyContainer} />
      ) : (
        <InteractiveTrendChart
          datasets={datasets}
          title={title}
          unit={unit}
          useVictory={useVictory}
          bezier={bezier}
          height={height}
          width={width}
          onPointPress={handlePointPress}
          testID={`${testID}-chart`}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    minHeight: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    minHeight: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 