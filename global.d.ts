declare module 'react-native' {
  import * as React from 'react';

  export interface ViewProps {
    accessible?: boolean;
    accessibilityLabel?: string;
    accessibilityRole?: string;
    testID?: string;
    style?: any;
    children?: React.ReactNode;
  }

  export interface TextProps {
    allowFontScaling?: boolean;
    accessibilityLabel?: string;
    testID?: string;
    style?: any;
    children?: React.ReactNode;
  }

  export interface TextInputProps {
    value?: string;
    onChangeText?: (text: string) => void;
    placeholder?: string;
    style?: any;
    multiline?: boolean;
    onKeyPress?: (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => void;
    ref?: React.RefObject<any>;
  }

  export interface ScrollViewProps {
    ref?: React.RefObject<any>;
    style?: any;
    contentContainerStyle?: any;
    children?: React.ReactNode;
  }

  export interface TouchableOpacityProps {
    onPress?: () => void;
    style?: any;
    children?: React.ReactNode;
    accessibilityLabel?: string;
    testID?: string;
  }

  export interface ActivityIndicatorProps {
    size?: 'small' | 'large';
    color?: string;
    style?: any;
  }

  export interface KeyboardAvoidingViewProps {
    behavior?: 'height' | 'position' | 'padding';
    style?: any;
    children?: React.ReactNode;
  }

  export interface StyleSheetStatic {
    create<T extends { [key: string]: any }>(styles: T): T;
  }

  export interface NativeSyntheticEvent<T> {
    nativeEvent: T;
  }

  export interface TextInputKeyPressEventData {
    key: string;
    metaKey: boolean;
    ctrlKey: boolean;
  }

  // Export core RN components
  export const View: React.ComponentType<ViewProps>;
  export const Text: React.ComponentType<TextProps>;
  export const TextInput: React.ComponentType<TextInputProps>;
  export const ScrollView: React.ComponentType<ScrollViewProps>;
  export const TouchableOpacity: React.ComponentType<TouchableOpacityProps>;
  export const ActivityIndicator: React.ComponentType<ActivityIndicatorProps>;
  export const KeyboardAvoidingView: React.ComponentType<KeyboardAvoidingViewProps>;
  export const StyleSheet: StyleSheetStatic;
  export const Alert: {
    alert: (title: string, message?: string, buttons?: Array<{ text: string, onPress?: () => void }>) => void;
  };
  export const AccessibilityInfo: {
    isScreenReaderEnabled: () => Promise<boolean>;
    announceForAccessibility: (message: string) => void;
  };
  export const Keyboard: {
    dismiss: () => void;
  };
  export const Platform: {
    OS: 'ios' | 'android' | 'web';
    select: <T extends { [key: string]: any }>(obj: T) => any;
  };
  export const useColorScheme: () => 'light' | 'dark' | null;

  // Fallback for undeclared modules
  const content: any;
  export default content;
} 