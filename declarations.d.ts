/// <reference types="react" />
/// <reference types="react-native" />

// Environment variables from .env file
declare module '@env' {
  export const SUPABASE_URL: string;
  export const SUPABASE_ANON_KEY: string;
  export const SUPABASE_SERVICE_ROLE: string;
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

declare module 'react-i18next' {
  export function useTranslation(): {
    t: (key: string, defaultValue?: string) => string;
  };
}

// Asset imports
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

// Fix for React Native JSX components
declare module 'react-native' {
  export * from 'react-native';
}

// Fix for React JSX
declare module 'react' {
  interface ReactElement {
    children?: React.ReactNode;
  }

  // Add missing React hooks
  export function useState<T>(
    initialState: T | (() => T)
  ): [T, (newState: T | ((prevState: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: readonly any[]): void;
  export function useCallback<T extends (...args: any[]) => any>(
    callback: T,
    deps: readonly any[]
  ): T;
  export function useMemo<T>(factory: () => T, deps: readonly any[]): T;
  export function useRef<T>(initialValue: T): { current: T };
  export function useContext<T>(context: React.Context<T>): T;
}
