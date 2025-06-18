import React from 'react';
import { View, Text } from 'react-native';

export default function Identify() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' }}>
        Plant Identifier
      </Text>
      <Text style={{ fontSize: 16, color: '#666', textAlign: 'center', lineHeight: 24 }}>
        Camera-based plant identification feature coming soon!{'\n\n'}
        This will allow you to take photos and get instant plant identification.
      </Text>
    </View>
  );
} 