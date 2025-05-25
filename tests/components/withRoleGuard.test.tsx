import React from 'react';
import { render, act } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import { withRoleGuard } from '@/components/auth/withRoleGuard';
import * as AuthHook from '@/hooks/useAuth';

// Mock the useRouter hook
jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));

// Mock the useTheme hook
jest.mock('@rneui/themed', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        warning: '#FFC107',
        background: '#FFFFFF',
      },
    },
  }),
}));

// Create a simple test component
const TestComponent = () => (
  <View testID="test-component">
    <Text>Test Content</Text>
  </View>
);

describe('withRoleGuard HOC', () => {
  // Save the original implementation
  const originalUseAuth = AuthHook.useAuth;
  
  // Cleanup after tests
  afterEach(() => {
    // Restore the original implementation
    (AuthHook as any).useAuth = originalUseAuth;
  });
  
  test('renders component when user has the allowed role (admin)', () => {
    // Mock implementation for admin user
    (AuthHook as any).useAuth = jest.fn(() => ({
      user: { id: 'user-1' },
      userRole: 'admin',
      loading: false,
    }));
    
    // Wrap the test component with the role guard
    const ProtectedComponent = withRoleGuard(TestComponent, {
      allowedRoles: ['admin', 'grower'],
    });
    
    // Render the protected component
    const { getByTestId } = render(<ProtectedComponent />);
    
    // Verify the component is rendered
    expect(getByTestId('test-component')).toBeTruthy();
  });
  
  test('renders component when user has the allowed role (grower)', () => {
    // Mock implementation for grower user
    (AuthHook as any).useAuth = jest.fn(() => ({
      user: { id: 'user-1' },
      userRole: 'grower',
      loading: false,
    }));
    
    // Wrap the test component with the role guard
    const ProtectedComponent = withRoleGuard(TestComponent, {
      allowedRoles: ['admin', 'grower'],
    });
    
    // Render the protected component
    const { getByTestId } = render(<ProtectedComponent />);
    
    // Verify the component is rendered
    expect(getByTestId('test-component')).toBeTruthy();
  });
  
  test('renders "view only" banner for child user with read access', () => {
    // Mock implementation for child user
    (AuthHook as any).useAuth = jest.fn(() => ({
      user: { id: 'user-1' },
      userRole: 'child',
      loading: false,
    }));
    
    // Wrap the test component with the role guard that allows child role for view-only
    const ProtectedComponent = withRoleGuard(TestComponent, {
      allowedRoles: ['admin', 'grower', 'child'],
      showReadOnlyBanner: true,
    });
    
    // Render the protected component
    const { getByText, getByTestId } = render(<ProtectedComponent />);
    
    // Verify the view-only banner is shown
    expect(getByText('View only mode - You can view but not modify content')).toBeTruthy();
    
    // Verify the component is still rendered
    expect(getByTestId('test-component')).toBeTruthy();
  });
  
  test('redirects when user does not have an allowed role', () => {
    // Mock useRouter
    const replaceMock = jest.fn();
    require('expo-router').useRouter = () => ({
      replace: replaceMock,
    });
    
    // Mock implementation for child user
    (AuthHook as any).useAuth = jest.fn(() => ({
      user: { id: 'user-1' },
      userRole: 'child',
      loading: false,
    }));
    
    // Wrap the test component with the role guard that doesn't allow child role
    const ProtectedComponent = withRoleGuard(TestComponent, {
      allowedRoles: ['admin', 'grower'],
      redirectTo: '/home',
    });
    
    // Render the protected component
    const { queryByTestId } = render(<ProtectedComponent />);
    
    // Verify the redirect was called
    expect(replaceMock).toHaveBeenCalledWith('/home');
    
    // Verify the component is not rendered
    expect(queryByTestId('test-component')).toBeNull();
  });
  
  test('does not render anything while loading', () => {
    // Mock implementation for loading state
    (AuthHook as any).useAuth = jest.fn(() => ({
      user: null,
      userRole: 'child',
      loading: true,
    }));
    
    // Wrap the test component with the role guard
    const ProtectedComponent = withRoleGuard(TestComponent, {
      allowedRoles: ['admin', 'grower'],
    });
    
    // Render the protected component
    const { queryByTestId } = render(<ProtectedComponent />);
    
    // Verify the component is not rendered while loading
    expect(queryByTestId('test-component')).toBeNull();
  });
  
  test('redirects when user is not authenticated', () => {
    // Mock useRouter
    const replaceMock = jest.fn();
    require('expo-router').useRouter = () => ({
      replace: replaceMock,
    });
    
    // Mock implementation for unauthenticated user
    (AuthHook as any).useAuth = jest.fn(() => ({
      user: null,
      userRole: 'child',
      loading: false,
    }));
    
    // Wrap the test component with the role guard
    const ProtectedComponent = withRoleGuard(TestComponent, {
      allowedRoles: ['admin', 'grower', 'child'],
      redirectTo: '/login',
    });
    
    // Render the protected component
    render(<ProtectedComponent />);
    
    // Verify the redirect was called to the login page
    expect(replaceMock).toHaveBeenCalledWith('/login');
  });
  
  test('can hide the view-only banner for child users', () => {
    // Mock implementation for child user
    (AuthHook as any).useAuth = jest.fn(() => ({
      user: { id: 'user-1' },
      userRole: 'child',
      loading: false,
    }));
    
    // Wrap the test component with the role guard that allows child role but hides banner
    const ProtectedComponent = withRoleGuard(TestComponent, {
      allowedRoles: ['admin', 'grower', 'child'],
      showReadOnlyBanner: false,
    });
    
    // Render the protected component
    const { queryByText, getByTestId } = render(<ProtectedComponent />);
    
    // Verify the view-only banner is not shown
    expect(queryByText('View only mode - You can view but not modify content')).toBeNull();
    
    // Verify the component is still rendered
    expect(getByTestId('test-component')).toBeTruthy();
  });
}); 