import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

interface ChartData {
  labels: string[];
  datasets: Array<{
    data: number[];
    color?: string;
  }>;
}

interface ChartPanelProps {
  title: string;
  data: ChartData;
  type?: 'line' | 'bar';
}

export function ChartPanel({ title, data, type = 'line' }: ChartPanelProps) {
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 64; // Account for padding

  // Simple bar visualization for now
  const maxValue = Math.max(...data.datasets[0]?.data || [0]);
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      
      <View style={styles.chartContainer}>
        {data.labels.map((label, index) => {
          const value = data.datasets[0]?.data[index] || 0;
          const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
          
          return (
            <View key={index} style={styles.barContainer}>
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${height}%`,
                      backgroundColor: data.datasets[0]?.color || '#4CAF50',
                    },
                  ]}
                />
              </View>
              <Text style={styles.barLabel}>{label}</Text>
              <Text style={styles.barValue}>{value}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 150,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  barWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%',
  },
  bar: {
    width: '100%',
    borderRadius: 4,
    minHeight: 2,
  },
  barLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  barValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginTop: 2,
    textAlign: 'center',
  },
}); 