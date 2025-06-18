import React from 'react';
import { View, StyleSheet } from 'react-native';
import BackHeader from '../../components/layout/BackHeader';
import { Text } from '../../components/ui/Text';

export default function JourneyScreen() {
  return (
    <View style={styles.container}>
      <BackHeader title="My Growing Journey" />
      <View style={styles.content}>
        <Text>Journey content goes here</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
});
