import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

// Simple theme helper
const createTheme = (colorScheme: 'light' | 'dark' | null) => ({
  colors: {
    primary: '#4CAF50',
    background: colorScheme === 'dark' ? '#121212' : '#FFFFFF',
    surface: colorScheme === 'dark' ? '#1E1E1E' : '#F8F9FA',
    text: colorScheme === 'dark' ? '#FFFFFF' : '#212121',
    textSecondary: colorScheme === 'dark' ? '#AAAAAA' : '#757575',
    border: colorScheme === 'dark' ? '#333333' : '#E0E0E0',
  }
});

export default function NotificationsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = createTheme(colorScheme);
  
  // Independent state for each notification setting
  const [plantCareReminders, setPlantCareReminders] = useState(true);
  const [wateringAlerts, setWateringAlerts] = useState(true);
  const [diseaseAlerts, setDiseaseAlerts] = useState(true);
  const [growthUpdates, setGrowthUpdates] = useState(false);
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [marketingEmails, setMarketingEmails] = useState(false);

  // Create settings object for easy access
  const settings = {
    plantCareReminders,
    wateringAlerts,
    diseaseAlerts,
    growthUpdates,
    weeklyReports,
    emailNotifications,
    marketingEmails,
  };

  const getToggleFunction = (settingKey: string) => {
    switch (settingKey) {
      case 'plantCareReminders': return setPlantCareReminders;
      case 'wateringAlerts': return setWateringAlerts;
      case 'diseaseAlerts': return setDiseaseAlerts;
      case 'growthUpdates': return setGrowthUpdates;
      case 'weeklyReports': return setWeeklyReports;
      case 'emailNotifications': return setEmailNotifications;
      case 'marketingEmails': return setMarketingEmails;
      default: return () => {};
    }
  };

  const NotificationOption = ({ 
    title, 
    description, 
    settingKey, 
    icon 
  }: { 
    title: string; 
    description: string; 
    settingKey: string; 
    icon: string;
  }) => (
    <View style={[styles.optionItem, { borderBottomColor: theme.colors.border }]}>
      <View style={styles.optionContent}>
        <View style={styles.optionHeader}>
          <Ionicons name={icon as any} size={20} color={theme.colors.primary} />
          <Text style={[styles.optionTitle, { color: theme.colors.text }]}>{title}</Text>
        </View>
        <Text style={[styles.optionDescription, { color: theme.colors.textSecondary }]}>
          {description}
        </Text>
      </View>
      <Switch
        value={settings[settingKey]}
        onValueChange={(value) => {
          console.log(`🔔 Toggling ${settingKey}:`, value);
          const toggleFunction = getToggleFunction(settingKey);
          toggleFunction(value);
        }}
        trackColor={{ false: theme.colors.border, true: theme.colors.primary + '50' }}
        thumbColor={settings[settingKey] ? theme.colors.primary : theme.colors.textSecondary}
      />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Push Notifications Section */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Push Notifications</Text>
          
          <NotificationOption
            title="Plant Care Reminders"
            description="Get reminded when your plants need care"
            settingKey="plantCareReminders"
            icon="leaf"
          />
          
          <NotificationOption
            title="Watering Alerts"
            description="Notifications when it's time to water your plants"
            settingKey="wateringAlerts"
            icon="water"
          />
          
          <NotificationOption
            title="Disease Alerts"
            description="Get notified about potential plant health issues"
            settingKey="diseaseAlerts"
            icon="warning"
          />
          
          <NotificationOption
            title="Growth Updates"
            description="Weekly updates on your plants' progress"
            settingKey="growthUpdates"
            icon="trending-up"
          />
        </View>

        {/* App Notifications Section */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>App Notifications</Text>
          
          <NotificationOption
            title="Weekly Reports"
            description="Summary of your garden's activity"
            settingKey="weeklyReports"
            icon="bar-chart"
          />
        </View>

        {/* Email Notifications Section */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Email Notifications</Text>
          
          <NotificationOption
            title="Email Notifications"
            description="Receive important updates via email"
            settingKey="emailNotifications"
            icon="mail"
          />
          
          <NotificationOption
            title="Marketing Emails"
            description="Tips, promotions, and new features"
            settingKey="marketingEmails"
            icon="megaphone"
          />
        </View>

        {/* Note */}
        <View style={[styles.noteCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
          <Text style={[styles.noteText, { color: theme.colors.textSecondary }]}>
            Changes to notification settings take effect immediately. You can modify these settings anytime.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  optionContent: {
    flex: 1,
    marginRight: 16,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  optionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  noteText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
}); 