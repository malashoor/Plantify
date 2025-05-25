import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { Header } from '@rneui/themed';
import { useRouter } from 'expo-router';

interface PageLayoutProps {
  title: string;
  showBackButton?: boolean;
  headerRight?: React.ReactNode;
  backgroundColor?: string;
  children: React.ReactNode;
}

export function PageLayout({ 
  title, 
  showBackButton = true, 
  headerRight,
  backgroundColor = '#f5f5f5',
  children 
}: PageLayoutProps) {
  const router = useRouter();

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <Header
        centerComponent={{ text: title, style: { color: '#fff', fontSize: 18, fontWeight: 'bold' } }}
        leftComponent={showBackButton ? {
          icon: 'arrow-back',
          color: '#fff',
          onPress: handleBackPress,
        } : undefined}
        rightComponent={headerRight}
        backgroundColor="#2E7D32"
      />
      <View style={styles.content}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
}); 