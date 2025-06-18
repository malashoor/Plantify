import React from 'react';
import LinearGradient from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackHeader from '../../src/components/layout/BackHeader';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LanguageSelector from '../../src/components/language/LanguageSelector';

import { useTranslation } from 'react-i18next';
import { changeLanguage, LANGUAGES, type LanguageCode } from '../../src/utils/i18n';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Switch,
  useColorScheme,
  Platform,
  Alert,
} from 'react-native';

const ProfileScreen = () => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(
    i18n.language as LanguageCode
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(isDark);

  useEffect(() => {
    AsyncStorage.getItem('app_language').then(language => {
      if (language && Object.keys(LANGUAGES).includes(language)) {
        setCurrentLanguage(language as LanguageCode);
      }
    });
  }, []);

  const handleLanguageChange = async (lng: LanguageCode) => {
    try {
      await Haptics.selectionAsync();
      await changeLanguage(lng);
      setCurrentLanguage(lng);
    } catch (error) {
      console.error('Failed to change language:', error);
      Alert.alert(t('common.error'), t('profile.settings.languageChangeError'), [
        { text: t('common.ok') },
      ]);
    }
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
  };

  const toggleDarkMode = () => {
    setDarkModeEnabled(!darkModeEnabled);
  };

  const handleEditPress = () => {
    router.push('/profile/details');
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <BackHeader title={t('profile.title')} />
      <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
        <View style={styles.header}>
          <Text style={[styles.title, isDark && styles.textDark]}>{t('profile.title')}</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.profileSection}>
            <LinearGradient
              colors={['#4CAF50', '#2E7D32']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.profileBanner}
            >
              <View style={styles.profileImageContainer}>
                <Image
                  source={{
                    uri: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=2070&auto=format&fit=crop',
                  }}
                  style={styles.profileImage}
                />
                <View style={styles.premiumBadge}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                </View>
              </View>
              <Text style={styles.profileName}>Moayed</Text>
              <Text style={styles.profileEmail}>moayed@example.com</Text>
              <TouchableOpacity style={styles.editProfileButton} onPress={handleEditPress}>
                <Text style={styles.editProfileText}>{t('profile.editProfile')}</Text>
              </TouchableOpacity>
            </LinearGradient>

            <View style={styles.statsRow}>
              <View style={[styles.statCard, isDark && styles.cardDark]}>
                <Text style={[styles.statNumber, isDark && styles.textDark]}>12</Text>
                <Text style={[styles.statLabel, isDark && styles.textLightDark]}>
                  {t('profile.stats.plants')}
                </Text>
              </View>
              <View style={[styles.statCard, isDark && styles.cardDark]}>
                <Text style={[styles.statNumber, isDark && styles.textDark]}>28</Text>
                <Text style={[styles.statLabel, isDark && styles.textLightDark]}>
                  {t('profile.stats.scans')}
                </Text>
              </View>
              <View style={[styles.statCard, isDark && styles.cardDark]}>
                <Text style={[styles.statNumber, isDark && styles.textDark]}>5</Text>
                <Text style={[styles.statLabel, isDark && styles.textLightDark]}>
                  {t('profile.stats.badges')}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.premiumSection}>
            <LinearGradient
              colors={['#9C27B0', '#673AB7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.premiumCard}
            >
              <Ionicons name="star" size={32} color="#FFD700" />
              <Text style={styles.premiumTitle}>Premium Features</Text>
              <Text style={styles.premiumDescription}>
                Unlock unlimited plant identification, expert consultations, and more!
              </Text>
              <TouchableOpacity style={styles.upgradeButton}>
                <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          <View style={styles.rewardsSection}>
            <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Rewards & Store</Text>
            <View style={[styles.rewardsCard, isDark && styles.cardDark]}>
              <View style={styles.rewardItem}>
                <Ionicons name="gift" size={24} color="#2E7D32" />
                <View style={styles.rewardInfo}>
                  <Text style={[styles.rewardTitle, isDark && styles.textDark]}>
                    Referral Rewards
                  </Text>
                  <Text style={[styles.rewardPoints, isDark && styles.textLightDark]}>
                    250 points
                  </Text>
                </View>
              </View>
              <View style={styles.rewardDivider} />
              <TouchableOpacity style={styles.storeButton}>
                <ShoppingBag size={20} color="#2E7D32" />
                <Text style={styles.storeButtonText}>Visit Store</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.settingsSection}>
            <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
              {t('profile.settings.title')}
            </Text>

            <View style={[styles.settingsCard, isDark && styles.cardDark]}>
              <View style={styles.settingItem}>
                <LanguageSelector variant="pills" />
              </View>

              <View style={styles.settingDivider} />

              <View style={styles.settingItem}>
                <View style={styles.settingIconContainer}>
                  <Bell size={20} color="#2E7D32" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingLabel, isDark && styles.textDark]}>
                    {t('profile.settings.notifications')}
                  </Text>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={toggleNotifications}
                  trackColor={{ false: '#D1D1D1', true: '#81C784' }}
                  thumbColor={notificationsEnabled ? '#2E7D32' : '#F5F5F5'}
                />
              </View>

              <View style={styles.settingDivider} />

              <View style={styles.settingItem}>
                <View style={styles.settingIconContainer}>
                  <Settings size={20} color="#2E7D32" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingLabel, isDark && styles.textDark]}>
                    {t('profile.settings.darkMode')}
                  </Text>
                </View>
                <Switch
                  value={darkModeEnabled}
                  onValueChange={toggleDarkMode}
                  trackColor={{ false: '#D1D1D1', true: '#81C784' }}
                  thumbColor={darkModeEnabled ? '#2E7D32' : '#F5F5F5'}
                />
              </View>
            </View>
          </View>

          <View style={styles.helpSection}>
            <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
              {t('profile.help.title')}
            </Text>

            <View style={[styles.settingsCard, isDark && styles.cardDark]}>
              <TouchableOpacity style={styles.settingItem}>
                <View style={styles.settingIconContainer}>
                  <HelpCircle size={20} color="#2E7D32" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingLabel, isDark && styles.textDark]}>
                    {t('profile.help.faq')}
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.settingDivider} />

              <TouchableOpacity style={styles.settingItem}>
                <View style={styles.settingIconContainer}>
                  <User size={20} color="#2E7D32" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingLabel, isDark && styles.textDark]}>
                    {t('profile.help.contact')}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.logoutButton}>
            <LogOut size={20} color="#E53935" />
            <Text style={styles.logoutText}>{t('profile.logout')}</Text>
          </TouchableOpacity>

          <Text style={[styles.versionText, isDark && styles.textLightDark]}>
            {t('profile.version', { version: '1.0.0' })}
          </Text>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

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
  profileSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  profileBanner: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: 'white',
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  premiumBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#9C27B0',
    borderRadius: 12,
    padding: 4,
    borderWidth: 2,
    borderColor: 'white',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
    fontFamily: 'Poppins-Bold',
  },
  profileEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
    fontFamily: 'Poppins-Regular',
  },
  editProfileButton: {
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  editProfileText: {
    color: '#2E7D32',
    fontWeight: 'bold',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
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
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
    fontFamily: 'Poppins-Bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    fontFamily: 'Poppins-Regular',
  },
  premiumSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  premiumCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  premiumTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 12,
    marginBottom: 8,
    fontFamily: 'Poppins-Bold',
  },
  premiumDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Poppins-Regular',
  },
  upgradeButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  upgradeButtonText: {
    color: '#333333',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  rewardsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  rewardsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
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
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardInfo: {
    marginLeft: 16,
    flex: 1,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
    fontFamily: 'Poppins-Bold',
  },
  rewardPoints: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Poppins-Regular',
  },
  rewardDivider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 16,
  },
  storeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: 12,
    borderRadius: 8,
  },
  storeButtonText: {
    color: '#2E7D32',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    fontFamily: 'Poppins-Bold',
  },
  settingsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  helpSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333333',
    fontFamily: 'Poppins-Bold',
  },
  settingsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333333',
    fontFamily: 'Poppins-Medium',
  },
  settingValue: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Poppins-Regular',
  },
  settingDivider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginLeft: 56,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E53935',
  },
  logoutText: {
    color: '#E53935',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999999',
    marginBottom: 30,
    fontFamily: 'Poppins-Regular',
  },
  textDark: {
    color: '#FFFFFF',
  },
  textLightDark: {
    color: '#AAAAAA',
  },
  settingContent: {
    flex: 1,
    marginLeft: 12,
  },
  languageOptions: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  languageOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  languageOptionSelected: {
    backgroundColor: '#DCF5E3',
    borderColor: '#2E7D32',
  },
  languageText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  languageTextSelected: {
    color: '#2E7D32',
    fontWeight: '600',
  },
});
