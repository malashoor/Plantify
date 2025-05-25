declare module 'react-native-svg' {
  import { ComponentType } from 'react';
  import { ViewProps, TextProps, ImageProps } from 'react-native';

  export interface SvgProps extends ViewProps {
    width?: number | string;
    height?: number | string;
    viewBox?: string;
    preserveAspectRatio?: string;
    color?: string;
    opacity?: number;
    fill?: string;
    fillOpacity?: number;
    stroke?: string;
    strokeWidth?: number;
    strokeOpacity?: number;
    strokeLinecap?: 'butt' | 'round' | 'square';
    strokeLinejoin?: 'miter' | 'round' | 'bevel';
    strokeDasharray?: string | number[];
    strokeDashoffset?: number;
    x?: number | string;
    y?: number | string;
    rotation?: number;
    scale?: number;
    origin?: string;
    originX?: number;
    originY?: number;
  }

  export interface PathProps extends SvgProps {
    d?: string;
  }

  export interface CircleProps extends SvgProps {
    cx?: number | string;
    cy?: number | string;
    r?: number | string;
  }

  export interface RectProps extends SvgProps {
    x?: number | string;
    y?: number | string;
    width?: number | string;
    height?: number | string;
    rx?: number | string;
    ry?: number | string;
  }

  export interface LineProps extends SvgProps {
    x1?: number | string;
    y1?: number | string;
    x2?: number | string;
    y2?: number | string;
  }

  export interface TextProps extends SvgProps, TextProps {
    dx?: number | string;
    dy?: number | string;
    rotate?: number | string;
    textAnchor?: 'start' | 'middle' | 'end';
  }

  export interface ImageProps extends SvgProps, ImageProps {
    preserveAspectRatio?: string;
  }

  export const Svg: ComponentType<SvgProps>;
  export const Path: ComponentType<PathProps>;
  export const Circle: ComponentType<CircleProps>;
  export const Rect: ComponentType<RectProps>;
  export const Line: ComponentType<LineProps>;
  export const Text: ComponentType<TextProps>;
  export const Image: ComponentType<ImageProps>;
} 