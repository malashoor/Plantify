import { Alert } from 'react-native';

export function useToast() {
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    Alert.alert(
      type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Info',
      message
    );
  };

  return {
    showToast,
    success: (message: string) => showToast(message, 'success'),
    error: (message: string) => showToast(message, 'error'),
    info: (message: string) => showToast(message, 'info'),
  };
} 