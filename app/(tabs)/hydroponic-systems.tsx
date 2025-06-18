import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTranslation } from '../../src/utils/i18n';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  useColorScheme,
  Platform,
} from 'react-native';

export default function HydroponicSystemsScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [activeTab, setActiveTab] = useState('systems');

  const hydroponicSystems = [
    {
      id: 1,
      name: 'Kitchen Herbs System',
      type: 'Deep Water Culture',
      plants: 6,
      lastChecked: '2 hours ago',
      status: 'optimal',
      image:
        'https://images.unsplash.com/photo-1585502897150-3a5e3d6d9b76?q=80&w=1974&auto=format&fit=crop',
    },
    {
      id: 2,
      name: 'Lettuce Tower',
      type: 'Nutrient Film Technique',
      plants: 12,
      lastChecked: '1 day ago',
      status: 'warning',
      image:
        'https://images.unsplash.com/photo-1595511890410-3b8dc22e3a38?q=80&w=2070&auto=format&fit=crop',
    },
  ];

  const getStatusColor = status => {
    switch (status) {
      case 'optimal':
        return '#4CAF50';
      case 'warning':
        return '#FFC107';
      case 'critical':
        return '#F44336';
      default:
        return '#4CAF50';
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.header}>
        <Text style={[styles.title, isDark && styles.textDark]}>{t('hydroponic.title')}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
              {t('hydroponic.mySystems')}
            </Text>
            <TouchableOpacity style={styles.addButton}>
              <Ionicons name="add" size={20} color="white" />
              <Text style={styles.addButtonText}>{t('hydroponic.addSystem')}</Text>
            </TouchableOpacity>
          </View>

          {hydroponicSystems.map(system => (
            <TouchableOpacity
              key={system.id}
              style={[styles.systemCard, isDark && styles.cardDark]}
            >
              <Image source={{ uri: system.image }} style={styles.systemImage} />
              <View style={styles.systemContent}>
                <View style={styles.systemHeader}>
                  <Text style={[styles.systemName, isDark && styles.textDark]}>{system.name}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: `${getStatusColor(system.status)}20` },
                    ]}
                  >
                    <View
                      style={[styles.statusDot, { backgroundColor: getStatusColor(system.status) }]}
                    />
                    <Text style={[styles.statusText, { color: getStatusColor(system.status) }]}>
                      {system.status === 'optimal'
                        ? 'Optimal'
                        : system.status === 'warning'
                          ? 'Needs Attention'
                          : 'Critical'}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.systemType, isDark && styles.textLightDark]}>
                  {system.type}
                </Text>

                <View style={styles.systemStats}>
                  <View style={styles.statItem}>
                    <Ionicons name="water" size={16} color={isDark ? '#AAAAAA' : '#666666'} />
                    <Text style={[styles.statText, isDark && styles.textLightDark]}>
                      {t('hydroponic.plants', { count: system.plants })}
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Ionicons name="pulse" size={16} color={isDark ? '#AAAAAA' : '#666666'} />
                    <Text style={[styles.statText, isDark && styles.textLightDark]}>
                      {system.lastChecked}
                    </Text>
                  </View>
                </View>

                <View style={styles.systemActions}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>{t('hydroponic.viewDetails')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
                    <Ionicons name="settings" size={16} color="#2E7D32" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          <View style={styles.dashboardSection}>
            <Text style={[styles.dashboardTitle, isDark && styles.textDark]}>
              {t('hydroponic.quickStats')}
            </Text>

            <View style={styles.statsGrid}>
              <View style={[styles.statCard, isDark && styles.cardDark]}>
                <Ionicons name="thermometer" size={24} color="#2E7D32" />
                <Text style={[styles.statValue, isDark && styles.textDark]}>23.5°C</Text>
                <Text style={[styles.statLabel, isDark && styles.textLightDark]}>
                  {t('hydroponic.avgTemp')}
                </Text>
              </View>

              <View style={[styles.statCard, isDark && styles.cardDark]}>
                <Ionicons name="water" size={24} color="#2196F3" />
                <Text style={[styles.statValue, isDark && styles.textDark]}>6.4</Text>
                <Text style={[styles.statLabel, isDark && styles.textLightDark]}>
                  {t('hydroponic.avgPh')}
                </Text>
              </View>

              <View style={[styles.statCard, isDark && styles.cardDark]}>
                <Ionicons name="bar-chart" size={24} color="#FF9800" />
                <Text style={[styles.statValue, isDark && styles.textDark]}>1.8</Text>
                <Text style={[styles.statLabel, isDark && styles.textLightDark]}>
                  {t('hydroponic.avgEc')}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    fontFamily: 'Poppins-Bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    fontFamily: 'Poppins-Bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E7D32',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  addButtonText: {
    color: 'white',
    marginLeft: 4,
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
  systemCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    overflow: 'hidden',
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
  cardDark: {
    backgroundColor: '#1E1E1E',
  },
  systemImage: {
    width: '100%',
    height: 150,
  },
  systemContent: {
    padding: 16,
  },
  systemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  systemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    fontFamily: 'Poppins-Bold',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
  systemType: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
    fontFamily: 'Poppins-Regular',
  },
  systemStats: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 6,
    fontFamily: 'Poppins-Regular',
  },
  systemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  actionButtonText: {
    color: 'white',
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
  secondaryButton: {
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
    padding: 8,
  },
  dashboardSection: {
    marginTop: 8,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  dashboardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
    fontFamily: 'Poppins-Bold',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 8,
    marginBottom: 4,
    fontFamily: 'Poppins-Bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
  textDark: {
    color: '#FFFFFF',
  },
  textLightDark: {
    color: '#AAAAAA',
  },
});
