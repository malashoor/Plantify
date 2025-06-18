import { NavigatorScreenParams } from '@react-navigation/native';
import { AdminStackParamList } from './AdminStack';

export type RootTabParamList = {
  Home: undefined;
  Tools: undefined;
  Profile: undefined;
  Admin: NavigatorScreenParams<AdminStackParamList>;
};

export type ToolsStackParamList = {
  ToolsList: undefined;
  NutrientCalculator: undefined;
  LightingCalculator: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootTabParamList {}
  }
}
