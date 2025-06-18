import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface OfflineNoticeProps {
  isOffline?: boolean;
}

export default function OfflineNotice({ isOffline = false }: OfflineNoticeProps) {
  if (!isOffline) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>You are currently offline</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FF9800',
    padding: 8,
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});
