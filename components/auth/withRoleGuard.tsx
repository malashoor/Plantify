import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from '@rneui/themed';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/supabase';

interface WithRoleGuardOptions {
  allowedRoles: UserRole[];
  redirectTo?: string;
  showReadOnlyBanner?: boolean;
}

/**
 * Higher-Order Component that protects routes based on user roles
 * @param Component The component to protect
 * @param options Configuration options for the role guard
 * @returns A wrapped component with role-based protection
 */
export function withRoleGuard<P extends object>(
  Component: React.ComponentType<P>,
  options: WithRoleGuardOptions
) {
  const { allowedRoles, redirectTo = '/', showReadOnlyBanner = true } = options;
  
  const WithRoleGuard = (props: P) => {
    const router = useRouter();
    const { user, userRole, loading } = useAuth();
    const { theme } = useTheme();
    
    // Check if the current user has an allowed role
    const hasPermission = allowedRoles.includes(userRole);
    
    // Check if they have view-only access
    const isViewOnly = userRole === 'child' && allowedRoles.includes('child');
    
    useEffect(() => {
      // If not loading and either not authenticated or doesn't have permission
      if (!loading && (!user || (!hasPermission && !isViewOnly))) {
        // Redirect to specified path
        router.replace(redirectTo);
      }
    }, [loading, user, hasPermission, isViewOnly, router, redirectTo]);
    
    // Show loading while checking auth
    if (loading || (!hasPermission && !isViewOnly)) {
      return null;
    }
    
    // Show the view-only banner for child users if they have read-only access
    if (isViewOnly && showReadOnlyBanner) {
      return (
        <View style={styles.container}>
          <View 
            style={[
              styles.banner, 
              { backgroundColor: theme.colors.warning }
            ]}
            accessibilityRole="alert"
          >
            <Text style={styles.bannerText}>View only mode - You can view but not modify content</Text>
          </View>
          <Component {...props} />
        </View>
      );
    }
    
    // User has full access
    return <Component {...props} />;
  };
  
  // Set display name for debugging
  const componentName = Component.displayName || Component.name || 'Component';
  WithRoleGuard.displayName = `withRoleGuard(${componentName})`;
  
  return WithRoleGuard;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  banner: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    width: '100%',
  },
  bannerText: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
}); 