declare module 'react-native-web' {
  import { ComponentType } from 'react';
  import { AppRegistry } from 'react-native';

  export function renderToString(element: React.ReactElement): string;
  
  export interface AppRegistryStatic {
    registerComponent(appKey: string, component: ComponentType<any>): void;
    getApplication(appKey: string, props?: any): {
      element: React.ReactElement;
      getStyleElement: () => React.ReactElement;
    };
  }
} 