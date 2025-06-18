import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ErrorMessageProps {
  message: string;
  style?: any;
}

export function ErrorMessage({ message, style }: ErrorMessageProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffebee',
    borderWidth: 1,
    borderColor: '#e57373',
    borderRadius: 8,
    padding: 16,
    margin: 8,
  },
  message: {
    color: '#d32f2f',
    fontSize: 14,
    textAlign: 'center',
  },
});
