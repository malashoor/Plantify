import { useState, useEffect } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

interface AccessibilityInfoState {
  screenReaderEnabled: boolean;
  reduceMotionEnabled: boolean;
  reduceTransparencyEnabled: boolean;
  boldTextEnabled: boolean;
}

export function useAccessibilityInfo() {
  const [state, setState] = useState<AccessibilityInfoState>({
    screenReaderEnabled: false,
    reduceMotionEnabled: false,
    reduceTransparencyEnabled: false,
    boldTextEnabled: false,
  });

  useEffect(() => {
    let mounted = true;

    // Get initial values
    const updateScreenReaderStatus = async () => {
      const isEnabled = await AccessibilityInfo.isScreenReaderEnabled();
      if (mounted) {
        setState(prev => ({ ...prev, screenReaderEnabled: isEnabled }));
      }
    };

    const updateReduceMotionStatus = async () => {
      const isEnabled = await AccessibilityInfo.isReduceMotionEnabled();
      if (mounted) {
        setState(prev => ({ ...prev, reduceMotionEnabled: isEnabled }));
      }
    };

    // These are only available on iOS
    const updateReduceTransparencyStatus = async () => {
      if (Platform.OS === 'ios') {
        const isEnabled = await AccessibilityInfo.isReduceTransparencyEnabled();
        if (mounted) {
          setState(prev => ({ ...prev, reduceTransparencyEnabled: isEnabled }));
        }
      }
    };

    const updateBoldTextStatus = async () => {
      if (Platform.OS === 'ios') {
        const isEnabled = await AccessibilityInfo.isBoldTextEnabled();
        if (mounted) {
          setState(prev => ({ ...prev, boldTextEnabled: isEnabled }));
        }
      }
    };

    // Update initial state
    updateScreenReaderStatus();
    updateReduceMotionStatus();
    updateReduceTransparencyStatus();
    updateBoldTextStatus();

    // Set up listeners for changes
    const screenReaderChangedListener = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      isEnabled => {
        if (mounted) {
          setState(prev => ({ ...prev, screenReaderEnabled: isEnabled }));
        }
      }
    );
    
    const reduceMotionChangedListener = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      isEnabled => {
        if (mounted) {
          setState(prev => ({ ...prev, reduceMotionEnabled: isEnabled }));
        }
      }
    );

    let reduceTransparencyChangedListener: { remove: () => void } | undefined;
    let boldTextChangedListener: { remove: () => void } | undefined;

    if (Platform.OS === 'ios') {
      reduceTransparencyChangedListener = AccessibilityInfo.addEventListener(
        'reduceTransparencyChanged',
        isEnabled => {
          if (mounted) {
            setState(prev => ({ ...prev, reduceTransparencyEnabled: isEnabled }));
          }
        }
      );
      
      boldTextChangedListener = AccessibilityInfo.addEventListener(
        'boldTextChanged',
        isEnabled => {
          if (mounted) {
            setState(prev => ({ ...prev, boldTextEnabled: isEnabled }));
          }
        }
      );
    }

    // Cleanup listeners on unmount
    return () => {
      mounted = false;
      screenReaderChangedListener.remove();
      reduceMotionChangedListener.remove();
      
      if (reduceTransparencyChangedListener) {
        reduceTransparencyChangedListener.remove();
      }
      
      if (boldTextChangedListener) {
        boldTextChangedListener.remove();
      }
    };
  }, []);

  return state;
} 