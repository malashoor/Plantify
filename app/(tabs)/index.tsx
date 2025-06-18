import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useProtectedRoute } from '../../hooks/useProtectedRoute';
import { useReminders } from '../../hooks/useReminders';
import { WeatherDisplay } from '@components/WeatherDisplay';
import { WeatherService } from '@services/WeatherService';
import type { WeatherData } from '@services/WeatherService';
import { WeatherAlerts } from '../../src/components/weather/WeatherAlerts';
import { WeatherAlertService } from '../../src/services/WeatherAlertService';
import { useWeather } from '@hooks/useWeather';
import { useSeeds } from '@hooks/useSeeds';

interface Plant {
  id: string;
  name: string;
  type: string;
  health_status: 'healthy' | 'needs_attention' | 'critical';
  last_watered: string;
  next_watering: string;
}

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  created_at: string;
  plant_id?: string;
  plant_name?: string;
}

interface DashboardStats {
  totalPlants: number;
  healthyPlants: number;
  plantsNeedingAttention: number;
  upcomingTasks: number;
  recentEntries: number;
}

export default function Home() {
  const router = useRouter();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalPlants: 0,
    healthyPlants: 0,
    plantsNeedingAttention: 0,
    upcomingTasks: 0,
    recentEntries: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [authUser, setAuthUser] = useState<any>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const { seeds } = useSeeds();

  const { getUpcomingReminders } = useReminders();

  useEffect(() => {
    if (authUser) {
      loadDashboardData();
      loadWeatherData();
    }
  }, [authUser]);

  useEffect(() => {
    if (weather && seeds) {
      WeatherAlertService.checkForAlerts(weather, seeds);
    }
  }, [weather, seeds]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      let plantsData: Plant[] = [];
      let journalData: JournalEntry[] = [];

      // Try to load real data from Supabase
      if (authUser) {
        try {
          const { data, error } = await supabase
            .from('plants')
            .select('*')
            .eq('user_id', authUser.id);

          if (data && !error) {
            plantsData = data.map((plant: any) => ({
              id: plant.id,
              name: plant.name,
              type: plant.type || 'Unknown',
              health_status: plant.health_status || 'healthy',
              last_watered: plant.last_watered || new Date().toISOString().split('T')[0],
              next_watering: plant.next_watering || new Date().toISOString().split('T')[0],
            }));
          }
        } catch (dbError) {
          console.log('Plants table not found, using mock data');
        }
      }

      // Fall back to mock data if no real data or database doesn't exist
      if (plantsData.length === 0) {
        plantsData = [
          {
            id: '1',
            name: 'Spider Plant',
            type: 'Houseplant',
            health_status: 'healthy',
            last_watered: '2024-06-03',
            next_watering: '2024-06-05',
          },
          {
            id: '2',
            name: 'Basil',
            type: 'Herb',
            health_status: 'needs_attention',
            last_watered: '2024-06-01',
            next_watering: '2024-06-04',
          },
          {
            id: '3',
            name: 'Tomato Plant',
            type: 'Vegetable',
            health_status: 'healthy',
            last_watered: '2024-06-03',
            next_watering: '2024-06-06',
          },
        ];
      }

      // Load journal entries
      if (authUser) {
        try {
          const { data: journalData, error: journalError } = await supabase
            .from('journal_entries')
            .select('*')
            .eq('user_id', authUser.id)
            .order('created_at', { ascending: false })
            .limit(5);

          if (journalData && !journalError) {
            setJournalEntries(journalData);
          }
        } catch (journalErr) {
          console.log('Journal entries table not found, using empty data');
          setJournalEntries([]);
        }
      }

      setPlants(plantsData);

      // Calculate stats
      const totalPlants = plantsData.length;
      const healthyPlants = plantsData.filter(p => p.health_status === 'healthy').length;
      const plantsNeedingAttention = plantsData.filter(p => p.health_status !== 'healthy').length;

      // Get upcoming reminders from hook
      const upcomingReminders = getUpcomingReminders(7);
      const upcomingTasksCount = upcomingReminders.length;

      setStats({
        totalPlants,
        healthyPlants,
        plantsNeedingAttention,
        upcomingTasks: upcomingTasksCount,
        recentEntries: journalEntries.length,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadWeatherData = async () => {
    try {
      const weatherData = await WeatherService.getCurrentWeather();
      setWeather(weatherData);
    } catch (error) {
      console.error('Error loading weather data:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return { name: 'eco', color: '#4CAF50' };
      case 'needs_attention':
        return { name: 'warning', color: '#FF9800' };
      case 'critical':
        return { name: 'error', color: '#F44336' };
      default:
        return { name: 'help', color: '#666' };
    }
  };

  const quickActions = [
    { id: 'add-plant', title: 'Add Plant', icon: 'add', onPress: () => router.push('/plants/new') },
    {
      id: 'identify',
      title: 'Identify Plant',
      icon: 'camera-alt',
      onPress: () => router.push('/identify'),
    },
    {
      id: 'care-tips',
      title: 'Care Tips',
      icon: 'lightbulb',
      onPress: () => Alert.alert('Feature', 'Care tips coming soon!'),
    },
    { id: 'journal', title: 'Journal', icon: 'book', onPress: () => router.push('/journal') },
  ];

  if (loading || authLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text>Loading your garden...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#4CAF50" />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning! 🌱</Text>
            <Text style={styles.userName}>
              {authUser?.user_metadata?.full_name || 'Garden Enthusiast'}
            </Text>
          </View>
          <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/settings')}>
            <MaterialIcons name="person" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Weather Display */}
        {weather && (
          <View style={styles.weatherContainer}>
            <WeatherDisplay weather={weather} compact />
          </View>
        )}

        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalPlants}</Text>
            <Text style={styles.statLabel}>Total Plants</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#4CAF50' }]}>{stats.healthyPlants}</Text>
            <Text style={styles.statLabel}>Healthy</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#FF9800' }]}>
              {stats.plantsNeedingAttention}
            </Text>
            <Text style={styles.statLabel}>Need Care</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.upcomingTasks}</Text>
            <Text style={styles.statLabel}>Tasks</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map(action => (
              <TouchableOpacity key={action.id} style={styles.actionCard} onPress={action.onPress}>
                <MaterialIcons name={action.icon as any} size={32} color="#4CAF50" />
                <Text style={styles.actionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* My Plants */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Plants</Text>
            <TouchableOpacity onPress={() => router.push('/plants')}>
              <Text style={styles.seeAllButton}>See All</Text>
            </TouchableOpacity>
          </View>

          {plants.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="local-florist" size={48} color="#ccc" />
              <Text style={styles.emptyStateTitle}>No plants yet</Text>
              <Text style={styles.emptyStateDescription}>
                Add your first plant to start your growing journey! 🌱
              </Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => router.push('/plants/new')}
              >
                <Text style={styles.emptyStateButtonText}>Add Plant</Text>
              </TouchableOpacity>
            </View>
          ) : (
            plants.map(plant => {
              const healthIcon = getHealthIcon(plant.health_status);
              return (
                <TouchableOpacity
                  key={plant.id}
                  style={styles.plantCard}
                  onPress={() => router.push(`/plants/${plant.id}`)}
                >
                  <View style={styles.plantIcon}>
                    <MaterialIcons name="local-florist" size={24} color="#4CAF50" />
                  </View>
                  <View style={styles.plantInfo}>
                    <Text style={styles.plantName}>{plant.name}</Text>
                    <Text style={styles.plantType}>{plant.type}</Text>
                    <Text style={styles.plantDetails}>Next watering: {plant.next_watering}</Text>
                  </View>
                  <MaterialIcons name={healthIcon.name as any} size={24} color={healthIcon.color} />
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Recent Journal Entries */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Journal Entries</Text>
            <TouchableOpacity onPress={() => router.push('/journal')}>
              <Text style={styles.seeAllButton}>See All</Text>
            </TouchableOpacity>
          </View>

          {journalEntries.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="book" size={48} color="#ccc" />
              <Text style={styles.emptyStateTitle}>No journal entries yet</Text>
              <Text style={styles.emptyStateDescription}>
                Start documenting your growing journey! 📓
              </Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => router.push('/journal/new')}
              >
                <Text style={styles.emptyStateButtonText}>Add Entry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            journalEntries.slice(0, 3).map(entry => (
              <TouchableOpacity
                key={entry.id}
                style={styles.journalCard}
                onPress={() => router.push(`/journal/${entry.id}`)}
              >
                <View style={styles.journalIcon}>
                  <MaterialIcons name="book" size={24} color="#4CAF50" />
                </View>
                <View style={styles.journalInfo}>
                  <Text style={styles.journalTitle}>{entry.title}</Text>
                  <Text style={styles.journalContent} numberOfLines={2}>
                    {entry.content}
                  </Text>
                  <Text style={styles.journalDate}>
                    {new Date(entry.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        <WeatherAlerts />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  greeting: {
    fontSize: 16,
    color: '#666',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 8,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllButton: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  plantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
  },
  plantIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e8f5e8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  plantInfo: {
    flex: 1,
  },
  plantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  plantType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  plantDetails: {
    fontSize: 12,
    color: '#888',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  emptyStateButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  journalCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
  },
  journalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e8f5e8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  journalInfo: {
    flex: 1,
  },
  journalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  journalContent: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 18,
  },
  journalDate: {
    fontSize: 12,
    color: '#888',
  },
  weatherContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
});
