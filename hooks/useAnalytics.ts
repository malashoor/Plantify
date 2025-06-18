import { useState, useCallback } from 'react';

import { supabase } from '../lib/supabase';

import { useToast } from './useToast';

export interface AnalyticsData {
    weekly_journals: {
        week: string;
        entry_count: number;
    }[];
    common_seeds: {
        name: string;
        scientific_name: string;
        instance_count: number;
    }[];
    reminders: {
        reminder_type: string;
        trigger_count: number;
    }[];
    health_scans: {
        scan_date: string;
        scan_count: number;
    }[];
    accessibility: {
        voice_users: number;
        dark_mode_users: number;
        total_users: number;
    };
}

export const useAnalytics = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<AnalyticsData | null>(null);
    const { showToast } = useToast();

    const fetchAnalytics = useCallback(async (
        startDate: Date,
        endDate: Date
    ) => {
        try {
            setLoading(true);
            setError(null);

            const { data: analyticsData, error: fetchError } = await supabase
                .rpc('get_analytics_data', {
                    start_date: startDate.toISOString(),
                    end_date: endDate.toISOString()
                });

            if (fetchError) throw fetchError;

            setData(analyticsData);
            return analyticsData;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to fetch analytics';
            setError(message);
            showToast('error', message);
            return null;
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    const exportToCSV = useCallback(async () => {
        if (!data) return null;

        try {
            const csvRows = [
                // Headers
                ['Metric', 'Value', 'Date'],
                // Weekly Journals
                ...data.weekly_journals.map(j => ['Journal Entries', j.entry_count, j.week]),
                // Health Scans
                ...data.health_scans.map(s => ['Health Scans', s.scan_count, s.scan_date]),
                // Common Seeds
                ...data.common_seeds.map(s => ['Seed Type', s.instance_count, s.name]),
                // Reminders
                ...data.reminders.map(r => ['Reminder Type', r.trigger_count, r.reminder_type]),
                // Accessibility
                ['Voice Users', data.accessibility.voice_users, ''],
                ['Dark Mode Users', data.accessibility.dark_mode_users, ''],
                ['Total Users', data.accessibility.total_users, '']
            ];

            const csvContent = csvRows
                .map(row => row.join(','))
                .join('\n');

            return csvContent;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to export data';
            showToast('error', message);
            return null;
        }
    }, [data, showToast]);

    return {
        loading,
        error,
        data,
        fetchAnalytics,
        exportToCSV
    };
}; 