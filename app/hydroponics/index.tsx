import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Simple theme object
const createTheme = (colorScheme: 'light' | 'dark' | null) => ({
  colors: {
    primary: '#4CAF50',
    primaryDark: '#388E3C',
    background: colorScheme === 'dark' ? '#121212' : '#FFFFFF',
    surface: colorScheme === 'dark' ? '#1E1E1E' : '#F8F9FA',
    text: colorScheme === 'dark' ? '#FFFFFF' : '#212121',
    textSecondary: colorScheme === 'dark' ? '#AAAAAA' : '#757575',
    border: colorScheme === 'dark' ? '#333333' : '#E0E0E0',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
  }
});

interface HydroponicSystem {
  id: string;
  name: string;
  type: string;
  notes: string;
  createdAt: Date;
  status: 'active' | 'maintenance' | 'inactive';
}

const STORAGE_KEY = '@greensai_hydroponic_systems';

export default function HydroponicsScreen() {
  const colorScheme = useColorScheme();
  const theme = createTheme(colorScheme);
  const router = useRouter();
  const [systems, setSystems] = useState<HydroponicSystem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSystems();
  }, []);

  const loadSystems = async () => {
    try {
      setIsLoading(true);
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const systemsWithDates = parsed.map((system: any) => ({
          ...system,
          createdAt: new Date(system.createdAt),
        }));
        setSystems(systemsWithDates);
      }
    } catch (error) {
      console.error('Error loading systems:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSystems();
    setRefreshing(false);
  };

  const getSystemIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'nft': return 'water';
      case 'dwc': return 'flask';
      case 'wick': return 'leaf';
      case 'ebb and flow': return 'repeat';
      case 'aeroponics': return 'cloud';
      default: return 'hardware-chip';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return theme.colors.success;
      case 'maintenance': return theme.colors.warning;
      case 'inactive': return theme.colors.textSecondary;
      default: return theme.colors.textSecondary;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Hydroponics</Text>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => router.push('/hydroponics/new')}
        >
          <Ionicons name="add" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Ionicons name="hardware-chip" size={24} color={theme.colors.primary} />
            <Text style={[styles.statNumber, { color: theme.colors.text }]}>{systems.length}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Total Systems</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
            <Text style={[styles.statNumber, { color: theme.colors.text }]}>
              {systems.filter(s => s.status === 'active').length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Active</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Ionicons name="construct" size={24} color={theme.colors.warning} />
            <Text style={[styles.statNumber, { color: theme.colors.text }]}>
              {systems.filter(s => s.status === 'maintenance').length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Maintenance</Text>
          </View>
        </View>

        {/* Systems List */}
        {systems.length > 0 ? (
          <View style={styles.systemsList}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Your Systems ({systems.length})
            </Text>
            {systems.map((system) => (
              <View
                key={system.id}
                style={[styles.systemCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              >
                <View style={styles.systemHeader}>
                  <View style={styles.systemTitleRow}>
                    <Ionicons
                      name={getSystemIcon(system.type)}
                      size={20}
                      color={theme.colors.primary}
                      style={styles.systemIcon}
                    />
                    <Text style={[styles.systemName, { color: theme.colors.text }]}>{system.name}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(system.status) }]}>
                    <Text style={styles.statusText}>{system.status}</Text>
                  </View>
                </View>

                <View style={styles.systemDetails}>
                  <Text style={[styles.systemType, { color: theme.colors.textSecondary }]}>
                    Type: {system.type}
                  </Text>
                  <Text style={[styles.systemDate, { color: theme.colors.textSecondary }]}>
                    Created: {formatDate(system.createdAt)}
                  </Text>
                </View>

                {system.notes && (
                  <Text style={[styles.systemNotes, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                    {system.notes}
                  </Text>
                )}

                <View style={styles.systemActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                    onPress={() => router.push(`/hydroponics/${system.id}`)}
                  >
                    <Ionicons name="eye" size={14} color="white" />
                    <Text style={styles.actionButtonText}>View</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.colors.textSecondary }]}
                    onPress={() => router.push(`/hydroponics/${system.id}/edit`)}
                  >
                    <Ionicons name="create" size={14} color="white" />
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : (
          /* Empty State */
          <View style={styles.emptyState}>
            <Ionicons name="hardware-chip-outline" size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyStateTitle, { color: theme.colors.text }]}>
              No Hydroponic Systems
            </Text>
            <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
              Create your first hydroponic system to start monitoring and managing your setup.
            </Text>
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => router.push('/hydroponics/new')}
            >
              <Ionicons name="add" size={20} color="white" style={styles.createButtonIcon} />
              <Text style={styles.createButtonText}>Create First System</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Tips */}
        <View style={[styles.tipsCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.tipsTitle, { color: theme.colors.text }]}>Hydroponic Tips</Text>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Ionicons name="water" size={16} color={theme.colors.primary} />
              <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
                Monitor pH levels regularly (5.5-6.5 for most plants)
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="leaf" size={16} color={theme.colors.primary} />
              <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
                Check nutrient solution concentration weekly
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="sunny" size={16} color={theme.colors.primary} />
              <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
                Ensure adequate lighting (12-16 hours for leafy greens)
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      {systems.length > 0 && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          onPress={() => router.push('/hydroponics/new')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    paddingTop: 50,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  systemsList: {
    marginBottom: 24,
  },
  systemCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  systemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  systemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  systemIcon: {
    marginRight: 8,
  },
  systemName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  systemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  systemType: {
    fontSize: 14,
  },
  systemDate: {
    fontSize: 14,
  },
  systemNotes: {
    fontSize: 14,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  systemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  createButtonIcon: {
    marginRight: 8,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  tipsCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tipText: {
    fontSize: 14,
    flex: 1,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
