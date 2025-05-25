declare module 'react-native-svg-charts' {
  import { ViewStyle } from 'react-native';
  import { SvgProps } from 'react-native-svg';

  interface ChartProps {
    style?: ViewStyle;
    data: number[];
    svg?: SvgProps;
    contentInset?: {
      top?: number;
      bottom?: number;
      left?: number;
      right?: number;
    };
    curve?: boolean;
    animate?: boolean;
    animationDuration?: number;
  }

  interface AxisProps extends ChartProps {
    formatLabel?: (value: number, index: number) => string;
    numberOfTicks?: number;
    min?: number;
    max?: number;
    scale?: any;
  }

  interface GridProps extends ChartProps {
    direction?: 'HORIZONTAL' | 'VERTICAL' | 'BOTH';
    belowChart?: boolean;
    svg?: SvgProps;
  }

  export class LineChart extends React.Component<ChartProps> {}
  export class Grid extends React.Component<GridProps> {}
  export class XAxis extends React.Component<AxisProps> {}
  export class YAxis extends React.Component<AxisProps> {}
} 