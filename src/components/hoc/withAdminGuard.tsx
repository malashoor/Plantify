import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { checkIsAdmin } from '../../utils/supabase';
import { Text } from '../ui/Text';

export function withAdminGuard<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function AdminGuardComponent(props: P) {
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const navigation = useNavigation();

    useEffect(() => {
      const verifyAdmin = async () => {
        const hasAccess = await checkIsAdmin();
        setIsAdmin(hasAccess);
        if (!hasAccess) {
          navigation.goBack();
        }
      };

      verifyAdmin();
    }, [navigation]);

    if (isAdmin === null) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 10 }}>Verifying access...</Text>
        </View>
      );
    }

    if (!isAdmin) {
      return null; // Will navigate away
    }

    return <WrappedComponent {...props} />;
  };
} 