import { Text, Button, useTheme } from '@rneui/themed';
import * as Speech from 'expo-speech';
import React, { useState, useCallback, useMemo, memo } from 'react';
import ReactNative from 'react-native';
import { Spacing } from '../theme/spacing';
import { TextStyles } from '../theme/text';
import { AnalysisResultCard } from './components/AnalysisResultCard';
import { PhotoPicker } from './components/PhotoPicker';
import { usePlantAnalyzer } from './hooks/usePlantAnalyzer';
import { LoadingState } from '../components/ui/loading-state';
import { ErrorState } from '../components/ui/error-state';
import { useTranslation } from 'react-i18next';

const { View, StyleSheet, ScrollView } = ReactNative;

// Memoized result card component
const MemoizedResultCard = memo(({ result }: { result: any }) => (
    <AnalysisResultCard result={result} />
));

// Memoized action buttons component
const ActionButtons = memo(({ 
    onSpeak, 
    onReset, 
    t 
}: { 
    onSpeak: () => void;
    onReset: () => void;
    t: (key: string) => string;
}) => (
    <View style={styles.buttonContainer}>
        <Button
            title={t('analyze.listenResults')}
            onPress={onSpeak}
            icon={{
                name: 'volume-high',
                type: 'material-community',
                color: 'white',
                size: 20,
            }}
            containerStyle={styles.button}
            accessibilityLabel={t('analyze.listenResults')}
            accessibilityHint={t('analyze.listenResultsHint')}
        />
        <Button
            title={t('analyze.analyzeAnother')}
            onPress={onReset}
            type="outline"
            containerStyle={styles.button}
            accessibilityLabel={t('analyze.analyzeAnother')}
            accessibilityHint={t('analyze.analyzeAnotherHint')}
        />
    </View>
));

export default function AnalyzeScreen() {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const { loading, error, result, analyzeImage, resetAnalysis } = usePlantAnalyzer();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const handleImageSelected = useCallback((uri: string) => {
        setSelectedImage(uri);
        analyzeImage(uri);
    }, [analyzeImage]);

    const handleReset = useCallback(() => {
        setSelectedImage(null);
        resetAnalysis();
    }, [resetAnalysis]);

    const speakResult = useCallback(() => {
        if (!result) return;

        const text = `
            Plant condition: ${result.condition}.
            Confidence: ${Math.round(result.confidence * 100)}%.
            ${result.recommendations.length > 0 ? 'Recommendations: ' + result.recommendations.join('. ') : ''}
        `;

        Speech.speak(text, {
            language: 'en',
            pitch: 1,
            rate: 0.9,
        });
    }, [result]);

    // Memoize the result section to prevent unnecessary re-renders
    const resultSection = useMemo(() => {
        if (!result) return null;

        return (
            <View 
                style={styles.resultContainer}
                accessibilityRole="group"
                accessibilityLabel={t('analyze.resultSection')}
            >
                <MemoizedResultCard result={result} />
                <ActionButtons 
                    onSpeak={speakResult}
                    onReset={handleReset}
                    t={t}
                />
            </View>
        );
    }, [result, speakResult, handleReset, t]);

    if (loading) {
        return (
            <LoadingState 
                message={t('analyze.loading')}
                testID="analyze-loading"
            />
        );
    }

    if (error) {
        return (
            <ErrorState
                message={error}
                onRetry={handleReset}
                testID="analyze-error"
            />
        );
    }

    return (
        <ScrollView 
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            accessibilityRole="main"
            accessibilityLabel={t('analyze.screenLabel')}
        >
            <View style={styles.content}>
                <Text 
                    style={[TextStyles.H1, theme.mode === 'dark' && TextStyles.H1_Dark]}
                    accessibilityRole="header"
                >
                    {t('analyze.title')}
                </Text>
                <Text 
                    style={[TextStyles.Body, theme.mode === 'dark' && TextStyles.Body_Dark, styles.subtitle]}
                    accessibilityRole="text"
                >
                    {t('analyze.subtitle')}
                </Text>

                <PhotoPicker
                    onImageSelected={handleImageSelected}
                    initialImage={selectedImage}
                    disabled={loading}
                />

                {!selectedImage && !result && (
                    <View 
                        style={styles.emptyState}
                        accessibilityRole="status"
                        accessibilityLabel={t('analyze.emptyState')}
                    >
                        <Text 
                            style={[TextStyles.Body, theme.mode === 'dark' && TextStyles.Body_Dark, styles.emptyStateText]}
                            accessibilityRole="text"
                        >
                            {t('analyze.emptyState')}
                        </Text>
                    </View>
                )}

                {resultSection}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        padding: Spacing.Screen.Padding,
    },
    subtitle: {
        textAlign: 'center',
        marginBottom: Spacing.MD,
    },
    emptyState: {
        alignItems: 'center',
        marginVertical: Spacing.XL,
    },
    emptyStateText: {
        textAlign: 'center',
        opacity: 0.7,
    },
    resultContainer: {
        marginTop: Spacing.MD,
        gap: Spacing.SM,
    },
    buttonContainer: {
        gap: Spacing.SM,
    },
    button: {
        marginVertical: Spacing.XS,
    },
}); 