import 'react-native';

declare module 'react-native' {
  import * as React from 'react';

  export interface ViewProps {
    style?: any;
    children?: React.ReactNode;
  }

  export interface StyleSheetStatic {
    create<T extends { [key: string]: any }>(styles: T): T;
  }

  export interface ViewStyle {
    backgroundColor?: string;
    borderColor?: string;
    borderRadius?: number;
    borderWidth?: number;
    margin?: number;
    marginBottom?: number;
    marginHorizontal?: number;
    marginLeft?: number;
    marginRight?: number;
    marginTop?: number;
    marginVertical?: number;
    padding?: number;
    paddingBottom?: number;
    paddingHorizontal?: number;
    paddingLeft?: number;
    paddingRight?: number;
    paddingTop?: number;
    paddingVertical?: number;
    flex?: number;
    flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
    flexWrap?: 'wrap' | 'nowrap' | 'wrap-reverse';
    justifyContent?:
      | 'flex-start'
      | 'flex-end'
      | 'center'
      | 'space-between'
      | 'space-around'
      | 'space-evenly';
    alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
    alignSelf?: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
    position?: 'absolute' | 'relative';
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
    width?: number | string;
    height?: number | string;
    maxWidth?: number | string;
    maxHeight?: number | string;
    minWidth?: number | string;
    minHeight?: number | string;
    opacity?: number;
    overflow?: 'visible' | 'hidden' | 'scroll';
    zIndex?: number;
    elevation?: number;
    shadowColor?: string;
    shadowOffset?: { width: number; height: number };
    shadowOpacity?: number;
    shadowRadius?: number;
  }

  export interface TextStyle {
    color?: string;
    fontSize?: number;
    fontFamily?: string;
    fontStyle?: 'normal' | 'italic';
    fontWeight?:
      | 'normal'
      | 'bold'
      | '100'
      | '200'
      | '300'
      | '400'
      | '500'
      | '600'
      | '700'
      | '800'
      | '900';
    letterSpacing?: number;
    lineHeight?: number;
    textAlign?: 'auto' | 'left' | 'right' | 'center' | 'justify';
    textDecorationLine?: 'none' | 'underline' | 'line-through' | 'underline line-through';
    textDecorationStyle?: 'solid' | 'double' | 'dotted' | 'dashed';
    textDecorationColor?: string;
    textShadowColor?: string;
    textShadowOffset?: { width: number; height: number };
    textShadowRadius?: number;
    textTransform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase';
  }

  export interface ImageStyle {
    resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
    tintColor?: string;
    overlayColor?: string;
  }

  export type StyleProp<T> = T | Array<T | undefined | false | null> | undefined;

  export const View: React.ComponentType<ViewProps>;
  export const StyleSheet: StyleSheetStatic;
}
