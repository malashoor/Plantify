import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  change, 
  changeType = 'neutral',
  icon 
}: StatCardProps) {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive': return '#4CAF50';
      case 'negative': return '#F44336';
      default: return '#666';
    }
  };

  const getChangePrefix = () => {
    if (!change) return '';
    return change > 0 ? '+' : '';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
      </View>
      
      <Text style={styles.value}>{value}</Text>
      
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      
      {change !== undefined && (
        <View style={styles.changeContainer}>
          <Text style={[styles.change, { color: getChangeColor() }]}>
            {getChangePrefix()}{change}%
          </Text>
          <Text style={styles.changeLabel}>vs last period</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  value: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto',
  },
  change: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  changeLabel: {
    fontSize: 12,
    color: '#888',
  },
}); 