declare module 'react-native' {
  import type { ComponentType } from 'react';

  export interface ViewStyle {
    [key: string]: any;
  }

  export interface TextStyle {
    [key: string]: any;
  }

  export interface ImageStyle {
    [key: string]: any;
  }

  export interface ViewProps {
    style?: ViewStyle | ViewStyle[];
    testID?: string;
    accessibilityLabel?: string;
    children?: React.ReactNode;
  }

  export interface TextProps {
    style?: TextStyle | TextStyle[];
    children?: React.ReactNode;
    numberOfLines?: number;
  }

  export interface TouchableOpacityProps {
    style?: ViewStyle | ViewStyle[];
    onPress?: () => void;
    disabled?: boolean;
    testID?: string;
    accessibilityLabel?: string;
    accessibilityRole?: string;
    accessibilityState?: {
      checked?: boolean;
      disabled?: boolean;
    };
    children?: React.ReactNode;
  }

  export interface ScrollViewProps {
    style?: ViewStyle | ViewStyle[];
    contentContainerStyle?: ViewStyle | ViewStyle[];
    showsVerticalScrollIndicator?: boolean;
    children?: React.ReactNode;
  }

  export const View: ComponentType<ViewProps>;
  export const Text: ComponentType<TextProps>;
  export const TouchableOpacity: ComponentType<TouchableOpacityProps>;
  export const ScrollView: ComponentType<ScrollViewProps>;

  export const StyleSheet: {
    create<T extends { [key: string]: ViewStyle | TextStyle | ImageStyle }>(styles: T): T;
  };

  export const Platform: {
    OS: 'ios' | 'android' | 'web';
    select: <T>(spec: { ios?: T; android?: T; default?: T }) => T;
  };

  export const useColorScheme: () => 'light' | 'dark' | null;

  export const Alert: {
    alert: (
      title: string,
      message?: string,
      buttons?: Array<{
        text: string;
        onPress?: () => void;
        style?: 'default' | 'cancel' | 'destructive';
      }>,
      options?: {
        cancelable?: boolean;
        onDismiss?: () => void;
      }
    ) => void;
  };

  export const Animated: {
    View: ComponentType<ViewProps>;
    Text: ComponentType<TextProps>;
    ScrollView: ComponentType<ScrollViewProps>;
    Value: typeof AnimatedValue;
    timing: (
      value: AnimatedValue,
      config: {
        toValue: number;
        duration?: number;
        delay?: number;
        useNativeDriver?: boolean;
      }
    ) => {
      start: (callback?: (result: { finished: boolean }) => void) => void;
    };
  };

  class AnimatedValue {
    constructor(value: number);
    setValue(value: number): void;
    interpolate(config: { inputRange: number[]; outputRange: number[] | string[] }): AnimatedValue;
  }
}
