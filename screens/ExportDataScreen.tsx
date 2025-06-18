import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  useColorScheme,
  Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system';
import { supabase } from 'lib/supabase';

// Simple theme helper
const createTheme = (colorScheme: 'light' | 'dark' | null) => ({
  colors: {
    primary: '#4CAF50',
    background: colorScheme === 'dark' ? '#121212' : '#FFFFFF',
    surface: colorScheme === 'dark' ? '#1E1E1E' : '#F8F9FA',
    text: colorScheme === 'dark' ? '#FFFFFF' : '#212121',
    textSecondary: colorScheme === 'dark' ? '#AAAAAA' : '#757575',
    border: colorScheme === 'dark' ? '#333333' : '#E0E0E0',
    success: '#4CAF50',
  },
});

export default function ExportDataScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = createTheme(colorScheme);

  const [isExporting, setIsExporting] = useState(false);

  const exportUserData = async () => {
    try {
      setIsExporting(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No user found');
      }

      // Collect user data
      const exportData = {
        exportInfo: {
          exportDate: new Date().toISOString(),
          appName: 'GreensAI',
          version: '1.0.0',
          userID: user.id,
        },
        profile: {
          id: user.id,
          email: user.email,
          createdAt: user.created_at,
          userMetadata: user.user_metadata,
          lastSignIn: user.last_sign_in_at,
        },
        plantData: {
          // Mock plant data - in production, fetch from your plants table
          plants: [
            {
              id: '1',
              name: 'Monstera Deliciosa',
              type: 'Houseplant',
              datePlanted: '2024-01-15',
              careHistory: [
                { date: '2024-01-20', action: 'watered', notes: 'First watering' },
                { date: '2024-01-25', action: 'fertilized', notes: 'Liquid fertilizer' },
              ],
            },
          ],
          identificationHistory: [
            {
              date: '2024-01-10',
              plantName: 'Snake Plant',
              confidence: 0.95,
              location: 'Living Room',
            },
          ],
        },
        settings: {
          notifications: {
            plantCareReminders: true,
            wateringAlerts: true,
            diseaseAlerts: true,
          },
          privacy: {
            dataSharing: false,
            analytics: true,
            locationSharing: false,
          },
        },
      };

      // Convert to JSON string
      const jsonData = JSON.stringify(exportData, null, 2);

      // Create filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `greensai_data_export_${timestamp}.json`;

      // Save to device
      const fileUri = FileSystem.documentDirectory + fileName;
      await FileSystem.writeAsStringAsync(fileUri, jsonData);

      // Share the file
      const shareResult = await Share.share({
        url: fileUri,
        title: 'GreensAI Data Export',
        message: `Your GreensAI data export from ${timestamp}`,
      });

      if (shareResult.action === Share.sharedAction) {
        Alert.alert(
          'Export Successful! ✅',
          `Your data has been exported successfully. File saved as: ${fileName}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('Export error:', error);
      Alert.alert('Export Failed', error.message || 'Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportFormats = [
    {
      id: 'json',
      title: 'JSON Export',
      description: 'Complete data export in JSON format',
      icon: 'document-text',
      onPress: exportUserData,
    },
    {
      id: 'csv',
      title: 'CSV Export (Coming Soon)',
      description: 'Plant data in spreadsheet format',
      icon: 'grid',
      onPress: () => Alert.alert('Coming Soon', 'CSV export will be available in a future update'),
    },
    {
      id: 'pdf',
      title: 'PDF Report (Coming Soon)',
      description: 'Formatted plant care report',
      icon: 'document',
      onPress: () => Alert.alert('Coming Soon', 'PDF export will be available in a future update'),
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Export Data</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Section */}
        <View
          style={[
            styles.infoCard,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <Ionicons name="information-circle" size={32} color={theme.colors.primary} />
          <Text style={[styles.infoTitle, { color: theme.colors.text }]}>Export Your Data</Text>
          <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
            Download all your plant data, photos, care history, and settings in a portable format.
            Your data will remain secure and can be imported into other gardening apps.
          </Text>
        </View>

        {/* Export Options */}
        <View
          style={[
            styles.section,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Export Formats</Text>

          {exportFormats.map(format => (
            <TouchableOpacity
              key={format.id}
              style={[styles.formatItem, { borderBottomColor: theme.colors.border }]}
              onPress={format.onPress}
              disabled={isExporting && format.id === 'json'}
              activeOpacity={0.7}
            >
              <View style={styles.formatContent}>
                <View style={styles.formatHeader}>
                  <Ionicons name={format.icon as any} size={24} color={theme.colors.primary} />
                  <Text style={[styles.formatTitle, { color: theme.colors.text }]}>
                    {format.title}
                  </Text>
                  {isExporting && format.id === 'json' && (
                    <Ionicons name="hourglass" size={20} color={theme.colors.primary} />
                  )}
                </View>
                <Text style={[styles.formatDescription, { color: theme.colors.textSecondary }]}>
                  {format.description}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* What's Included */}
        <View
          style={[
            styles.section,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>What's Included</Text>

          <View style={styles.includedList}>
            <View style={styles.includedItem}>
              <Ionicons name="person" size={16} color={theme.colors.success} />
              <Text style={[styles.includedText, { color: theme.colors.textSecondary }]}>
                Profile information and settings
              </Text>
            </View>
            <View style={styles.includedItem}>
              <Ionicons name="leaf" size={16} color={theme.colors.success} />
              <Text style={[styles.includedText, { color: theme.colors.textSecondary }]}>
                Plant collection and care history
              </Text>
            </View>
            <View style={styles.includedItem}>
              <Ionicons name="camera" size={16} color={theme.colors.success} />
              <Text style={[styles.includedText, { color: theme.colors.textSecondary }]}>
                Plant identification history
              </Text>
            </View>
            <View style={styles.includedItem}>
              <Ionicons name="notifications" size={16} color={theme.colors.success} />
              <Text style={[styles.includedText, { color: theme.colors.textSecondary }]}>
                Notification and privacy preferences
              </Text>
            </View>
            <View style={styles.includedItem}>
              <Ionicons name="calendar" size={16} color={theme.colors.success} />
              <Text style={[styles.includedText, { color: theme.colors.textSecondary }]}>
                Care schedules and reminders
              </Text>
            </View>
          </View>
        </View>

        {/* Note */}
        <View
          style={[
            styles.noteCard,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <Ionicons name="shield-checkmark" size={20} color={theme.colors.primary} />
          <Text style={[styles.noteText, { color: theme.colors.textSecondary }]}>
            Your data is exported securely and contains no sensitive information like passwords. The
            export file can be shared safely with other devices or apps.
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
  infoCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
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
  formatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  formatContent: {
    flex: 1,
    marginRight: 16,
  },
  formatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  formatTitle: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  formatDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  includedList: {
    gap: 12,
  },
  includedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  includedText: {
    fontSize: 14,
    flex: 1,
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
