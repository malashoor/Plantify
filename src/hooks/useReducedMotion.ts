import { useState, useEffect } from 'react';
import { AccessibilityInfo } from 'react-native';

export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkReducedMotion = async () => {
      try {
        const isReduced = await AccessibilityInfo.isReduceMotionEnabled();
        if (mounted) {
          setPrefersReducedMotion(isReduced);
        }
      } catch (error) {
        console.error('Failed to check reduced motion preference:', error);
        if (mounted) {
          setPrefersReducedMotion(false);
        }
      }
    };

    // Check initial state
    checkReducedMotion();

    // Listen for changes
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', isReduced => {
      if (mounted) {
        setPrefersReducedMotion(isReduced);
      }
    });

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return prefersReducedMotion;
};
