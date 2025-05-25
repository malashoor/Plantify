// types/react-native.d.ts

// Tell TS about React Native's built-in types in case they're not picked up
declare module 'react-native' {
  import * as RN from 'react-native';
  export = RN;
}

// Also ensure other RN-specific modules resolve
declare module 'react-native-vector-icons/*';
declare module 'expo-linear-gradient';
declare module 'expo-image'; 