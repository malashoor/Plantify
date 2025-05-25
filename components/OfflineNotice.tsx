import NetInfo from '@react-native-community/netinfo';
import { WifiOff } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';

import { View, Text, StyleSheet, Platform } from 'react-native';

export default function OfflineNotice() {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    // Handle both web and native platforms
    if (Platform.OS === 'web') {
      const handleConnectivityChange = () => {
        setIsConnected(navigator.onLine);
      };

      // Set initial state
      setIsConnected(navigator.onLine);

      // Add event listeners
      window.addEventListener('online', handleConnectivityChange);
      window.addEventListener('offline', handleConnectivityChange);

      // Clean up
      return () => {
        window.removeEventListener('online', handleConnectivityChange);
        window.removeEventListener('offline', handleConnectivityChange);
      };
    } else {
      // For native platforms, use NetInfo
      const unsubscribe = NetInfo.addEventListener((state) => {
        setIsConnected(state.isConnected ?? true);
      });

      // Initial check
      NetInfo.fetch().then((state) => {
        setIsConnected(state.isConnected ?? true);
      });

      return () => {
        unsubscribe();
      };
    }
  }, []);

  if (isConnected) {
    return null;
  }

  return (
    <View 
      style={styles.offlineContainer} 
      accessibilityRole="alert"
      accessibilityLabel="No internet connection"
      testID="offline-banner"
    >
      <WifiOff size={16} color="white" />
      <Text style={styles.offlineText}>No Internet Connection</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  offlineContainer: {
    backgroundColor: '#b52424',
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
    position: 'absolute',
    top: 0,
    zIndex: 1000,
  },
  offlineText: {
    color: '#fff',
    marginLeft: 8,
    fontFamily: 'Poppins-Medium',
  }
});
