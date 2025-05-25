import { useTheme } from '@rneui/themed';
import React, { forwardRef } from 'react';

import { View, StyleSheet, ViewProps } from 'react-native';

interface SnapshotGeneratorProps extends ViewProps {
    children: React.ReactNode;
}

export const SnapshotGenerator = forwardRef<View, SnapshotGeneratorProps>(
    ({ children, style, ...props }, ref) => {
        const { theme } = useTheme();

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