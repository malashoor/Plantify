import { debounce } from 'lodash';
import { format } from 'date-fns';
import { Text, useTheme } from '@rneui/themed';
import React, { useState, useRef, useCallback, useMemo } from 'react';
import { View, StyleSheet, Dimensions, Modal, TouchableOpacity, Animated, Easing, Platform } from 'react-native';
import { VictoryChart, VictoryLine, VictoryScatter, VictoryAxis, VictoryVoronoiContainer, VictoryTooltip, VictoryTheme } from 'victory-native';
import { LineChart } from 'react-native-chart-kit';

import { useAccessibilityInfo } from '@/hooks/useAccessibilityInfo';
import { ChartDataPoint, ChartDataset } from '@/types';

const ANIMATION_DURATION = 300;

interface DataPoint {
  timestamp: Date;
  value: number;
  label?: string;
  comment?: string;
}

interface InteractiveTrendChartProps {
  datasets: ChartDataset[];
  title: string;
  width?: number;
  height?: number;
  unit?: string;
  useVictory?: boolean; // Whether to use Victory charts or react-native-chart-kit
  bezier?: boolean; // Whether to use bezier curves (smoother) or straight lines
  onPointPress?: (dataPoint: DataPoint) => void;
  testID?: string;
}

export function InteractiveTrendChart({
  datasets,
  title,
  width = Dimensions.get('window').width - 32,
  height = 220,
  unit = '',
  useVictory = true,
  bezier = true,
  onPointPress,
  testID = 'trend-chart',
}: InteractiveTrendChartProps) {
  const { theme } = useTheme();
  const [selectedPoint, setSelectedPoint] = useState<DataPoint | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const { screenReaderEnabled } = useAccessibilityInfo();
  const tooltipOpacity = useRef(new Animated.Value(0)).current;
  const tooltipScale = useRef(new Animated.Value(0.8)).current;
  
  // Handle data preparation for Victory charts
  const victoryData = useMemo(() => {
    return datasets.map(dataset => ({
      dataset: dataset.label,
      data: dataset.data.map(point => ({
        x: point.timestamp,
        y: point.value,
        label: point.label,
        timestamp: point.timestamp,
        dataset: dataset.label,
        comment: (point as any).comment,
      })),
      color: dataset.color,
    }));
  }, [datasets]);

  // Debounced handler for point press
  const handlePointPress = useCallback(
    debounce((point: DataPoint, position: { x: number, y: number }) => {
      setSelectedPoint(point);
      setTooltipPosition(position);
      
      // Animate in
      Animated.parallel([
        Animated.timing(tooltipOpacity, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(tooltipScale, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
      ]).start();
      
      if (onPointPress) {
        onPointPress(point);
      }
    }, 300),
    [tooltipOpacity, tooltipScale, onPointPress]
  );

  // Close tooltip
  const closeTooltip = useCallback(() => {
    Animated.parallel([
      Animated.timing(tooltipOpacity, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(tooltipScale, {
        toValue: 0.8,
        duration: ANIMATION_DURATION,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => setSelectedPoint(null));
  }, [tooltipOpacity, tooltipScale]);

  // Handle accessibility focus changes
  const handleAccessibilityFocus = useCallback((point: DataPoint) => {
    setSelectedPoint(point);
  }, []);

  // If using Victory charts
  if (useVictory) {
    return (
      <View 
        style={styles.container} 
        testID={testID}
        accessibilityLabel={`${title} chart`}
      >
        <Text h4 style={styles.title}>{title}</Text>
        
        <VictoryChart
          width={width}
          height={height}
          theme={VictoryTheme.material}
          containerComponent={
            <VictoryVoronoiContainer
              voronoiDimension="x"
              labels={({ datum }) => `${datum.dataset}: ${datum.y}${unit}`}
              labelComponent={
                <VictoryTooltip
                  flyoutStyle={{
                    fill: theme.colors.grey5,
                    stroke: theme.colors.grey3,
                  }}
                  style={{ fill: theme.colors.white }}
                  constrainToVisibleArea
                />
              }
              events={{
                onTouchStart: (points, props) => {
                  const { x, y } = points.nativeEvent;
                  const point = props.data?.[0];
                  if (point) {
                    handlePointPress({
                      timestamp: point.timestamp,
                      value: point.y,
                      label: point.label,
                      comment: point.comment,
                    }, { x, y });
                  }
                },
              }}
            />
          }
        >
          <VictoryAxis
            tickFormat={(timestamp) => {
              return format(new Date(timestamp), 'MMM d');
            }}
            style={{
              axis: { stroke: theme.colors.grey3 },
              tickLabels: { fill: theme.colors.grey0, fontSize: 10 },
            }}
          />
          <VictoryAxis
            dependentAxis
            style={{
              axis: { stroke: theme.colors.grey3 },
              tickLabels: { fill: theme.colors.grey0, fontSize: 10 },
            }}
          />
          
          {victoryData.map((dataset, index) => (
            <React.Fragment key={`line-${index}`}>
              <VictoryLine
                data={dataset.data}
                interpolation={bezier ? "cardinal" : "linear"}
                style={{
                  data: { stroke: dataset.color, strokeWidth: 2 },
                }}
                animate={{
                  duration: 500,
                  onLoad: { duration: 500 }
                }}
              />
              <VictoryScatter
                data={dataset.data}
                size={({ active }) => active ? 8 : 5}
                style={{
                  data: {
                    fill: dataset.color,
                    stroke: theme.colors.background,
                    strokeWidth: 2,
                  },
                }}
                animate={{
                  duration: 500,
                  onLoad: { duration: 500 }
                }}
              />
            </React.Fragment>
          ))}
        </VictoryChart>
        
        {/* Tooltip Modal - shows when a point is tapped */}
        {selectedPoint && (
          <Modal
            transparent
            visible={!!selectedPoint}
            onRequestClose={closeTooltip}
            animationType="none"
            testID="trendPointPopup"
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={closeTooltip}
            >
              <Animated.View
                style={[
                  styles.tooltipContainer,
                  { 
                    backgroundColor: theme.colors.background,
                    left: tooltipPosition.x - 100, // Center tooltip
                    top: tooltipPosition.y - 120,  // Position above finger
                    opacity: tooltipOpacity,
                    transform: [{ scale: tooltipScale }],
                  }
                ]}
              >
                <Text style={styles.tooltipTitle}>{format(selectedPoint.timestamp, 'MMM d, yyyy – HH:mm')}</Text>
                <Text style={styles.tooltipValue}>
                  {selectedPoint.value}{unit}
                </Text>
                {selectedPoint.comment && (
                  <Text style={styles.tooltipComment}>{selectedPoint.comment}</Text>
                )}
              </Animated.View>
            </TouchableOpacity>
          </Modal>
        )}
      </View>
    );
  }
  
  // If using react-native-chart-kit
  const chartData = {
    labels: datasets[0].data.map(d => format(d.timestamp, 'MMM d')),
    datasets: datasets.map(dataset => ({
      data: dataset.data.map(d => d.value),
      color: () => dataset.color,
      strokeWidth: 2,
    })),
  };

  // Event handler for chart-kit point press
  const handleChartKitPointPress = ({ index, value, dataset }) => {
    // Find the point in our datasets
    if (index >= 0 && index < datasets[dataset].data.length) {
      const point = datasets[dataset].data[index];
      
      // We need to calculate position based on the chart
      // This is approximate - might need adjustment for your specific implementation
      const x = (index / (datasets[dataset].data.length - 1)) * width + 16; // 16 is container padding
      const y = 120; // Rough estimate for where the point might be
      
      handlePointPress({
        timestamp: point.timestamp,
        value: point.value,
        label: point.label,
        comment: (point as any).comment,
      }, { x, y });
    }
  };

  return (
    <View style={styles.container} testID={testID}>
      <Text h4 style={styles.title}>{title}</Text>
      <LineChart
        data={chartData}
        width={width}
        height={height}
        chartConfig={{
          backgroundColor: theme.colors.background,
          backgroundGradientFrom: theme.colors.background,
          backgroundGradientTo: theme.colors.background,
          decimalPlaces: 1,
          color: (opacity = 1) => theme.colors.primary,
          labelColor: (opacity = 1) => theme.colors.grey0,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: theme.colors.primary,
          },
        }}
        bezier={bezier}
        style={styles.chart}
        onDataPointClick={handleChartKitPointPress}
        renderDotContent={({ x, y, index, indexData }) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.touchableDot,
              {
                left: x - 12,
                top: y - 12,
              }
            ]}
            onPress={() => {
              const point = datasets[0].data[index];
              if (point) {
                handlePointPress({
                  timestamp: point.timestamp,
                  value: point.value,
                  label: point.label,
                  comment: (point as any).comment,
                }, { x, y });
              }
            }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Data point for ${format(datasets[0].data[index].timestamp, 'MMM d, yyyy')}, value: ${datasets[0].data[index].value}${unit}`}
          />
        )}
      />
      
      {/* Tooltip Modal - shows when a point is tapped */}
      {selectedPoint && (
        <Modal
          transparent
          visible={!!selectedPoint}
          onRequestClose={closeTooltip}
          animationType="none"
          testID="trendPointPopup"
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={closeTooltip}
          >
            <Animated.View
              style={[
                styles.tooltipContainer,
                { 
                  backgroundColor: theme.colors.background,
                  left: tooltipPosition.x - 100, // Center tooltip
                  top: tooltipPosition.y - 120,  // Position above finger
                  opacity: tooltipOpacity,
                  transform: [{ scale: tooltipScale }],
                }
              ]}
            >
              <Text style={styles.tooltipTitle}>{format(selectedPoint.timestamp, 'MMM d, yyyy – HH:mm')}</Text>
              <Text style={styles.tooltipValue}>
                {selectedPoint.value}{unit}
              </Text>
              {selectedPoint.comment && (
                <Text style={styles.tooltipComment}>{selectedPoint.comment}</Text>
              )}
            </Animated.View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
  title: {
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tooltipContainer: {
    position: 'absolute',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 200,
  },
  tooltipTitle: {
    fontSize: 12,
    marginBottom: 4,
    opacity: 0.8,
  },
  tooltipValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tooltipComment: {
    fontSize: 14,
    marginTop: 4,
  },
  touchableDot: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
}); 