import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { supabase } from '../lib/supabase';
import { useNotifications } from './useNotifications';
import { useReminders } from './useReminders';
import { useAuth } from './useAuth';
import { useToast } from './useToast';
import { HydroponicTaskCategory } from '../types/reminder';

export type SensorType = 'ph' | 'ec' | 'temperature' | 'water_level' | 'dissolved_oxygen' | 'light';
export type AlertSeverity = 'low' | 'medium' | 'high';

export interface SensorReading {
    id: string;
    plant_id?: string;
    system_id: string;
    sensor_type: SensorType;
    value: number;
    unit: string;
    timestamp: string;
    notes?: string;
    user_id: string;
    created_at: string;
}

export interface SensorThreshold {
    sensor_type: SensorType;
    min_value?: number;
    max_value?: number;
    optimal_min?: number;
    optimal_max?: number;
    alert_on_above?: boolean;
    alert_on_below?: boolean;
    alert_severity?: AlertSeverity;
}

export interface SensorData {
    readings: SensorReading[];
    thresholds: SensorThreshold[];
    latestValues: Record<SensorType, number | null>;
    alerts: SensorAlert[];
    isLoading: boolean;
    error: string | null;
    status: 'idle' | 'loading' | 'success' | 'error';
}

export interface SensorAlert {
    id: string;
    sensor_type: SensorType;
    system_id: string;
    threshold_type: 'above' | 'below';
    value: number;
    threshold_value: number;
    severity: AlertSeverity;
    timestamp: string;
    is_acknowledged: boolean;
}

export interface CreateSensorReadingInput {
    plant_id?: string;
    system_id: string;
    sensor_type: SensorType;
    value: number;
    unit: string;
    notes?: string;
}

export interface UpdateThresholdInput {
    sensor_type: SensorType;
    min_value?: number;
    max_value?: number;
    optimal_min?: number;
    optimal_max?: number;
    alert_on_above?: boolean;
    alert_on_below?: boolean;
    alert_severity?: AlertSeverity;
}

interface UseSensorHubProps {
    systemId: string;
    plantId?: string;
    refreshInterval?: number;
}

