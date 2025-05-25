import {
  Shield,
  Users,
  TriangleAlert as AlertTriangle,
  ChartBar as BarChart,
  Settings,
} from 'lucide-react-native';
import React, { useState, useEffect } from 'react';

import { hasPermission, exportAnalytics } from '@/utils/admin';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';


export default function AdminDashboard() {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const perms = [];
    for (const perm of ['read_content', 'moderate_content', 'read_analytics']) {
      if (await hasPermission(perm)) {
        perms.push(perm);
      }
    }
    setPermissions(perms);
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading admin dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Shield size={24} color="#2E7D32" />
        <Text style={styles.title}>Admin Dashboard</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Users size={20} color="#2E7D32" />
          <Text style={styles.statValue}>1,234</Text>
          <Text style={styles.statLabel}>Active Users</Text>
        </View>

        <View style={styles.statCard}>
          <AlertTriangle size={20} color="#E53935" />
          <Text style={styles.statValue}>23</Text>
          <Text style={styles.statLabel}>Reports</Text>
        </View>

        <View style={styles.statCard}>
          <BarChart size={20} color="#1976D2" />
          <Text style={styles.statValue}>89%</Text>
          <Text style={styles.statLabel}>Growth</Text>
        </View>
      </View>

      {permissions.includes('moderate_content') && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Content Moderation</Text>
          <View style={styles.actionCard}>
            <Text style={styles.actionTitle}>Pending Reports</Text>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Review Reports</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {permissions.includes('read_analytics') && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Analytics</Text>
          <View style={styles.actionCard}>
            <Text style={styles.actionTitle}>Monthly Report</Text>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => exportAnalytics('2025-03-01', '2025-03-31')}
            >
              <Text style={styles.actionButtonText}>Export Report</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.settingsButton}>
        <Settings size={20} color="#2E7D32" />
        <Text style={styles.settingsButtonText}>Admin Settings</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
    color: '#333333',
    fontFamily: 'Poppins-Bold',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'Poppins-Regular',
  },
  statsGrid: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
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
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 8,
    marginBottom: 4,
    fontFamily: 'Poppins-Bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    fontFamily: 'Poppins-Regular',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
    fontFamily: 'Poppins-Bold',
  },
  actionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
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
  actionTitle: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 12,
    fontFamily: 'Poppins-Medium',
  },
  actionButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    margin: 20,
    padding: 16,
    borderRadius: 12,
  },
  settingsButtonText: {
    color: '#2E7D32',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    fontFamily: 'Poppins-Bold',
  },
});
