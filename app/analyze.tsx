import * as Speech from 'expo-speech';
import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '../src/theme/spacing';
import { TextStyles } from '../src/theme/text';
import { AnalysisResultCard } from '../src/components/AnalysisResultCard';
import { PhotoPicker } from '../src/components/PhotoPicker';
import { usePlantAnalyzer } from '../src/hooks/usePlantAnalyzer';
import { LoadingState } from '../src/components/ui/loading-state';
import { ErrorState } from '../src/components/ui/error-state';
import { useTranslation } from 'react-i18next';

// Action buttons component
const ActionButtons = ({ 
    onSpeak, 
    onReset, 
    t 
}: { 
    onSpeak: () => void;
    onReset: () => void;
    t: (key: string) => string;
}) => (
    <View style={styles.buttonContainer}>
        <TouchableOpacity
            style={styles.primaryButton}
            onPress={onSpeak}
        >
            <Ionicons name="volume-high" size={20} color="white" style={styles.buttonIcon} />
            <Text style={styles.primaryButtonText}>{t('analyze.listenResults')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
            style={styles.outlineButton}
            onPress={onReset}
        >
            <Text style={styles.outlineButtonText}>{t('analyze.analyzeAnother')}</Text>
        </TouchableOpacity>
    </View>
);

export default function AnalyzeScreen() {
    const colorScheme = useColorScheme();
    const theme = { mode: colorScheme === 'dark' ? 'dark' : 'light' };
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

        const text = `Plant condition: ${result.condition}. Confidence: ${Math.round(result.confidence * 100)}%.`;

        Speech.speak(text, {
            language: 'en',
            pitch: 1,
            rate: 0.9,
        });
    }, [result]);

    if (loading) {
        return (
            <LoadingState message={t('analyze.loading')} />
        );
    }

    if (error) {
        return (
            <ErrorState
                message={error}
                onRetry={handleReset}
            />
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            <View style={styles.content}>
                <Text style={[TextStyles.H1, theme.mode === 'dark' && TextStyles.H1_Dark]}>
                    {t('analyze.title')}
                </Text>
                <Text style={[TextStyles.Body, theme.mode === 'dark' && TextStyles.Body_Dark, styles.subtitle]}>
                    {t('analyze.subtitle')}
                </Text>

                <PhotoPicker
                    onImageSelected={handleImageSelected}
                    initialImage={selectedImage}
                    disabled={loading}
                />

                {!selectedImage && !result && (
                    <View style={styles.emptyState}>
                        <Text style={[TextStyles.Body, theme.mode === 'dark' && TextStyles.Body_Dark, styles.emptyStateText]}>
                            {t('analyze.emptyState')}
                        </Text>
                    </View>
                )}

                {result && (
                    <View style={styles.resultContainer}>
                        <AnalysisResultCard result={result} />
                        <ActionButtons 
                            onSpeak={speakResult}
                            onReset={handleReset}
                            t={t}
                        />
                    </View>
                )}
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
    primaryButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: Spacing.XS,
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    buttonIcon: {
        marginRight: 8,
    },
    outlineButton: {
        backgroundColor: 'transparent',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#4CAF50',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: Spacing.XS,
    },
    outlineButtonText: {
        color: '#4CAF50',
        fontSize: 16,
        fontWeight: '600',
    },
}); 