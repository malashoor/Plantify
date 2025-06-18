import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ExportDataScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Export Data</Text>
      <Text style={styles.subtitle}>Export your plant data and analytics</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
}); 