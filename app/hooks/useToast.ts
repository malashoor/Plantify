import { useCallback } from 'react';
import Toast from 'react-native-toast-message';

type ToastType = 'success' | 'error' | 'info' | 'warning';

export const useToast = () => {
    const showToast = useCallback((type: ToastType, message: string) => {
        Toast.show({
            type,
            text1: message,
            position: 'bottom',
            visibilityTime: 4000,
            autoHide: true,
            topOffset: 30,
            bottomOffset: 40,
        });
    }, []);

    return { showToast };
}; 