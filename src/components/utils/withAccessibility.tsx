import React, { useEffect, useRef } from 'react';
import { AccessibilityInfo, Platform, View } from 'react-native';
import { useFocusManagement } from '@hooks/useFocusManagement';

interface WithAccessibilityProps {
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: string;
  accessibilityState?: {
    disabled?: boolean;
    selected?: boolean;
    checked?: boolean;
    busy?: boolean;
    expanded?: boolean;
  };
  shouldFocusOnMount?: boolean;
  shouldAnnounceOnMount?: boolean;
  onAccessibilityTap?: () => void;
  onMagicTap?: () => void;
}

export function withAccessibility<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  defaultProps: Partial<WithAccessibilityProps> = {}
) {
  return function AccessibleComponent({
    accessibilityLabel,
    accessibilityHint,
    accessibilityRole,
    accessibilityState,
    shouldFocusOnMount = false,
    shouldAnnounceOnMount = false,
    onAccessibilityTap,
    onMagicTap,
    ...props
  }: P & WithAccessibilityProps) {
    const { elementRef, setFocus } = useFocusManagement();
    const isScreenReaderEnabled = useRef(false);

    useEffect(() => {
      // Check if screen reader is enabled
      AccessibilityInfo.isScreenReaderEnabled().then(enabled => {
        isScreenReaderEnabled.current = enabled;
      });

      // Subscribe to screen reader changes
      const subscription = AccessibilityInfo.addEventListener('screenReaderChanged', enabled => {
        isScreenReaderEnabled.current = enabled;
      });

      return () => {
        subscription.remove();
      };
    }, []);

    useEffect(() => {
      if (shouldFocusOnMount && isScreenReaderEnabled.current) {
        // Small delay to ensure the component is mounted
        const timer = setTimeout(() => {
          setFocus({
            shouldAnnounce: shouldAnnounceOnMount,
            announcementMessage: accessibilityLabel,
          });
        }, 100);

        return () => clearTimeout(timer);
      }
    }, [shouldFocusOnMount, shouldAnnounceOnMount, accessibilityLabel, setFocus]);

    const mergedAccessibilityProps = {
      accessible: true,
      accessibilityLabel: accessibilityLabel || defaultProps.accessibilityLabel,
      accessibilityHint: accessibilityHint || defaultProps.accessibilityHint,
      accessibilityRole: accessibilityRole || defaultProps.accessibilityRole,
      accessibilityState: {
        ...defaultProps.accessibilityState,
        ...accessibilityState,
      },
      onAccessibilityTap: onAccessibilityTap || defaultProps.onAccessibilityTap,
      onMagicTap: onMagicTap || defaultProps.onMagicTap,
    };

    if (Platform.OS === 'ios') {
      return (
        <View ref={elementRef} {...mergedAccessibilityProps}>
          <WrappedComponent {...(props as P)} />
        </View>
      );
    }

    // On Android, we don't need the extra View wrapper
    return <WrappedComponent ref={elementRef} {...mergedAccessibilityProps} {...(props as P)} />;
  };
}
