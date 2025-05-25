/// <reference types="react" />
/// <reference types="react-native" />
/// <reference types="react-i18next" />
/// <reference types="expo-image" />

// Global TypeScript declarations for the project

// Override React's FC type to fix JSX component issues
import React from 'react';

declare global {
  // Fix for React's functional component type
  // This addresses the JSX error: "Property 'children' is missing in type 'ReactElement'"
  namespace React {
    // eslint-disable-next-line @typescript-eslint/ban-types
    type FC<P = {}> = React.FunctionComponent<P>;
    // eslint-disable-next-line @typescript-eslint/ban-types
    interface FunctionComponent<P = {}> {
      (props: P, context?: any): React.ReactElement<any, any> | null;
      propTypes?: React.WeakValidationMap<P>;
      contextTypes?: React.ValidationMap<any>;
      defaultProps?: Partial<P>;
      displayName?: string;
    }
  }

  // Add window environment variables for TypeScript
  interface Window {
    ENV?: {
      EXPO_PUBLIC_APP_STORE_URL: string;
      EXPO_PUBLIC_PLAY_STORE_URL: string;
    };
    posthog?: {
      capture: (eventName: string, properties?: Record<string, unknown>) => void;
      identify: (id?: string, traits?: Record<string, unknown>) => void;
      reset: () => void;
    };
  }
  
  // Add process.env types for environment variables
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_APP_STORE_URL?: string;
      EXPO_PUBLIC_PLAY_STORE_URL?: string;
      EXPO_PUBLIC_POSTHOG_API_KEY?: string;
      NODE_ENV?: 'development' | 'production' | 'test';
    }
  }
}

// Empty export to make this a module
export {};

declare module 'react-i18next' {
  export function useTranslation(): {
    t: (key: string, defaultValue?: string) => string;
  };
}

declare module 'expo-image' {
  import { ImageProps } from 'react-native';
  export interface ImageProps extends ImageProps {
    contentFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  }
  export const Image: React.FC<ImageProps>;
}

declare module 'react-native-reanimated' {
  export * from 'react-native-reanimated/lib/reanimated2';
}

declare module 'react-native-gesture-handler' {
  export * from 'react-native-gesture-handler/lib/typescript';
}

declare module '*.png' {
  const value: any;
  export default value;
}

declare module '*.jpg' {
  const value: any;
  export default value;
}

declare module '*.jpeg' {
  const value: any;
  export default value;
}

declare module '*.gif' {
  const value: any;
  export default value;
}

declare module '*.svg' {
  const value: any;
  export default value;
}

// Add missing React Native types
declare module 'react-native' {
  export const Dimensions: {
    get: (dimension: string) => number;
    window: {
      width: number;
      height: number;
    };
  };
  export const I18nManager: {
    isRTL: boolean;
  };
  export const AccessibilityInfo: {
    announceForAccessibility: (announcement: string) => void;
  };
  export const useColorScheme: () => 'light' | 'dark' | null;
  interface ViewProps {
    children?: React.ReactNode;
  }
  interface TextProps {
    children?: React.ReactNode;
  }
  interface TouchableOpacityProps {
    children?: React.ReactNode;
  }
}

// Fix for React JSX
declare module 'react' {
  interface ReactElement {
    children?: React.ReactNode;
  }
  
  // Add missing React hooks
  export function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: readonly any[]): void;
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: readonly any[]): T;
  export function useMemo<T>(factory: () => T, deps: readonly any[]): T;
  export function useRef<T>(initialValue: T): { current: T };
  export function useContext<T>(context: React.Context<T>): T;
  
  // Add memo type
  export function memo<P extends object>(
    Component: React.FunctionComponent<P>,
    propsAreEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean
  ): React.FunctionComponent<P> & {
    displayName?: string;
  };
} 