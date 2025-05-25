import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Calendar, Bell, BellOff } from 'lucide-react-native';
import { useNotifications } from '@/hooks/useNotifications';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useTranslation } from '@/utils/i18n';
import NotificationPrompt from './NotificationPrompt';

interface TaskReminderButtonProps {
  taskId: string;
  taskType: string;
  plantId?: string;
  plantName?: string;
  dueDate: Date;
  onSuccess?: () => void;
}

export default function TaskReminderButton({
  taskId,
  taskType,
  plantId,
  plantName,
  dueDate,
  onSuccess,
}: TaskReminderButtonProps) {
  const { t } = useTranslation();
  const { isDark } = useColorScheme();
  const { permissionStatus, scheduleReminder, getReminderTemplate } = useNotifications();
  const [isScheduling, setIsScheduling] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  const handleScheduleReminder = async () => {
    setIsScheduling(true);
    
    try {
      // Get appropriate template based on task type
      const template = getReminderTemplate(taskType, plantName);
      
      // Schedule for 30 minutes before due date
      const reminderTime = new Date(dueDate);
      reminderTime.setMinutes(reminderTime.getMinutes() - 30);
      
      // Only proceed if due date is in the future
      if (reminderTime > new Date()) {
        const notificationId = await scheduleReminder(
          {
            title: template.title,
            body: template.body,
            plantId,
            plantName,
            taskId,
            taskType,
            dueDate: dueDate.toISOString(),
            categoryId: 'reminder',
          },
          { date: reminderTime }
        );
        
        if (notificationId) {
          setIsScheduled(true);
          if (onSuccess) {
            onSuccess();
          }
        }
      }
    } catch (error) {
      console.error('Failed to schedule reminder:', error);
    } finally {
      setIsScheduling(false);
    }
  };

  const handleCancelReminder = async () => {
    setIsScheduled(false);
  };

  const handleReminderPress = () => {
    if (isScheduled) {
      handleCancelReminder();
    } else {
      if (permissionStatus === 'granted') {
        handleScheduleReminder();
      } else {
        // Show permission prompt
        setShowPrompt(true);
      }
    }
  };

  return (
    <View style={styles.container}>
      {showPrompt && (
        <NotificationPrompt
          context="grow-cycle"
          feature="plant care reminders"
          onAccept={() => {
            setShowPrompt(false);
            handleScheduleReminder();
          }}
          onDismiss={() => setShowPrompt(false)}
        />
      )}
      
      <TouchableOpacity
        style={[
          styles.reminderButton,
          isDark && styles.reminderButtonDark,
          isScheduled && styles.reminderButtonActive,
        ]}
        onPress={handleReminderPress}
        disabled={isScheduling}
        accessibilityLabel={
          isScheduled
            ? t('accessibility.cancelReminder', 'Cancel reminder')
            : t('accessibility.setReminder', 'Set reminder')
        }
        accessibilityRole="button"
      >
        {isScheduling ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : isScheduled ? (
          <Bell size={20} color="#FFFFFF" />
        ) : (
          <BellOff size={20} color={isDark ? '#AAAAAA' : '#666666'} />
        )}
        <Text
          style={[
            styles.reminderText,
            isDark && styles.reminderTextDark,
            isScheduled && styles.reminderTextActive,
          ]}
        >
          {isScheduled
            ? t('tasks.reminderSet')
            : t('tasks.setReminder', 'Remind me')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  reminderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    backgroundColor: 'transparent',
  },
  reminderButtonDark: {
    borderColor: '#444444',
  },
  reminderButtonActive: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  reminderText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Poppins-Medium',
  },
  reminderTextDark: {
    color: '#AAAAAA',
  },
  reminderTextActive: {
    color: '#FFFFFF',
  },
}); 