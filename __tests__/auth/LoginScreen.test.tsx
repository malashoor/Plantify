import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { LoginScreen } from '../../app/(auth)/login';
import { supabase } from '../../lib/supabase';

// Mock the navigation
jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form correctly', () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Sign In')).toBeTruthy();
  });

  it('shows error message for invalid email', async () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    
    const emailInput = getByPlaceholderText('Email');
    fireEvent.changeText(emailInput, 'invalid-email');
    
    const signInButton = getByText('Sign In');
    fireEvent.press(signInButton);
    
    await waitFor(() => {
      expect(getByText('Please enter a valid email')).toBeTruthy();
    });
  });

  it('handles successful login', async () => {
    const mockSignIn = jest.fn().mockResolvedValue({
      data: { user: { id: '123' } },
      error: null,
    });
    
    (supabase.auth.signIn as jest.Mock).mockImplementation(mockSignIn);
    
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    
    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    
    const signInButton = getByText('Sign In');
    fireEvent.press(signInButton);
    
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('handles login error', async () => {
    const mockSignIn = jest.fn().mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid credentials' },
    });
    
    (supabase.auth.signIn as jest.Mock).mockImplementation(mockSignIn);
    
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    
    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'wrongpassword');
    
    const signInButton = getByText('Sign In');
    fireEvent.press(signInButton);
    
    await waitFor(() => {
      expect(getByText('Invalid credentials')).toBeTruthy();
    });
  });
}); 