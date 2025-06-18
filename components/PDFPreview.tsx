import React from 'react';
import { WebView } from 'react-native-webview';
import { View, StyleSheet, Dimensions, useColorScheme } from 'react-native';

interface PDFPreviewProps {
    uri: string;
}

// Simple theme object
const createTheme = (colorScheme: 'light' | 'dark' | null) => ({
    colors: {
        background: colorScheme === 'dark' ? '#1E1E1E' : '#FFFFFF',
    }
});

export const PDFPreview: React.FC<PDFPreviewProps> = ({ uri }) => {
    const colorScheme = useColorScheme();
    const theme = createTheme(colorScheme);
    const { width, height } = Dimensions.get('window');

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <WebView
                source={{ uri }}
                style={styles.webview}
                scalesPageToFit
                javaScriptEnabled
                domStorageEnabled
                startInLoadingState
                scrollEnabled
                bounces={false}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
    },
    webview: {
        flex: 1,
        backgroundColor: 'transparent',
    },
}); 