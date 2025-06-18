import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
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
    error: '#F44336',
  }
});

export default function PrivacyScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = createTheme(colorScheme);
  
  // Independent state for each privacy setting
  const [dataSharing, setDataSharing] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [locationSharing, setLocationSharing] = useState(false);
  const [photoAnalysis, setPhotoAnalysis] = useState(true);
  const [marketingCommunications, setMarketingCommunications] = useState(false);

  // Create settings object for easy access
  const settings = {
    dataSharing,
    analytics,
    locationSharing,
    photoAnalysis,
    marketingCommunications,
  };

  const getToggleFunction = (settingKey: string) => {
    switch (settingKey) {
      case 'dataSharing': return setDataSharing;
      case 'analytics': return setAnalytics;
      case 'locationSharing': return setLocationSharing;
      case 'photoAnalysis': return setPhotoAnalysis;
      case 'marketingCommunications': return setMarketingCommunications;
      default: return () => {};
    }
  };

  const handleChangePassword = () => {
    Alert.alert('Change Password', 'Password change functionality coming soon!');
  };

  const handleTwoFactorAuth = () => {
    Alert.alert('Two-Factor Authentication', '2FA setup coming soon!');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. Are you sure you want to delete your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
          Alert.alert('Account Deletion', 'Account deletion will be available soon.');
        }}
      ]
    );
  };

  const PrivacyOption = ({ 
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
          console.log(`🔒 Toggling ${settingKey}:`, value);
          const toggleFunction = getToggleFunction(settingKey);
          toggleFunction(value);
        }}
        trackColor={{ false: theme.colors.border, true: theme.colors.primary + '50' }}
        thumbColor={settings[settingKey] ? theme.colors.primary : theme.colors.textSecondary}
      />
    </View>
  );

  const ActionItem = ({
    title,
    description,
    icon,
    onPress,
    danger = false,
  }: {
    title: string;
    description: string;
    icon: string;
    onPress: () => void;
    danger?: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.actionItem, { borderBottomColor: theme.colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.actionContent}>
        <View style={styles.actionHeader}>
          <Ionicons 
            name={icon as any} 
            size={20} 
            color={danger ? theme.colors.error : theme.colors.primary} 
          />
          <Text style={[styles.actionTitle, { 
            color: danger ? theme.colors.error : theme.colors.text 
          }]}>
            {title}
          </Text>
        </View>
        <Text style={[styles.actionDescription, { color: theme.colors.textSecondary }]}>
          {description}
        </Text>
      </View>
      <Ionicons 
        name="chevron-forward" 
        size={20} 
        color={theme.colors.textSecondary} 
      />
    </TouchableOpacity>
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
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Privacy & Security</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Privacy Settings */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Privacy Settings</Text>
          
          <PrivacyOption
            title="Data Sharing"
            description="Share anonymized usage data to improve the app"
            settingKey="dataSharing"
            icon="share"
          />
          
          <PrivacyOption
            title="Analytics"
            description="Help us improve by sharing app usage analytics"
            settingKey="analytics"
            icon="analytics"
          />
          
          <PrivacyOption
            title="Location Sharing"
            description="Share your location for weather and regional tips"
            settingKey="locationSharing"
            icon="location"
          />
          
          <PrivacyOption
            title="Photo Analysis"
            description="Allow AI analysis of your plant photos for better identification"
            settingKey="photoAnalysis"
            icon="camera"
          />
          
          <PrivacyOption
            title="Marketing Communications"
            description="Receive personalized tips and product recommendations"
            settingKey="marketingCommunications"
            icon="mail"
          />
        </View>

        {/* Security Actions */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Security</Text>
          
          <ActionItem
            title="Change Password"
            description="Update your account password"
            icon="key"
            onPress={handleChangePassword}
          />
          
          <ActionItem
            title="Two-Factor Authentication"
            description="Add an extra layer of security to your account"
            icon="shield-checkmark"
            onPress={handleTwoFactorAuth}
          />
        </View>

        {/* Data & Account */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Data & Account</Text>
          
          <ActionItem
            title="Download My Data"
            description="Export all your data in a portable format"
            icon="download"
            onPress={() => {
              try {
                console.log('📂 Navigating to Export Data');
                router.push('/export-data');
              } catch (error) {
                console.error('Navigation error:', error);
                Alert.alert('Navigation Error', 'Unable to open export screen');
              }
            }}
          />
          
          <ActionItem
            title="Delete Account"
            description="Permanently delete your account and all data"
            icon="trash"
            onPress={handleDeleteAccount}
            danger={true}
          />
        </View>

        {/* Privacy Policy */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Legal</Text>
          
          <ActionItem
            title="Privacy Policy"
            description="Read our privacy policy and terms of service"
            icon="document-text"
            onPress={() => Alert.alert('Privacy Policy', 'View privacy policy at greensai.com/privacy')}
          />
          
          <ActionItem
            title="Terms of Service"
            description="Review our terms and conditions"
            icon="shield"
            onPress={() => Alert.alert('Terms of Service', 'View terms at greensai.com/terms')}
          />
        </View>

        {/* Note */}
        <View style={[styles.noteCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
          <Text style={[styles.noteText, { color: theme.colors.textSecondary }]}>
            We take your privacy seriously. Your plant data stays secure and is never shared without your permission.
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
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  actionContent: {
    flex: 1,
    marginRight: 16,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  actionDescription: {
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