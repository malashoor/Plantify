import { Text, Button, Card, useTheme, Icon } from '@rneui/themed';
import { formatDistanceToNow } from 'date-fns';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { VictoryLine, VictoryChart, VictoryAxis, VictoryTheme } from 'victory';

import { View, StyleSheet, ScrollView, Image } from 'react-native';

import { useGrowthGuide } from '../hooks/useGrowthGuide';
import { useSeeds } from '../hooks/useSeeds';
import { Seed, GrowthStage } from '../types/seed';

interface CareRequirement {
    water: string;
    light: string;
    temperature: string;
    humidity: string;
}

interface StageInfo {
    duration: number;
    instructions: string[];
    careRequirements: CareRequirement;
}

interface SeedGuide {
    species: string;
    variety?: string;
    stages: Record<GrowthStage, StageInfo>;
    careInstructions: {
        general: string[];
        commonIssues: { issue: string; solution: string }[];
    };
}

interface GrowthDataPoint {
    date: Date;
    height: number;
}

export default function SeedDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { theme } = useTheme();
    const { loading, error, updateSeedStage } = useSeeds();
    const { fetchGuideBySpecies, getStageInstructions, getNextStage, getStageDuration } = useGrowthGuide();
    
    const [seed, setSeed] = useState<Seed | null>(null);
    const [guide, setGuide] = useState<SeedGuide | null>(null);
    const [growthData, setGrowthData] = useState<GrowthDataPoint[]>([]);

    useEffect(() => {
        loadSeedData();
    }, [id]);

    const loadSeedData = async () => {
        // In a real app, you would fetch the seed data from your API
        // For now, we'll use mock data
        const mockSeed: Seed = {
            id: id as string,
            userId: 'user123',
            name: 'Tomato Plant',
            species: 'Solanum lycopersicum',
            variety: 'Beefsteak',
            plantedDate: new Date('2024-03-01'),
            currentStage: 'vegetative',
            lastUpdated: new Date(),
            imageUrl: 'https://example.com/tomato.jpg',
            notes: 'Growing well in the greenhouse',
            createdAt: new Date('2024-03-01'),
            updatedAt: new Date(),
        };

        setSeed(mockSeed);
        const seedGuide = await fetchGuideBySpecies(mockSeed.species, mockSeed.variety);
        setGuide(seedGuide as SeedGuide);

        // Mock growth data
        setGrowthData([
            { date: new Date('2024-03-01'), height: 0 },
            { date: new Date('2024-03-08'), height: 5 },
            { date: new Date('2024-03-15'), height: 12 },
            { date: new Date('2024-03-22'), height: 25 },
        ]);
    };

    const handleStageUpdate = async (newStage: GrowthStage) => {
        if (!seed) return;

        const success = await updateSeedStage(seed.id, newStage);
        if (success) {
            setSeed(prev => prev ? { ...prev, currentStage: newStage } : null);
        }
    };

    if (!seed || !guide) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Loading...</Text>
            </View>
        );
    }

    const currentStageInfo = guide.stages[seed.currentStage];
    const nextStage = getNextStage(seed.currentStage);

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Image
                    source={seed.imageUrl ? { uri: seed.imageUrl } : require('../assets/images/placeholder-seed.png')}
                    style={styles.image}
                />
                <Text h4 style={styles.title}>{seed.name}</Text>
                <Text style={styles.species}>{seed.species}</Text>
                {seed.variety && (
                    <Text style={styles.variety}>{seed.variety}</Text>
                )}
            </View>

            <Card containerStyle={styles.card}>
                <Card.Title>Current Stage: {seed.currentStage}</Card.Title>
                <View style={styles.stageInfo}>
                    <Text style={styles.stageDuration}>
                        Expected Duration: {getStageDuration(guide, seed.currentStage)} days
                    </Text>
                    <Text style={styles.stageInstructions}>
                        {currentStageInfo.instructions.join('\n')}
                    </Text>
                </View>
            </Card>

            <Card containerStyle={styles.card}>
                <Card.Title>Care Requirements</Card.Title>
                <View style={styles.careInfo}>
                    <View style={styles.careItem}>
                        <Icon name="water" type="material-community" color={theme.colors.primary} />
                        <Text style={styles.careText}>{currentStageInfo.careRequirements.water}</Text>
                    </View>
                    <View style={styles.careItem}>
                        <Icon name="white-balance-sunny" type="material-community" color={theme.colors.primary} />
                        <Text style={styles.careText}>{currentStageInfo.careRequirements.light}</Text>
                    </View>
                    <View style={styles.careItem}>
                        <Icon name="thermometer" type="material-community" color={theme.colors.primary} />
                        <Text style={styles.careText}>{currentStageInfo.careRequirements.temperature}</Text>
                    </View>
                    <View style={styles.careItem}>
                        <Icon name="water-percent" type="material-community" color={theme.colors.primary} />
                        <Text style={styles.careText}>{currentStageInfo.careRequirements.humidity}</Text>
                    </View>
                </View>
            </Card>

            <Card containerStyle={styles.card}>
                <Card.Title>Growth Progress</Card.Title>
                <VictoryChart theme={VictoryTheme.material}>
                    <VictoryAxis
                        tickFormat={(date: Date) => formatDistanceToNow(new Date(date), { addSuffix: true })}
                    />
                    <VictoryAxis
                        dependentAxis
                        label="Height (cm)"
                    />
                    <VictoryLine
                        data={growthData}
                        x="date"
                        y="height"
                        style={{
                            data: { stroke: theme.colors.primary }
                        }}
                    />
                </VictoryChart>
            </Card>

            {nextStage && (
                <Button
                    title={`Advance to ${nextStage} stage`}
                    onPress={() => handleStageUpdate(nextStage)}
                    loading={loading}
                    containerStyle={styles.button}
                />
            )}

            {error && (
                <Text style={[styles.error, { color: theme.colors.error }]}>
                    {error}
                </Text>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        padding: 16,
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginBottom: 16,
    },
    title: {
        marginBottom: 8,
    },
    species: {
        fontSize: 16,
        color: '#666',
        marginBottom: 4,
    },
    variety: {
        fontSize: 14,
        color: '#666',
    },
    card: {
        borderRadius: 12,
        marginBottom: 16,
    },
    stageInfo: {
        padding: 8,
    },
    stageDuration: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    stageInstructions: {
        fontSize: 14,
        lineHeight: 20,
    },
    careInfo: {
        padding: 8,
    },
    careItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    careText: {
        marginLeft: 12,
        fontSize: 14,
        flex: 1,
    },
    button: {
        margin: 16,
    },
    error: {
        textAlign: 'center',
        margin: 16,
    },
}); 