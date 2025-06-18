import { formatDistanceToNow } from 'date-fns';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { VictoryLine, VictoryChart, VictoryAxis, VictoryTheme } from 'victory';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator,
  useColorScheme,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useGrowthGuide } from '../hooks/useGrowthGuide';
import { useSeeds } from '../hooks/useSeeds';
import { Seed, GrowthStage } from '../types/seed';
import placeholderSeedImage from '../assets/images/placeholder-seed.png';

// Simple theme helper
const createTheme = (colorScheme: 'light' | 'dark' | null) => ({
  colors: {
    primary: '#4CAF50',
    background: colorScheme === 'dark' ? '#1E1E1E' : '#F5F5F5',
    surface: colorScheme === 'dark' ? '#2A2A2A' : '#FFFFFF',
    text: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
    textSecondary: colorScheme === 'dark' ? '#BBBBBB' : '#666666',
    border: colorScheme === 'dark' ? '#444444' : '#E0E0E0',
    error: '#F44336',
  }
});

// Custom Card Component
const Card = ({ children, title, style, theme }: { 
  children: React.ReactNode; 
  title?: string;
  style?: any; 
  theme: any;
}) => (
  <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }, style]}>
    {title && (
      <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{title}</Text>
    )}
    {children}
  </View>
);

