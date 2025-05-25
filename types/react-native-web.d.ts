// This file adds or extends declarations for React Native Web
// It helps TypeScript understand how the components should be typed in a web context

import 'react-native';

declare module 'react-native' {
  // Ensure Platform is usable as a value
  export const Platform: {
    OS: 'ios' | 'android' | 'web';
    select: <T extends Record<string, any>>(spec: T) => T[keyof T];
  };

  // Make StyleSheet.create properly typed
  export const StyleSheet: {
    create: <T extends Record<string, any>>(styles: T) => T;
    [key: string]: any;
  };
}

// Add proper typings for React Native components in JSX
declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Add React Native components that need to be used in JSX
      'SafeAreaView': React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
      'ScrollView': React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
      'View': React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
      'Text': React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
      'TouchableOpacity': React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
      'Image': React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>;
    }
  }
} 