import React, { forwardRef } from 'react';
import { View, StyleSheet, ViewProps, useColorScheme } from 'react-native';

interface SnapshotGeneratorProps extends ViewProps {
    children: React.ReactNode;
}

// Simple theme object
const createTheme = (colorScheme: 'light' | 'dark' | null) => ({
    colors: {
        background: colorScheme === 'dark' ? '#1E1E1E' : '#FFFFFF',
    }
});

export const SnapshotGenerator = forwardRef<View, SnapshotGeneratorProps>(
    ({ children, style, ...props }, ref) => {
        const colorScheme = useColorScheme();
        const theme = createTheme(colorScheme);

        return (
            <View
                ref={ref}
                style={[
                    styles.container,
                    { backgroundColor: theme.colors.background },
                    style,
                ]}
                {...props}
            >
                {children}
            </View>
        );
    }
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
    },
}); 