export const useSensorHub = ({ systemId, plantId, refreshInterval = 60000 }: UseSensorHubProps) => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    const { scheduleSensorAlert } = useNotifications();
    const { createReminder } = useReminders('hydroponic');

    // Fetch sensor readings
    const { 
        data: readings,
        isLoading: isLoadingReadings,
        error: readingsError,
        refetch: refetchReadings
    } = useQuery({
        queryKey: ['sensor_readings', systemId, plantId],
        queryFn: async () => {
            let query = supabase
                .from('system_measurements')
                .select('*')
                .eq('system_id', systemId)
                .order('measured_at', { ascending: false })
                .limit(100);

            if (plantId) {
                query = query.eq('plant_id', plantId);
            }

            const { data, error } = await query;
            if (error) throw error;

            // Map database fields to our sensor reading structure
            return data.map(item => ({
                id: item.id,
                plant_id: item.plant_id || undefined,
                system_id: item.system_id,
                sensor_type: mapDbFieldToSensorType(item),
                value: mapDbFieldToValue(item),
                unit: mapDbFieldToUnit(item),
                timestamp: item.measured_at,
                notes: item.notes,
                user_id: user?.id || 'anonymous',
                created_at: item.created_at,
            })) as SensorReading[];
        },
        enabled: !!systemId && !!user?.id,
        refetchInterval,
    });

    // Fetch sensor thresholds
    const {
        data: thresholds,
        isLoading: isLoadingThresholds,
        error: thresholdsError,
    } = useQuery({
        queryKey: ['sensor_thresholds', systemId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('system_thresholds')
                .select('*')
                .eq('system_id', systemId);

            if (error) throw error;
            
            // Map to our threshold structure
            return data.map(item => ({
                sensor_type: item.sensor_type as SensorType,
                min_value: item.min_value,
                max_value: item.max_value,
                optimal_min: item.optimal_min,
                optimal_max: item.optimal_max,
                alert_on_above: item.alert_on_above,
                alert_on_below: item.alert_on_below,
                alert_severity: item.alert_severity as AlertSeverity,
            })) as SensorThreshold[];
        },
        enabled: !!systemId && !!user?.id,
    });

    // Add sensor reading
    const addReading = useMutation({
        mutationFn: async (input: CreateSensorReadingInput) => {
            // Transform our input to match the database structure
            const dbData = {
                system_id: input.system_id,
                plant_id: input.plant_id,
                measured_at: new Date().toISOString(),
                notes: input.notes,
                ...mapSensorTypeToDbFields(input.sensor_type, input.value),
            };

            const { data, error } = await supabase
                .from('system_measurements')
                .insert([dbData])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: async (data) => {
            await queryClient.invalidateQueries({ queryKey: ['sensor_readings', systemId] });
            await checkForAlerts();
            showToast('success', 'Sensor reading recorded');
        },
        onError: (error) => {
            showToast('error', 'Failed to record sensor reading');
            console.error('Add sensor reading error:', error);
        },
    });

    // Update threshold
    const updateThreshold = useMutation({
        mutationFn: async (input: UpdateThresholdInput) => {
            // Check if threshold exists for this sensor type
            const { data: existing, error: checkError } = await supabase
                .from('system_thresholds')
                .select('*')
                .eq('system_id', systemId)
                .eq('sensor_type', input.sensor_type)
                .maybeSingle();

            if (checkError) throw checkError;

            if (existing) {
                // Update existing threshold
                const { data, error } = await supabase
                    .from('system_thresholds')
                    .update(input)
                    .eq('id', existing.id)
                    .select()
                    .single();

                if (error) throw error;
                return data;
            } else {
                // Create new threshold
                const { data, error } = await supabase
                    .from('system_thresholds')
                    .insert([{
                        system_id: systemId,
                        ...input,
                    }])
                    .select()
                    .single();

                if (error) throw error;
                return data;
            }
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['sensor_thresholds', systemId] });
            await checkForAlerts();
            showToast('success', 'Thresholds updated');
        },
        onError: (error) => {
            showToast('error', 'Failed to update thresholds');
            console.error('Update threshold error:', error);
        },
    });

    // Function to check readings against thresholds and generate alerts
    const checkForAlerts = useCallback(async () => {
        if (!readings || !thresholds) return [];

        const alerts: SensorAlert[] = [];
        const latestReadings = getLatestReadings();

        // Check each sensor type against its threshold
        for (const threshold of thresholds) {
            const latestValue = latestReadings[threshold.sensor_type];
            if (latestValue === null) continue;

            // Check if above max threshold
            if (threshold.alert_on_above && threshold.max_value !== undefined && latestValue > threshold.max_value) {
                const alert: SensorAlert = {
                    id: `${threshold.sensor_type}_above_${Date.now()}`,
                    sensor_type: threshold.sensor_type,
                    system_id: systemId,
                    threshold_type: 'above',
                    value: latestValue,
                    threshold_value: threshold.max_value,
                    severity: threshold.alert_severity || 'medium',
                    timestamp: new Date().toISOString(),
                    is_acknowledged: false,
                };
                alerts.push(alert);
                await createAlertNotification(alert);
            }

            // Check if below min threshold
            if (threshold.alert_on_below && threshold.min_value !== undefined && latestValue < threshold.min_value) {
                const alert: SensorAlert = {
                    id: `${threshold.sensor_type}_below_${Date.now()}`,
                    sensor_type: threshold.sensor_type,
                    system_id: systemId,
                    threshold_type: 'below',
                    value: latestValue,
                    threshold_value: threshold.min_value,
                    severity: threshold.alert_severity || 'medium',
                    timestamp: new Date().toISOString(),
                    is_acknowledged: false,
                };
                alerts.push(alert);
                await createAlertNotification(alert);
            }
        }

        return alerts;
    }, [readings, thresholds, systemId]);

    // Helper to create a notification for an alert
    const createAlertNotification = async (alert: SensorAlert) => {
        try {
            // Get system name
            const { data: system } = await supabase
                .from('hydroponic_systems')
                .select('name')
                .eq('id', systemId)
                .single();

            const systemName = system?.name || 'Your hydroponic system';
            
            // Create alert notification
            let title = '';
            let body = '';
            const unit = getSensorUnit(alert.sensor_type);
            
            if (alert.threshold_type === 'above') {
                switch (alert.sensor_type) {
                    case 'ph':
                        title = 'High pH Level';
                        body = `${systemName} pH is ${alert.value}. Adjust to maintain plant health.`;
                        break;
                    case 'ec':
                        title = 'High EC Level';
                        body = `${systemName} EC is ${alert.value} ${unit}. Dilute nutrient solution.`;
                        break;
                    case 'temperature':
                        title = 'High Water Temperature';
                        body = `${systemName} water is ${alert.value}°C. Cool it down for plant health.`;
                        break;
                    default:
                        title = `High ${alert.sensor_type.replace('_', ' ')} Reading`;
                        body = `${systemName} ${alert.sensor_type.replace('_', ' ')} is ${alert.value} ${unit}.`;
                }
            } else {
                switch (alert.sensor_type) {
                    case 'ph':
                        title = 'Low pH Level';
                        body = `${systemName} pH is ${alert.value}. Adjust to maintain plant health.`;
                        break;
                    case 'ec':
                        title = 'Low EC Level';
                        body = `${systemName} EC is ${alert.value} ${unit}. Add nutrients soon.`;
                        break;
                    case 'water_level':
                        title = 'Low Water Level';
                        body = `${systemName} water level is low. Refill soon.`;
                        break;
                    default:
                        title = `Low ${alert.sensor_type.replace('_', ' ')} Reading`;
                        body = `${systemName} ${alert.sensor_type.replace('_', ' ')} is ${alert.value} ${unit}.`;
                }
            }
            
            // Schedule push notification
            await scheduleSensorAlert({
                title,
                body,
                systemId,
                systemName,
                alertType: `${alert.sensor_type}_${alert.threshold_type}`,
                severity: alert.severity,
                reading: alert.value,
                unit: getSensorUnit(alert.sensor_type),
            });
            
            // Also create a reminder for addressing the issue
            await createReminder.mutateAsync({
                title: `Fix ${title}`,
                type: 'hydroponic',
                related_id: systemId,
                trigger_date: new Date().toISOString(),
                context_type: 'hydroponic',
                priority: mapSeverityToPriority(alert.severity),
                emotion_tone: 'urgent',
                category: mapSensorTypeToCategory(alert.sensor_type),
            });
            
        } catch (error) {
            console.error('Failed to create alert notification:', error);
        }
    };

    // Compute latest readings for each sensor type
    const getLatestReadings = useCallback(() => {
        const latest: Record<SensorType, number | null> = {
            ph: null,
            ec: null,
            temperature: null,
            water_level: null,
            dissolved_oxygen: null,
            light: null,
        };
        
        if (!readings || readings.length === 0) return latest;
        
        // Group readings by sensor type
        const groupedReadings: Record<SensorType, SensorReading[]> = {
            ph: [],
            ec: [],
            temperature: [],
            water_level: [],
            dissolved_oxygen: [],
            light: [],
        };
        
        readings.forEach(reading => {
            groupedReadings[reading.sensor_type].push(reading);
        });
        
        // Get the latest reading for each sensor type
        Object.keys(groupedReadings).forEach(key => {
            const sensorType = key as SensorType;
            const sensorReadings = groupedReadings[sensorType];
            
            if (sensorReadings.length > 0) {
                // Sort by timestamp (latest first)
                sensorReadings.sort((a, b) => 
                    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                );
                latest[sensorType] = sensorReadings[0].value;
            }
        });
        
        return latest;
    }, [readings]);

    // Calculate trends for each sensor type
    const getTrends = useCallback(() => {
        const trends: Record<SensorType, 'rising' | 'falling' | 'stable' | null> = {
            ph: null,
            ec: null,
            temperature: null,
            water_level: null,
            dissolved_oxygen: null,
            light: null,
        };
        
        if (!readings || readings.length < 2) return trends;
        
        // Group readings by sensor type
        const groupedReadings: Record<SensorType, SensorReading[]> = {
            ph: [],
            ec: [],
            temperature: [],
            water_level: [],
            dissolved_oxygen: [],
            light: [],
        };
        
        readings.forEach(reading => {
            groupedReadings[reading.sensor_type].push(reading);
        });
        
        // Calculate trend for each sensor type
        Object.keys(groupedReadings).forEach(key => {
            const sensorType = key as SensorType;
            const sensorReadings = groupedReadings[sensorType];
            
            if (sensorReadings.length >= 2) {
                // Sort by timestamp (oldest first)
                sensorReadings.sort((a, b) => 
                    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                );
                
                // Use last 5 readings or all if less than 5
                const lastReadings = sensorReadings.slice(-5);
                
                // Calculate slope using linear regression
                const n = lastReadings.length;
                const timestamps = lastReadings.map(r => new Date(r.timestamp).getTime());
                const values = lastReadings.map(r => r.value);
                
                const avgTimestamp = timestamps.reduce((sum, t) => sum + t, 0) / n;
                const avgValue = values.reduce((sum, v) => sum + v, 0) / n;
                
                let numerator = 0;
                let denominator = 0;
                
                for (let i = 0; i < n; i++) {
                    numerator += (timestamps[i] - avgTimestamp) * (values[i] - avgValue);
                    denominator += (timestamps[i] - avgTimestamp) ** 2;
                }
                
                const slope = denominator !== 0 ? numerator / denominator : 0;
                
                // Determine trend based on slope
                const threshold = 0.0001; // Small threshold to account for noise
                
                if (slope > threshold) {
                    trends[sensorType] = 'rising';
                } else if (slope < -threshold) {
                    trends[sensorType] = 'falling';
                } else {
                    trends[sensorType] = 'stable';
                }
            }
        });
        
        return trends;
    }, [readings]);

    // Combine all data and state into a unified response
    const data: SensorData = {
        readings: readings || [],
        thresholds: thresholds || [],
        latestValues: getLatestReadings(),
        alerts: [],
        isLoading: isLoadingReadings || isLoadingThresholds,
        error: readingsError ? String(readingsError) : thresholdsError ? String(thresholdsError) : null,
        status: isLoadingReadings || isLoadingThresholds ? 'loading' : 
                readingsError || thresholdsError ? 'error' : 'success',
    };

    // Run alert check when readings or thresholds change
    useEffect(() => {
        if (readings && thresholds) {
            checkForAlerts();
        }
    }, [readings, thresholds, checkForAlerts]);

    // Set up periodic refresh
    useEffect(() => {
        const interval = setInterval(() => {
            refetchReadings();
        }, refreshInterval);

        return () => clearInterval(interval);
    }, [refetchReadings, refreshInterval]);

    // Helper function to map database fields to sensor types
    function mapDbFieldToSensorType(dbRecord: any): SensorType {
        if (dbRecord.ph_level !== undefined && dbRecord.ph_level !== null) return 'ph';
        if (dbRecord.ec_level !== undefined && dbRecord.ec_level !== null) return 'ec';
        if (dbRecord.water_temperature !== undefined && dbRecord.water_temperature !== null) return 'temperature';
        if (dbRecord.water_level !== undefined && dbRecord.water_level !== null) return 'water_level';
        if (dbRecord.dissolved_oxygen !== undefined && dbRecord.dissolved_oxygen !== null) return 'dissolved_oxygen';
        if (dbRecord.light_level !== undefined && dbRecord.light_level !== null) return 'light';
        
        // Default to pH if no match (should never happen)
        return 'ph';
    }

    // Helper function to map database fields to values
    function mapDbFieldToValue(dbRecord: any): number {
        if (dbRecord.ph_level !== undefined && dbRecord.ph_level !== null) return dbRecord.ph_level;
        if (dbRecord.ec_level !== undefined && dbRecord.ec_level !== null) return dbRecord.ec_level;
        if (dbRecord.water_temperature !== undefined && dbRecord.water_temperature !== null) return dbRecord.water_temperature;
        if (dbRecord.water_level !== undefined && dbRecord.water_level !== null) return dbRecord.water_level;
        if (dbRecord.dissolved_oxygen !== undefined && dbRecord.dissolved_oxygen !== null) return dbRecord.dissolved_oxygen;
        if (dbRecord.light_level !== undefined && dbRecord.light_level !== null) return dbRecord.light_level;
        
        // Default to 0 if no match (should never happen)
        return 0;
    }

    // Helper function to map database fields to units
    function mapDbFieldToUnit(dbRecord: any): string {
        if (dbRecord.ph_level !== undefined && dbRecord.ph_level !== null) return 'pH';
        if (dbRecord.ec_level !== undefined && dbRecord.ec_level !== null) return 'mS/cm';
        if (dbRecord.water_temperature !== undefined && dbRecord.water_temperature !== null) return '°C';
        if (dbRecord.water_level !== undefined && dbRecord.water_level !== null) return '%';
        if (dbRecord.dissolved_oxygen !== undefined && dbRecord.dissolved_oxygen !== null) return 'mg/L';
        if (dbRecord.light_level !== undefined && dbRecord.light_level !== null) return 'lux';
        
        // Default to empty string if no match (should never happen)
        return '';
    }

    // Helper function to map sensor type to database fields
    function mapSensorTypeToDbFields(sensorType: SensorType, value: number): Record<string, number> {
        switch (sensorType) {
            case 'ph':
                return { ph_level: value };
            case 'ec':
                return { ec_level: value };
            case 'temperature':
                return { water_temperature: value };
            case 'water_level':
                return { water_level: value };
            case 'dissolved_oxygen':
                return { dissolved_oxygen: value };
            case 'light':
                return { light_level: value };
            default:
                return { ph_level: value };
        }
    }

    // Helper function to get sensor unit
    function getSensorUnit(sensorType: SensorType): string {
        switch (sensorType) {
            case 'ph':
                return 'pH';
            case 'ec':
                return 'mS/cm';
            case 'temperature':
                return '°C';
            case 'water_level':
                return '%';
            case 'dissolved_oxygen':
                return 'mg/L';
            case 'light':
                return 'lux';
            default:
                return '';
        }
    }

    // Helper to map severity to priority
    function mapSeverityToPriority(severity: AlertSeverity): 'low' | 'medium' | 'high' {
        return severity; // They use the same values
    }

    // Helper to map sensor type to reminder category
    function mapSensorTypeToCategory(sensorType: SensorType): HydroponicTaskCategory {
        switch (sensorType) {
            case 'ph':
                return 'ph_balance';
            case 'ec':
                return 'nutrient_refill';
            case 'water_level':
                return 'water_change';
            default:
                return 'daily_check';
        }
    }

    return {
        ...data,
        addReading,
        updateThreshold,
        getLatestReadings,
        getTrends,
        refetch: refetchReadings,
    };
}; 