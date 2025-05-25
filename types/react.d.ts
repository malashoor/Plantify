import 'react';

declare module 'react' {
  interface FunctionComponent<P = {}> {
    (props: P, context?: any): React.ReactElement<any, any> | null;
  }

  interface FC<P = {}> extends FunctionComponent<P> {}

  interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
    type: T;
    props: P;
    key: Key | null;
  }

  export type ReactNode = React.ReactNode;
  export type ReactElement = React.ReactElement;
  export type ComponentType<P = {}> = React.ComponentType<P>;
  export type FC<P = {}> = React.FC<P>;
  
  export function memo<P extends object>(
    Component: React.ComponentType<P>,
    propsAreEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean
  ): React.ComponentType<P>;
}

declare module 'react-native' {
  interface ViewProps {
    testID?: string;
  }

  interface TextProps {
    numberOfLines?: number;
  }
} 