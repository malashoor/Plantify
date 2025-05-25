import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useNotifications } from '@/hooks/useNotifications';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useTranslation } from '@/utils/i18n';
import { AlertCircle, Bell } from 'lucide-react-native';

let Notifications: typeof import('expo-notifications') | null = null;
if (Platform.OS !== 'web') {
  // Only loads on native
  // eslint-disable-next-line import/no-extraneous-dependencies
  Notifications = require('expo-notifications');
}

interface NotificationPromptProps {
  context: string;
  feature: string;
  isDismissable?: boolean;
  onAccept?: () => void;
  onDismiss?: () => void;
}

export default function NotificationPrompt({
  context,
  feature,
  isDismissable = true,
  onAccept,
  onDismiss,
}: NotificationPromptProps) {
  const { t } = useTranslation();
  const { isDark } = useColorScheme();
  const { permissionStatus, requestPermissions } = useNotifications();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show prompt only if permissions not already granted or denied
    if (Notifications && permissionStatus === Notifications.PermissionStatus.UNDETERMINED) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [permissionStatus]);

  const handleAccept = async () => {
    setIsVisible(false);
    const granted = await requestPermissions(context, feature);
    if (onAccept) {
      onAccept();
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.iconContainer}>
        <Bell size={24} color={isDark ? '#4CAF50' : '#2E7D32'} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, isDark && styles.textDark]}>{t('notifications.permissions.title')}</Text>
        <Text style={[styles.description, isDark && styles.textLightDark]}>
          {t('notifications.permissions.body')}
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.enableButton, isDark && styles.enableButtonDark]}
          onPress={handleAccept}
          accessibilityRole="button"
          accessibilityLabel={t('notifications.permissions.title')}
        >
          <Text style={styles.enableText}>{t('common.confirm')}</Text>
        </TouchableOpacity>
        {isDismissable && (
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={handleDismiss}
            accessibilityRole="button"
            accessibilityLabel={t('common.cancel')}
          >
            <Text style={[styles.dismissText, isDark && styles.textDark]}>{t('common.cancel')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    flexDirection: 'column',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  containerDark: {
    backgroundColor: '#1E1E1E',
    borderColor: '#333333',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  textContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
  },
  description: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'Poppins-Regular',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  enableButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
  },
  enableButtonDark: {
    backgroundColor: '#4CAF50',
  },
  enableText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
  dismissButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
  },
  dismissText: {
    color: '#333333',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
  textDark: {
    color: '#FFFFFF',
  },
  textLightDark: {
    color: '#AAAAAA',
  },
}); 