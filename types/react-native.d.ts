declare module 'react-native' {
  import * as React from 'react';

  export interface ViewProps {
    style?: any;
    children?: React.ReactNode;
  }

  export interface StyleSheetStatic {
    create<T extends { [key: string]: any }>(styles: T): T;
  }

  export class View extends React.Component<ViewProps> {}
  export const StyleSheet: StyleSheetStatic;
} 