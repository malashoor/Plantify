import React from 'react';
import { View, Text, Button } from 'react-native';

export default function Home() {
  return (
    <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
      <Text>Welcome to Plantify!</Text>
      <Button title="Next" onPress={() => {}} />
    </View>
  );
}
