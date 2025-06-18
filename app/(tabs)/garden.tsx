import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTranslation } from '../../src/utils/i18n';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  useColorScheme,
  Platform,
} from 'react-native';

export default function GardenScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [activeTab, setActiveTab] = useState('all');

  const plants = [
    {
      id: 1,
      name: 'Monstera Deliciosa',
      location: 'Living Room',
      wateringStatus: 'today',
      image:
        'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?q=80&w=764&auto=format&fit=crop',
    },
    {
      id: 2,
      name: 'Snake Plant',
      location: 'Bedroom',
      wateringStatus: 'tomorrow',
      image:
        'https://images.unsplash.com/photo-1572688484438-313a6e50c333?q=80&w=387&auto=format&fit=crop',
    },
    {
      id: 3,
      name: 'Aloe Vera',
      location: 'Kitchen',
      wateringStatus: 'good',
      image:
        'https://images.unsplash.com/photo-1596547609652-9cf5d8c6a5f3?q=80&w=387&auto=format&fit=crop',
    },
  ];

  const getWateringStatusColor = (status: string) => {
    switch (status) {
      case 'today':
        return '#E53935';
      case 'tomorrow':
        return '#FB8C00';
      case 'good':
        return '#43A047';
      default:
        return '#43A047';
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.header}>
        <Text style={[styles.title, isDark && styles.textDark]}>{t('garden.title')}</Text>
        <TouchableOpacity style={[styles.addButton, isDark && { backgroundColor: '#333333' }]}>
          <Ionicons name="add" size={22} color={isDark ? '#FFFFFF' : '#2E7D32'} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <LinearGradient
          colors={['#4CAF50', '#2E7D32']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.statsCard}
        >
          <View style={styles.statsContent}>
            <View>
              <Text style={styles.statsTitle}>{t('garden.stats.title')}</Text>
              <Text style={styles.statsSubtitle}>{t('garden.stats.subtitle')}</Text>
            </View>
            <View style={styles.statsNumbers}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{plants.length}</Text>
                <Text style={styles.statLabel}>{t('garden.stats.plants')}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {plants.filter(p => p.wateringStatus === 'today').length}
                </Text>
                <Text style={styles.statLabel}>{t('garden.stats.needWater')}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}
        >
          {['all', 'indoor', 'outdoor', 'succulents', 'herbs'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                activeTab === tab && styles.activeTab,
                isDark && styles.tabDark,
                activeTab === tab && isDark && styles.activeTabDark,
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                  isDark && styles.tabTextDark,
                  activeTab === tab && isDark && styles.activeTabText,
                ]}
              >
                {t(`garden.categories.${tab}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.plantsList}>
        {plants.map((plant, index) => (
          <TouchableOpacity key={index} style={[styles.plantCard, isDark && styles.cardDark]}>
            <Image source={{ uri: plant.image }} style={styles.plantImage} />
            <View style={styles.plantInfo}>
              <View>
                <Text style={[styles.plantName, isDark && styles.textDark]}>{plant.name}</Text>
                <Text style={[styles.plantLocation, isDark && styles.textLightDark]}>
                  {plant.location}
                </Text>
              </View>

              <View
                style={[
                  styles.waterStatus,
                  {
                    backgroundColor: `${getWateringStatusColor(plant.wateringStatus)}20`,
                  },
                ]}
              >
                <Ionicons
                  name="water"
                  size={16}
                  color={getWateringStatusColor(plant.wateringStatus)}
                />
                <Text
                  style={[
                    styles.waterStatusText,
                    { color: getWateringStatusColor(plant.wateringStatus) },
                  ]}
                >
                  {t(`garden.waterStatus.${plant.wateringStatus}`)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statsCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  statsContent: {
    padding: 20,
  },
  statsTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: 'Poppins-Bold',
  },
  statsSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: 16,
    fontFamily: 'Poppins-Regular',
  },
  statsNumbers: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: 'Poppins-Bold',
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  tabsContainer: {
    marginBottom: 16,
  },
  tabs: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: 'white',
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
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  tabDark: {
    backgroundColor: '#1E1E1E',
  },
  activeTab: {
    backgroundColor: '#2E7D32',
  },
  activeTabDark: {
    backgroundColor: '#2E7D32',
  },
  tabText: {
    color: '#666666',
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
  tabTextDark: {
    color: '#AAAAAA',
  },
  activeTabText: {
    color: 'white',
  },
  plantsList: {
    paddingHorizontal: 20,
  },
  plantCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
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
  plantImage: {
    width: 100,
    height: 100,
  },
  plantInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  plantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
    fontFamily: 'Poppins-Bold',
  },
  plantLocation: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Poppins-Regular',
  },
  waterStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  waterStatusText: {
    fontSize: 12,
    marginLeft: 4,
    fontFamily: 'Poppins-Medium',
  },
  textDark: {
    color: '#FFFFFF',
  },
  textLightDark: {
    color: '#AAAAAA',
  },
});
