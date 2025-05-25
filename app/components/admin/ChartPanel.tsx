import { Text, useTheme } from '@rneui/themed';
import React from 'react';
import { VictoryChart, VictoryLine, VictoryBar, VictoryPie, VictoryAxis, VictoryTheme } from 'victory-native';

import { View, StyleSheet, Dimensions } from 'react-native';

export interface ChartDataPoint {
    [key: string]: string | number | Date;
}

interface ChartPanelProps {
    title: string;
    type: 'line' | 'bar' | 'pie';
    data: ChartDataPoint[];
    xKey?: string;
    yKey?: string;
    colorScale?: string[];
    accessibilityLabel?: string;
}

export const ChartPanel: React.FC<ChartPanelProps> = ({
    title,
    type,
    data,
    xKey = 'x',
    yKey = 'y',
    colorScale,
    accessibilityLabel
}) => {
    const { theme } = useTheme();
    const screenWidth = Dimensions.get('window').width;

    const renderChart = () => {
        const commonProps = {
            data,
            theme: VictoryTheme.material,
            colorScale: colorScale || [theme.colors.primary],
            style: {
                data: {
                    fill: theme.colors.primary,
                },
            },
        };

        switch (type) {
            case 'line':
                return (
                    <VictoryChart width={screenWidth - 32} height={300}>
                        <VictoryAxis
                            style={{
                                axis: { stroke: theme.colors.grey3 },
                                tickLabels: { fill: theme.colors.grey3 },
                            }}
                        />
                        <VictoryAxis
                            dependentAxis
                            style={{
                                axis: { stroke: theme.colors.grey3 },
                                tickLabels: { fill: theme.colors.grey3 },
                            }}
                        />
                        <VictoryLine
                            {...commonProps}
                            x={xKey}
                            y={yKey}
                        />
                    </VictoryChart>
                );
            case 'bar':
                return (
                    <VictoryChart width={screenWidth - 32} height={300}>
                        <VictoryAxis
                            style={{
                                axis: { stroke: theme.colors.grey3 },
                                tickLabels: { fill: theme.colors.grey3 },
                            }}
                        />
                        <VictoryAxis
                            dependentAxis
                            style={{
                                axis: { stroke: theme.colors.grey3 },
                                tickLabels: { fill: theme.colors.grey3 },
                            }}
                        />
                        <VictoryBar
                            {...commonProps}
                            x={xKey}
                            y={yKey}
                        />
                    </VictoryChart>
                );
            case 'pie':
                return (
                    <VictoryPie
                        {...commonProps}
                        width={screenWidth - 32}
                        height={300}
                        x={xKey}
                        y={yKey}
                        innerRadius={70}
                        labelRadius={({ innerRadius }) => (innerRadius as number) + 40}
                        style={{ labels: { fill: theme.colors.grey3 } }}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <View
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            accessible={true}
            accessibilityRole="text"
            accessibilityLabel={accessibilityLabel || `${title} chart`}
        >
            <Text
                style={[styles.title, { color: theme.colors.grey3 }]}
                accessibilityRole="header"
            >
                {title}
            </Text>
            {renderChart()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 16,
    },
}); 