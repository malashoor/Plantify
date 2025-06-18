import React from 'react';
import { View, Text, StyleSheet, useColorScheme, ScrollView, Dimensions } from 'react-native';

interface Measurement {
  id: string;
  ph_level: number;
  ec_level: number;
  water_temperature: number;
  measured_at: string;
}

interface NutrientChartProps {
  measurements: Measurement[];
  type: 'nutrients' | 'ph' | 'ec' | 'temperature';
  title: string;
}

const createTheme = (colorScheme: 'light' | 'dark' | null) => ({
  colors: {
    background: colorScheme === 'dark' ? '#1E1E1E' : '#FFFFFF',
    surface: colorScheme === 'dark' ? '#2A2A2A' : '#FFFFFF',
    text: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
    textSecondary: colorScheme === 'dark' ? '#BBBBBB' : '#666666',
    primary: '#4CAF50',
    border: colorScheme === 'dark' ? '#444444' : '#E0E0E0',
    chartLine: '#4CAF50',
    chartDot: '#2196F3',
  },
});

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 64; // Account for padding
const chartHeight = 200;

export const NutrientChart: React.FC<NutrientChartProps> = ({ measurements, type, title }) => {
  const colorScheme = useColorScheme();
  const theme = createTheme(colorScheme);

  const getValue = (measurement: Measurement) => {
    switch (type) {
      case 'ph':
        return measurement.ph_level;
      case 'ec':
        return measurement.ec_level;
      case 'temperature':
        return measurement.water_temperature;
      case 'nutrients':
        return measurement.ec_level; // Using EC as nutrient indicator
      default:
        return 0;
    }
  };

  const getUnit = () => {
    switch (type) {
      case 'ph':
        return '';
      case 'ec':
        return 'mS/cm';
      case 'temperature':
        return '°C';
      case 'nutrients':
        return 'mS/cm';
      default:
        return '';
    }
  };

  const getIdealRange = () => {
    switch (type) {
      case 'ph':
        return { min: 5.5, max: 6.5, color: '#4CAF50' };
      case 'ec':
        return { min: 1.2, max: 2.0, color: '#2196F3' };
      case 'temperature':
        return { min: 18, max: 24, color: '#FF9800' };
      case 'nutrients':
        return { min: 1.2, max: 2.0, color: '#9C27B0' };
      default:
        return { min: 0, max: 10, color: '#4CAF50' };
    }
  };

  if (measurements.length === 0) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        ]}
      >
        <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
        <View style={styles.noDataContainer}>
          <Text style={[styles.noDataText, { color: theme.colors.textSecondary }]}>
            No data available
          </Text>
        </View>
      </View>
    );
  }

  // Get last 10 measurements for the chart
  const recentMeasurements = measurements.slice(-10);
  const values = recentMeasurements.map(getValue);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1;
  const idealRange = getIdealRange();

  // Simple line chart implementation
  const renderChart = () => {
    const points = recentMeasurements.map((measurement, index) => {
      const value = getValue(measurement);
      const x = (index / (recentMeasurements.length - 1)) * chartWidth;
      const y = chartHeight - ((value - minValue) / range) * chartHeight;

      return { x, y, value, date: measurement.measured_at };
    });

    return (
      <View style={[styles.chartContainer, { width: chartWidth, height: chartHeight }]}>
        {/* Background grid */}
        <View style={styles.gridContainer}>
          {[0, 1, 2, 3, 4].map(i => (
            <View
              key={i}
              style={[
                styles.gridLine,
                {
                  top: (i / 4) * chartHeight,
                  backgroundColor: theme.colors.border,
                },
              ]}
            />
          ))}
        </View>

        {/* Ideal range indicator */}
        {minValue <= idealRange.max && maxValue >= idealRange.min && (
          <View
            style={[
              styles.idealRange,
              {
                top: Math.max(0, chartHeight - ((idealRange.max - minValue) / range) * chartHeight),
                height: Math.abs(((idealRange.max - idealRange.min) / range) * chartHeight),
                backgroundColor: idealRange.color + '20',
              },
            ]}
          />
        )}

        {/* Data points and line */}
        <View style={styles.lineContainer}>
          {points.map((point, index) => (
            <React.Fragment key={index}>
              {/* Line to next point */}
              {index < points.length - 1 && (
                <View
                  style={[
                    styles.line,
                    {
                      left: point.x,
                      top: point.y,
                      width: Math.sqrt(
                        Math.pow(points[index + 1].x - point.x, 2) +
                          Math.pow(points[index + 1].y - point.y, 2)
                      ),
                      transform: [
                        {
                          rotate: `${Math.atan2(
                            points[index + 1].y - point.y,
                            points[index + 1].x - point.x
                          )}rad`,
                        },
                      ],
                      backgroundColor: theme.colors.chartLine,
                    },
                  ]}
                />
              )}

              {/* Data point */}
              <View
                style={[
                  styles.dataPoint,
                  {
                    left: point.x - 3,
                    top: point.y - 3,
                    backgroundColor: theme.colors.chartDot,
                  },
                ]}
              />
            </React.Fragment>
          ))}
        </View>

        {/* Y-axis labels */}
        <View style={styles.yAxisLabels}>
          {[maxValue, (maxValue + minValue) / 2, minValue].map((value, index) => (
            <Text
              key={index}
              style={[
                styles.yAxisLabel,
                {
                  color: theme.colors.textSecondary,
                  top: (index / 2) * chartHeight - 8,
                },
              ]}
            >
              {value.toFixed(1)}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  const latestValue = getValue(recentMeasurements[recentMeasurements.length - 1]);
  const isInRange = latestValue >= idealRange.min && latestValue <= idealRange.max;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
        <View style={styles.currentValue}>
          <Text
            style={[styles.valueText, { color: isInRange ? idealRange.color : theme.colors.text }]}
          >
            {latestValue.toFixed(1)} {getUnit()}
          </Text>
          <Text style={[styles.statusText, { color: isInRange ? idealRange.color : '#FF5722' }]}>
            {isInRange ? 'Optimal' : 'Needs attention'}
          </Text>
        </View>
      </View>

      {renderChart()}

      <View style={styles.footer}>
        <Text style={[styles.rangeText, { color: theme.colors.textSecondary }]}>
          Ideal range: {idealRange.min} - {idealRange.max} {getUnit()}
        </Text>
        <Text style={[styles.countText, { color: theme.colors.textSecondary }]}>
          Showing last {recentMeasurements.length} measurements
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  currentValue: {
    alignItems: 'flex-end',
  },
  valueText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  chartContainer: {
    position: 'relative',
    marginVertical: 16,
  },
  gridContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
  },
  idealRange: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderRadius: 4,
  },
  lineContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  line: {
    position: 'absolute',
    height: 2,
    transformOrigin: 'left center',
  },
  dataPoint: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  yAxisLabels: {
    position: 'absolute',
    left: -40,
    top: 0,
    bottom: 0,
  },
  yAxisLabel: {
    position: 'absolute',
    fontSize: 10,
    textAlign: 'right',
    width: 35,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  rangeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  countText: {
    fontSize: 12,
  },
  noDataContainer: {
    height: chartHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 14,
  },
});
