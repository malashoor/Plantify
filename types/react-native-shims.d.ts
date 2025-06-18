declare module 'react-native/Libraries/Components/View/ViewStylePropTypes';
declare module 'react-native/Libraries/StyleSheet/StyleSheetValidation';
declare module 'react-native/Libraries/Components/TextInput/TextInput';
declare module 'react-native/Libraries/Components/ScrollView/ScrollView';
declare module 'react-native/Libraries/LayoutAnimation/LayoutAnimation';
declare module 'react-native/Libraries/Animated/Animated';
declare module 'react-native/Libraries/Components/Pressable/Pressable';
declare module 'react-native/Libraries/Image/Image';
declare module 'react-native/Libraries/Modal/Modal';
declare module 'react-native/Libraries/Components/View/View' {
  import * as React from 'react';
  import { ViewProps } from 'react-native';
  export const View: React.ComponentType<ViewProps>;
  export default View;
}
