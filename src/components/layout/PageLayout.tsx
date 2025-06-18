import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PageLayoutProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: any;
}

export function PageLayout({ children, scrollable = true, style }: PageLayoutProps) {
  const Container = scrollable ? ScrollView : View;
  
  return (
    <SafeAreaView style={[styles.container, style]}>
      <Container style={scrollable ? styles.scrollView : styles.view}>
        {children}
      </Container>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  view: {
    flex: 1,
  },
}); 