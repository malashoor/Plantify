import { Card, Text, Icon, useTheme } from '@rneui/themed';
import React, { useMemo, useCallback } from 'react';
import ReactNative from 'react-native';
import { Spacing } from '../../theme/spacing';
import { TextStyles } from '../../theme/text';

const { View, StyleSheet, FlatList } = ReactNative;

import { AnalysisResult } from '../hooks/usePlantAnalyzer';

interface AnalysisResultCardProps {
    result: AnalysisResult;
}

export const AnalysisResultCard = ({ result }: AnalysisResultCardProps): React.ReactElement => {
    const { theme } = useTheme();

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 0.8) return theme.colors.success;
        if (confidence >= 0.6) return theme.colors.warning;
        return theme.colors.error;
    };

    const getConditionIcon = (condition: string) => {
        if (condition.toLowerCase().includes('healthy')) {
            return { name: 'check-circle', color: theme.colors.success };
        }
        if (condition.toLowerCase().includes('deficiency')) {
            return { name: 'alert-circle', color: theme.colors.warning };
        }
        return { name: 'alert', color: theme.colors.error };
    };

    const icon = useMemo(() => getConditionIcon(result.condition), [result.condition, theme.colors]);
    const confidenceColor = useMemo(() => getConfidenceColor(result.confidence), [result.confidence, theme.colors]);

    const renderRecommendation = useCallback(({ item }: { item: string }) => (
        <View 
            style={styles.recommendationItem}
            accessibilityRole="listitem"
        >
            <Icon
                name="arrow-right"
                type="material-community"
                color={theme.colors.primary}
                size={16}
                accessibilityElementsHidden
            />
            <Text 
                style={[TextStyles.Caption, theme.mode === 'dark' && TextStyles.Caption_Dark, styles.recommendationText]}
                accessibilityRole="text"
            >
                {item}
            </Text>
        </View>
    ), [theme]);

    const keyExtractor = useCallback((item: string, index: number) => `${item}-${index}`, []);

    return (
        <Card 
            containerStyle={styles.card}
            accessibilityRole="article"
            accessibilityLabel={`Plant condition: ${result.condition}. Confidence: ${Math.round(result.confidence * 100)}%`}
        >
            <View 
                style={styles.header}
                accessibilityRole="header"
            >
                <Icon
                    name={icon.name}
                    type="material-community"
                    color={icon.color}
                    size={32}
                    accessibilityElementsHidden
                />
                <Text 
                    style={[TextStyles.H1, theme.mode === 'dark' && TextStyles.H1_Dark, styles.title]}
                    accessibilityRole="text"
                >
                    {result.condition}
                </Text>
            </View>

            {result.scientificName && (
                <Text 
                    style={[TextStyles.Body, theme.mode === 'dark' && TextStyles.Body_Dark, styles.scientificName]}
                    accessibilityRole="text"
                >
                    {result.scientificName}
                </Text>
            )}

            {result.commonName && (
                <Text 
                    style={[TextStyles.Caption, theme.mode === 'dark' && TextStyles.Caption_Dark, styles.commonName]}
                    accessibilityRole="text"
                >
                    Common Name: {result.commonName}
                </Text>
            )}

            <View 
                style={styles.confidenceContainer}
                accessibilityRole="text"
                accessibilityLabel={`Confidence: ${Math.round(result.confidence * 100)}%`}
            >
                <Text style={[TextStyles.Body, theme.mode === 'dark' && TextStyles.Body_Dark, styles.confidenceLabel]}>
                    Confidence:
                </Text>
                <Text style={[
                    TextStyles.Body,
                    theme.mode === 'dark' && TextStyles.Body_Dark,
                    styles.confidenceValue,
                    { color: confidenceColor }
                ]}>
                    {Math.round(result.confidence * 100)}%
                </Text>
            </View>

            {result.recommendations.length > 0 && (
                <View 
                    style={styles.recommendationsContainer}
                    accessibilityRole="list"
                    accessibilityLabel="Recommendations"
                >
                    <Text 
                        style={[TextStyles.Body, theme.mode === 'dark' && TextStyles.Body_Dark, styles.recommendationsTitle]}
                        accessibilityRole="text"
                    >
                        Recommendations:
                    </Text>
                    <FlatList
                        data={result.recommendations}
                        renderItem={renderRecommendation}
                        keyExtractor={keyExtractor}
                        scrollEnabled={false}
                        accessibilityRole="list"
                    />
                </View>
            )}
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        marginBottom: Spacing.SM,
        padding: Spacing.SM,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.XS,
    },
    title: {
        marginLeft: Spacing.SM,
        flex: 1,
    },
    scientificName: {
        fontStyle: 'italic',
        marginBottom: Spacing.XS,
    },
    commonName: {
        marginBottom: Spacing.SM,
    },
    confidenceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.SM,
    },
    confidenceLabel: {
        marginRight: Spacing.XS,
    },
    confidenceValue: {
        fontWeight: 'bold',
    },
    recommendationsContainer: {
        marginTop: Spacing.XS,
    },
    recommendationsTitle: {
        fontWeight: 'bold',
        marginBottom: Spacing.XS,
    },
    recommendationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.XS,
    },
    recommendationText: {
        marginLeft: Spacing.XS,
        flex: 1,
    },
}); 