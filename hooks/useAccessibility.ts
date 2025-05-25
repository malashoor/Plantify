import { useCallback, useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

interface AccessibilityOptions {
  announceForAccessibility: (message: string, priority?: 'default' | 'high') => void;
  isScreenReaderEnabled: boolean;
  isBoldTextEnabled: boolean;
  isReduceMotionEnabled: boolean;
  isReduceTransparencyEnabled: boolean;
  isHighContrastEnabled: boolean;
  isInvertColorsEnabled: boolean;
  isVoiceOverRunning: boolean;
  isTalkBackRunning: boolean;
  fontScale: number;
}

/**
 * A custom hook for managing accessibility features
 * Supports voice feedback, screen readers, and other accessibility settings
 */
export function useAccessibility(): AccessibilityOptions {
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);
  const [isBoldTextEnabled, setIsBoldTextEnabled] = useState(false);
  const [isReduceMotionEnabled, setIsReduceMotionEnabled] = useState(false);
  const [isReduceTransparencyEnabled, setIsReduceTransparencyEnabled] = useState(false);
  const [isHighContrastEnabled, setIsHighContrastEnabled] = useState(false);
  const [isInvertColorsEnabled, setIsInvertColorsEnabled] = useState(false);
  const [fontScale, setFontScale] = useState(1);

  // Check if screen reader is enabled
  useEffect(() => {
    // Initial check
    AccessibilityInfo.isScreenReaderEnabled().then(
      screenReaderEnabled => {
        setIsScreenReaderEnabled(screenReaderEnabled);
      }
    );

    // Subscribe to changes
    const screenReaderChangedListener = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      screenReaderEnabled => {
        setIsScreenReaderEnabled(screenReaderEnabled);
      }
    );

    return () => {
      screenReaderChangedListener.remove();
    };
  }, []);

  // Check if bold text is enabled (iOS only)
  useEffect(() => {
    if (Platform.OS === 'ios') {
      // Initial check
      AccessibilityInfo.isBoldTextEnabled().then(
        boldTextEnabled => {
          setIsBoldTextEnabled(boldTextEnabled);
        }
      );

      // Subscribe to changes
      const boldTextChangedListener = AccessibilityInfo.addEventListener(
        'boldTextChanged',
        boldTextEnabled => {
          setIsBoldTextEnabled(boldTextEnabled);
        }
      );

      return () => {
        boldTextChangedListener.remove();
      };
    }
  }, []);

  // Check if reduce motion is enabled
  useEffect(() => {
    // Initial check
    AccessibilityInfo.isReduceMotionEnabled().then(
      reduceMotionEnabled => {
        setIsReduceMotionEnabled(reduceMotionEnabled);
      }
    );

    // Subscribe to changes
    const reduceMotionChangedListener = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      reduceMotionEnabled => {
        setIsReduceMotionEnabled(reduceMotionEnabled);
      }
    );

    return () => {
      reduceMotionChangedListener.remove();
    };
  }, []);

  // Check if reduce transparency is enabled (iOS only)
  useEffect(() => {
    if (Platform.OS === 'ios') {
      // Initial check
      AccessibilityInfo.isReduceTransparencyEnabled().then(
        reduceTransparencyEnabled => {
          setIsReduceTransparencyEnabled(reduceTransparencyEnabled);
        }
      );

      // Subscribe to changes
      const reduceTransparencyChangedListener = AccessibilityInfo.addEventListener(
        'reduceTransparencyChanged',
        reduceTransparencyEnabled => {
          setIsReduceTransparencyEnabled(reduceTransparencyEnabled);
        }
      );

      return () => {
        reduceTransparencyChangedListener.remove();
      };
    }
  }, []);

  // High contrast mode (iOS 13+)
  useEffect(() => {
    if (Platform.OS === 'ios' && parseInt(Platform.Version, 10) >= 13) {
      AccessibilityInfo.isHighContrastEnabled().then(
        highContrastEnabled => {
          setIsHighContrastEnabled(highContrastEnabled);
        }
      ).catch(err => {
        console.warn('Error checking high contrast mode:', err);
      });

      const highContrastChangedListener = AccessibilityInfo.addEventListener(
        'highContrastChanged',
        highContrastEnabled => {
          setIsHighContrastEnabled(highContrastEnabled);
        }
      );

      return () => {
        highContrastChangedListener.remove();
      };
    }
  }, []);

  // Invert colors (iOS only)
  useEffect(() => {
    if (Platform.OS === 'ios') {
      AccessibilityInfo.isInvertColorsEnabled().then(
        invertColorsEnabled => {
          setIsInvertColorsEnabled(invertColorsEnabled);
        }
      ).catch(err => {
        console.warn('Error checking inverted colors:', err);
      });

      const invertColorsChangedListener = AccessibilityInfo.addEventListener(
        'invertColorsChanged',
        invertColorsEnabled => {
          setIsInvertColorsEnabled(invertColorsEnabled);
        }
      );

      return () => {
        invertColorsChangedListener.remove();
      };
    }
  }, []);

  // Font scale
  useEffect(() => {
    AccessibilityInfo.getRecommendedFontSizes().then(
      ({ largeScale }) => {
        setFontScale(largeScale);
      }
    ).catch(err => {
      console.warn('Error getting font sizes:', err);
    });
  }, []);

  /**
   * Announce a message for screen readers
   */
  const announceForAccessibility = useCallback((message: string, priority: 'default' | 'high' = 'default') => {
    if (!message) return;
    
    try {
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        AccessibilityInfo.announceForAccessibility(message);
      }
      
      // For web platform
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', priority === 'high' ? 'alert' : 'status');
        announcement.setAttribute('aria-live', priority === 'high' ? 'assertive' : 'polite');
        announcement.style.position = 'absolute';
        announcement.style.width = '1px';
        announcement.style.height = '1px';
        announcement.style.overflow = 'hidden';
        announcement.style.clip = 'rect(0, 0, 0, 0)';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        // Clean up after a delay
        setTimeout(() => {
          if (document.body.contains(announcement)) {
            document.body.removeChild(announcement);
          }
        }, 3000);
      }
    } catch (error) {
      console.error('Error announcing message:', error);
    }
  }, []);

  return {
    announceForAccessibility,
    isScreenReaderEnabled,
    isBoldTextEnabled,
    isReduceMotionEnabled,
    isReduceTransparencyEnabled,
    isHighContrastEnabled,
    isInvertColorsEnabled,
    isVoiceOverRunning: Platform.OS === 'ios' && isScreenReaderEnabled,
    isTalkBackRunning: Platform.OS === 'android' && isScreenReaderEnabled,
    fontScale,
  };
} 