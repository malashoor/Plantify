import React from 'react';
import {
  TouchableWithoutFeedback,
  Keyboard,
  View,
  ViewProps,
  Platform,
  AccessibilityInfo,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';

interface KeyboardDismissViewProps extends ViewProps {
  children: React.ReactNode;
  enabled?: boolean;
  shouldAnnounce?: boolean;
}

export default function KeyboardDismissView({
  children,
  enabled = true,
  shouldAnnounce = true,
  style,
  ...props
}: KeyboardDismissViewProps) {
  const { t } = useTranslation();

  const handleDismiss = () => {
    if (!enabled) return;
    
    Keyboard.dismiss();
    
    if (shouldAnnounce && Platform.OS === 'ios') {
      AccessibilityInfo.announceForAccessibility(
        t('accessibility.keyboard_dismissed', 'Keyboard dismissed')
      );
    }
  };

  if (!enabled) {
    return (
      <View style={[styles.container, style]} {...props}>
        {children}
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback
      onPress={handleDismiss}
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    >
      <View style={[styles.container, style]} {...props}>
        {children}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 