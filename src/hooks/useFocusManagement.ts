import { useRef, useCallback } from 'react';
import { AccessibilityInfo, findNodeHandle, Platform } from 'react-native';

interface FocusManagementOptions {
  shouldAnnounce?: boolean;
  announcementMessage?: string;
}

export function useFocusManagement() {
  const elementRef = useRef<any>(null);

  const setFocus = useCallback((options: FocusManagementOptions = {}) => {
    const { shouldAnnounce = false, announcementMessage } = options;

    if (elementRef.current) {
      const reactTag = findNodeHandle(elementRef.current);

      if (reactTag) {
        if (Platform.OS === 'ios') {
          AccessibilityInfo.setAccessibilityFocus(reactTag);
        } else if (Platform.OS === 'android') {
          // On Android, we need to wait a frame for the focus to be properly set
          requestAnimationFrame(() => {
            AccessibilityInfo.setAccessibilityFocus(reactTag);
          });
        }

        if (shouldAnnounce && announcementMessage) {
          AccessibilityInfo.announceForAccessibility(announcementMessage);
        }
      }
    }
  }, []);

  const clearFocus = useCallback(() => {
    if (elementRef.current) {
      const reactTag = findNodeHandle(elementRef.current);

      if (reactTag) {
        if (Platform.OS === 'ios') {
          AccessibilityInfo.setAccessibilityFocus(0);
        }
      }
    }
  }, []);

  const moveFocusToNext = useCallback(
    (nextRef: React.RefObject<any>, options: FocusManagementOptions = {}) => {
      const { shouldAnnounce = false, announcementMessage } = options;

      if (nextRef.current) {
        const reactTag = findNodeHandle(nextRef.current);

        if (reactTag) {
          if (Platform.OS === 'ios') {
            AccessibilityInfo.setAccessibilityFocus(reactTag);
          } else if (Platform.OS === 'android') {
            requestAnimationFrame(() => {
              AccessibilityInfo.setAccessibilityFocus(reactTag);
            });
          }

          if (shouldAnnounce && announcementMessage) {
            AccessibilityInfo.announceForAccessibility(announcementMessage);
          }
        }
      }
    },
    []
  );

  return {
    elementRef,
    setFocus,
    clearFocus,
    moveFocusToNext,
  };
}
