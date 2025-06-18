declare module 'expo-router' {
  import * as React from 'react';

  export interface StackScreenProps {
    options?: {
      title?: string;
      headerShown?: boolean;
      headerTitle?: string;
      headerTitleStyle?: any;
      headerStyle?: any;
      headerTintColor?: string;
      headerLeft?: () => React.ReactNode;
      headerRight?: () => React.ReactNode;
    };
    children?: React.ReactNode;
  }

  export interface StackProps {
    children?: React.ReactNode;
    screenOptions?: {
      headerShown?: boolean;
      headerStyle?: any;
      headerTitleStyle?: any;
      headerTintColor?: string;
    };
  }

  export const Stack: {
    Screen: React.ComponentType<StackScreenProps>;
  } & React.ComponentType<StackProps>;

  export interface LinkProps {
    href: string;
    children?: React.ReactNode;
    asChild?: boolean;
  }

  export const Link: React.ComponentType<LinkProps>;

  export interface RouterProps {
    push: (href: string) => void;
    replace: (href: string) => void;
    back: () => void;
  }

  export function useRouter(): RouterProps;
  export function useSegments(): string[];
  export function usePathname(): string;
}
