import { NativeStackScreenProps } from '@react-navigation/native-stack';

// Navigation Types
export type RootStackParamList = {
  '(tabs)': undefined;
  'hydroponics': undefined;
  'hydroponics/[id]': { id: string };
  'hydroponics/new': undefined;
  'profile': undefined;
  'auth/login': undefined;
  'auth/register': undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

// Chart Types
export interface ChartDataPoint {
  timestamp: Date;
  value: number;
  label: string;
}

export interface ChartDataset {
  label: string;
  data: ChartDataPoint[];
  color: string;
}

// Utility Types
export type Nullable<T> = T | null;

export type WithId<T> = T & { id: string };

export type WithTimestamps<T> = T & {
  created_at: string;
  updated_at: string;
};

// Component Props Types
export interface BaseComponentProps {
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export interface LoadingProps extends BaseComponentProps {
  size?: 'small' | 'large';
  color?: string;
}

export interface ErrorProps extends BaseComponentProps {
  message?: string;
  onRetry?: () => void;
}

// Re-export existing types
export * from './hydroponic';
export * from './errors'; 