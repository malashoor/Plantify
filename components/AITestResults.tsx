import {
  Activity,
  Server,
  Users,
  TriangleAlert as AlertTriangle,
} from 'lucide-react-native';
import React from 'react';

import type { StressTestResult } from '@/utils/testing';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';


interface Props {
  highVolumeResults: StressTestResult;
  lowBandwidthResults: StressTestResult;
  multiUserResults: StressTestResult;
}

export default function AITestResults({
  highVolumeResults,
  lowBandwidthResults,
  multiUserResults,
}: Props) {
  const getStatusColor = (result: StressTestResult) => {
    if (!result.success) return '#F44336';
    if (result.errorRate > 0.1) return '#FFC107';
    return '#4CAF50';
  };

  const formatDuration = (ms: number) => {
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatMemory = (bytes: number) => {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Activity size={24} color="#2E7D32" />
        <Text style={styles.title}>AI System Test Results</Text>
      </View>

      <View style={styles.resultCard}>
        <View style={styles.cardHeader}>
          <Server size={20} color="#2E7D32" />
          <Text style={styles.cardTitle}>High Volume Test</Text>
        </View>

        <View
          style={[
            styles.statusIndicator,
            { backgroundColor: getStatusColor(highVolumeResults) },
          ]}
        >
          <Text style={styles.statusText}>
            {highVolumeResults.success ? 'PASSED' : 'FAILED'}
          </Text>
        </View>

        <View style={styles.metrics}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Response Time</Text>
            <Text style={styles.metricValue}>
              {formatDuration(highVolumeResults.averageResponseTime)}
            </Text>
          </View>

          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Error Rate</Text>
            <Text style={styles.metricValue}>
              {(highVolumeResults.errorRate * 100).toFixed(1)}%
            </Text>
          </View>

          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Memory Usage</Text>
            <Text style={styles.metricValue}>
              {formatMemory(highVolumeResults.memoryUsage)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.resultCard}>
        <View style={styles.cardHeader}>
          <AlertTriangle size={20} color="#2E7D32" />
          <Text style={styles.cardTitle}>Low Bandwidth Test</Text>
        </View>

        <View
          style={[
            styles.statusIndicator,
            { backgroundColor: getStatusColor(lowBandwidthResults) },
          ]}
        >
          <Text style={styles.statusText}>
            {lowBandwidthResults.success ? 'PASSED' : 'FAILED'}
          </Text>
        </View>

        <View style={styles.metrics}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Response Time</Text>
            <Text style={styles.metricValue}>
              {formatDuration(lowBandwidthResults.averageResponseTime)}
            </Text>
          </View>

          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Failed Requests</Text>
            <Text style={styles.metricValue}>
              {lowBandwidthResults.failedRequests}
            </Text>
          </View>

          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Total Requests</Text>
            <Text style={styles.metricValue}>
              {lowBandwidthResults.totalRequests}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.resultCard}>
        <View style={styles.cardHeader}>
          <Users size={20} color="#2E7D32" />
          <Text style={styles.cardTitle}>Multi-User Test</Text>
        </View>

        <View
          style={[
            styles.statusIndicator,
            { backgroundColor: getStatusColor(multiUserResults) },
          ]}
        >
          <Text style={styles.statusText}>
            {multiUserResults.success ? 'PASSED' : 'FAILED'}
          </Text>
        </View>

        <View style={styles.metrics}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Response Time</Text>
            <Text style={styles.metricValue}>
              {formatDuration(multiUserResults.averageResponseTime)}
            </Text>
          </View>

          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Error Rate</Text>
            <Text style={styles.metricValue}>
              {(multiUserResults.errorRate * 100).toFixed(1)}%
            </Text>
          </View>

          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Memory Usage</Text>
            <Text style={styles.metricValue}>
              {formatMemory(multiUserResults.memoryUsage)}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
    color: '#333333',
    fontFamily: 'Poppins-Bold',
  },
  resultCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#333333',
    fontFamily: 'Poppins-Bold',
  },
  statusIndicator: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  metrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metric: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
    fontFamily: 'Poppins-Regular',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    fontFamily: 'Poppins-Bold',
  },
});
