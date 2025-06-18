import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function OfflineNotice() {
  // TODO: Add actual network connectivity checking
  const isConnected = true; // For now, assume always connected

  if (isConnected) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>No internet connection</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FF5252',
    padding: 8,
    alignItems: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});
