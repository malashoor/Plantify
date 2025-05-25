declare module '@tanstack/react-query-devtools' {
  import { ReactNode } from 'react';

  export type DevtoolsPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

  export interface DevtoolsOptions {
    initialIsOpen?: boolean;
    position?: DevtoolsPosition;
    buttonPosition?: DevtoolsPosition;
  }

  export interface ReactQueryDevtoolsProps extends DevtoolsOptions {
    children?: ReactNode;
  }

  export function ReactQueryDevtools(props: ReactQueryDevtoolsProps): JSX.Element;
} 