// Custom Button Component
const Button = ({ 
  title, 
  onPress, 
  loading = false,
  disabled = false,
  style,
  theme 
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: any;
  theme: any;
}) => {
  const isDisabled = disabled || loading;
  
  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: isDisabled ? theme.colors.textSecondary : theme.colors.primary,
        },
        style
      ]}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator size="small" color="white" />
      ) : (
        <Text style={styles.buttonText}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

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
    const colorScheme = useColorScheme();
    const theme = createTheme(colorScheme);
    const { loading, error, updateSeedStage } = useSeeds();
    const { fetchGuideBySpecies, getStageInstructions, getNextStage, getStageDuration } = useGrowthGuide();
    
    const [seed, setSeed] = useState<Seed | null>(null);
    const [guide, setGuide] = useState<SeedGuide | null>(null);
    const [growthData, setGrowthData] = useState<GrowthDataPoint[]>([]);

    useEffect(() => {
        loadSeedData();
    }, [id]);

    const loadSeedData = async () => {
        try {
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
        } catch (err) {
            console.error('Error loading seed data:', err);
            Alert.alert('Error', 'Failed to load seed data');
        }
    };

    const handleStageUpdate = async (newStage: GrowthStage) => {
        if (!seed) return;

        try {
            const success = await updateSeedStage(seed.id, newStage);
            if (success) {
                setSeed(prev => prev ? { ...prev, currentStage: newStage } : null);
                Alert.alert('Success', `Advanced to ${newStage} stage`);
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to update growth stage');
        }
    };

    if (!seed || !guide) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading seed details...</Text>
            </View>
        );
    }

    const currentStageInfo = guide.stages[seed.currentStage];
    const nextStage = getNextStage(seed.currentStage);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Image
                        source={seed.imageUrl ? { uri: seed.imageUrl } : placeholderSeedImage}
                        style={styles.image}
                    />
                    <Text style={[styles.title, { color: theme.colors.text }]}>{seed.name}</Text>
                    <Text style={[styles.species, { color: theme.colors.textSecondary }]}>{seed.species}</Text>
                    {seed.variety && (
                        <Text style={[styles.variety, { color: theme.colors.textSecondary }]}>{seed.variety}</Text>
                    )}
                </View>

                <Card title={`Current Stage: ${seed.currentStage}`} theme={theme}>
                    <View style={styles.stageInfo}>
                        <View style={styles.stageRow}>
                            <Ionicons name="time-outline" size={20} color={theme.colors.primary} />
                            <Text style={[styles.stageDuration, { color: theme.colors.text }]}>
                                Expected Duration: {getStageDuration(guide, seed.currentStage)} days
                            </Text>
                        </View>
                        <View style={styles.instructionsContainer}>
                            <Text style={[styles.instructionsTitle, { color: theme.colors.text }]}>Instructions:</Text>
                            {currentStageInfo.instructions.map((instruction, index) => (
                                <View key={index} style={styles.instructionRow}>
                                    <Text style={[styles.bulletPoint, { color: theme.colors.primary }]}>•</Text>
                                    <Text style={[styles.stageInstructions, { color: theme.colors.textSecondary }]}>
                                        {instruction}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </Card>

                <Card title="Care Requirements" theme={theme}>
                    <View style={styles.careInfo}>
                        <View style={styles.careItem}>
                            <Ionicons name="water-outline" size={24} color={theme.colors.primary} />
                            <View style={styles.careTextContainer}>
                                <Text style={[styles.careLabel, { color: theme.colors.text }]}>Water</Text>
                                <Text style={[styles.careText, { color: theme.colors.textSecondary }]}>
                                    {currentStageInfo.careRequirements.water}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.careItem}>
                            <Ionicons name="sunny-outline" size={24} color={theme.colors.primary} />
                            <View style={styles.careTextContainer}>
                                <Text style={[styles.careLabel, { color: theme.colors.text }]}>Light</Text>
                                <Text style={[styles.careText, { color: theme.colors.textSecondary }]}>
                                    {currentStageInfo.careRequirements.light}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.careItem}>
                            <Ionicons name="thermometer-outline" size={24} color={theme.colors.primary} />
                            <View style={styles.careTextContainer}>
                                <Text style={[styles.careLabel, { color: theme.colors.text }]}>Temperature</Text>
                                <Text style={[styles.careText, { color: theme.colors.textSecondary }]}>
                                    {currentStageInfo.careRequirements.temperature}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.careItem}>
                            <Ionicons name="water" size={24} color={theme.colors.primary} />
                            <View style={styles.careTextContainer}>
                                <Text style={[styles.careLabel, { color: theme.colors.text }]}>Humidity</Text>
                                <Text style={[styles.careText, { color: theme.colors.textSecondary }]}>
                                    {currentStageInfo.careRequirements.humidity}
                                </Text>
                            </View>
                        </View>
                    </View>
                </Card>

                <Card title="Growth Progress" theme={theme}>
                    <View style={styles.chartContainer}>
                        <VictoryChart 
                            theme={VictoryTheme.material} 
                            width={350} 
                            height={200}
                            padding={{ left: 60, top: 20, right: 40, bottom: 60 }}
                        >
                            <VictoryAxis
                                tickFormat={(date: Date) => formatDistanceToNow(new Date(date), { addSuffix: true })}
                                style={{
                                    tickLabels: { fontSize: 10, padding: 5, angle: -45 }
                                }}
                            />
                            <VictoryAxis
                                dependentAxis
                                label="Height (cm)"
                                style={{
                                    axisLabel: { fontSize: 12, padding: 35, fill: theme.colors.text },
                                    tickLabels: { fontSize: 10, padding: 5, fill: theme.colors.text }
                                }}
                            />
                            <VictoryLine
                                data={growthData}
                                x="date"
                                y="height"
                                style={{
                                    data: { stroke: theme.colors.primary, strokeWidth: 3 }
                                }}
                                animate={{
                                    duration: 1000,
                                    onLoad: { duration: 500 }
                                }}
                            />
                        </VictoryChart>
                    </View>
                </Card>

                {nextStage && (
                    <View style={styles.actionSection}>
                        <Button
                            title={`Advance to ${nextStage} stage`}
                            onPress={() => handleStageUpdate(nextStage)}
                            loading={loading}
                            style={styles.actionButton}
                            theme={theme}
                        />
                    </View>
                )}

                {error && (
                    <View style={[styles.errorContainer, { backgroundColor: theme.colors.error + '20' }]}>
                        <Ionicons name="alert-circle" size={20} color={theme.colors.error} />
                        <Text style={[styles.error, { color: theme.colors.error }]}>
                            {error}
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
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
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    species: {
        fontSize: 16,
        marginBottom: 4,
        textAlign: 'center',
    },
    variety: {
        fontSize: 14,
        textAlign: 'center',
    },
    card: {
        borderRadius: 12,
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 16,
        borderWidth: 1,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    stageInfo: {
        paddingVertical: 8,
    },
    stageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    stageDuration: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    instructionsContainer: {
        marginTop: 8,
    },
    instructionsTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    instructionRow: {
        flexDirection: 'row',
        marginBottom: 6,
        paddingLeft: 8,
    },
    bulletPoint: {
        fontSize: 16,
        marginRight: 8,
        fontWeight: 'bold',
    },
    stageInstructions: {
        fontSize: 14,
        lineHeight: 20,
        flex: 1,
    },
    careInfo: {
        paddingVertical: 8,
    },
    careItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    careTextContainer: {
        marginLeft: 12,
        flex: 1,
    },
    careLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    careText: {
        fontSize: 14,
        lineHeight: 18,
    },
    chartContainer: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    actionSection: {
        padding: 16,
    },
    actionButton: {
        marginVertical: 8,
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 48,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 16,
        padding: 12,
        borderRadius: 8,
    },
    error: {
        marginLeft: 8,
        flex: 1,
        fontSize: 14,
    },
}); 