import React, { useEffect } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';

interface VoiceAnnouncementProps {
  message: string;
  delay?: number;
  shouldSpeak?: boolean;
  rate?: number;
  pitch?: number;
}

export default function VoiceAnnouncement({
  message,
  delay = 0,
  shouldSpeak = true,
  rate = 0.5,
  pitch = 1.0,
}: VoiceAnnouncementProps) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!shouldSpeak || !message) return;

    const timer = setTimeout(() => {
      if (Platform.OS === 'ios') {
        AccessibilityInfo.announceForAccessibility(message);
      } else if (Platform.OS === 'android') {
        // On Android, we need to handle rate and pitch
        const utterance = {
          text: message,
          rate,
          pitch,
          queueMode: 1, // Add to queue
        };
        
        // @ts-ignore - Android specific API
        if (AccessibilityInfo.announceForAccessibility) {
          // @ts-ignore - Android specific API
          AccessibilityInfo.announceForAccessibility(utterance);
        }
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [message, delay, shouldSpeak, rate, pitch]);

  // This component doesn't render anything
  return null;
}

// Utility function to create a voice announcement queue
export function useVoiceAnnouncement() {
  const announceQueue = async (
    messages: string[],
    options: Partial<VoiceAnnouncementProps> = {}
  ) => {
    const {
      delay = 0,
      rate = 0.5,
      pitch = 1.0,
    } = options;

    for (let i = 0; i < messages.length; i++) {
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          if (Platform.OS === 'ios') {
            AccessibilityInfo.announceForAccessibility(messages[i]);
          } else if (Platform.OS === 'android') {
            const utterance = {
              text: messages[i],
              rate,
              pitch,
              queueMode: 1,
            };
            
            // @ts-ignore - Android specific API
            if (AccessibilityInfo.announceForAccessibility) {
              // @ts-ignore - Android specific API
              AccessibilityInfo.announceForAccessibility(utterance);
            }
          }
          resolve();
        }, i * delay);
      });
    }
  };

  return {
    announceQueue,
  };
} 