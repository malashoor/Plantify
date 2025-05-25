import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';

import { HydroponicSystem, HydroponicSystemWithDetails, SystemMeasurement } from '@/types/hydroponic';
import { supabase } from '@/utils/supabase';

import { HydroponicError } from '../types/errors';

import { useAuth } from './useAuth';
import { useToast } from './useToast';


interface ValidationRules {
  ph: { min: number; max: number };
  ec: { min: number; max: number };
  temperature: { min: number; max: number };
}

const VALIDATION_RULES: ValidationRules = {
  ph: { min: 5.5, max: 7.5 },
  ec: { min: 0.5, max: 3.0 },
  temperature: { min: 18, max: 30 },
};

export function useHydroponics() {
  const [systems, setSystems] = useState<HydroponicSystem[]>([]);
  const [loading, setLoading] = useState(false);
  const { showError, showSuccess } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const useSystems = () => {
    return useQuery({
      queryKey: ['hydroponics'],
      queryFn: async () => {
        if (!user) {
          throw new HydroponicError({
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to view systems',
          });
        }

        try {
          const { data, error } = await supabase
            .from('hydroponic_systems')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (error) throw new HydroponicError({
            code: 'NETWORK_ERROR',
            message: 'Failed to fetch hydroponic systems',
          });

          return data as HydroponicSystem[];
        } catch (error) {
          showError(error);
          throw error;
        }
      },
    });
  };

  const useSystem = (id: string) => {
    return useQuery({
      queryKey: ['hydroponics', id],
      queryFn: async () => {
        if (!user) {
          throw new HydroponicError({
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to view system details',
          });
        }

        try {
          const { data, error } = await supabase
            .from('hydroponic_systems')
            .select(`
              *,
              measurements:system_measurements(*),
              lighting_schedules:lighting_schedules(*)
            `)
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

          if (error) throw new HydroponicError({
            code: 'NETWORK_ERROR',
            message: 'Failed to fetch hydroponic system details',
          });

          return data as HydroponicSystemWithDetails;
        } catch (error) {
          showError(error);
          throw error;
        }
      },
    });
  };

  const validateMeasurement = useCallback((measurement: Partial<SystemMeasurement>) => {
    if (measurement.ph_level !== undefined) {
      if (measurement.ph_level < VALIDATION_RULES.ph.min || measurement.ph_level > VALIDATION_RULES.ph.max) {
        throw new HydroponicError({
          code: 'VALIDATION_ERROR',
          message: `pH must be between ${VALIDATION_RULES.ph.min} and ${VALIDATION_RULES.ph.max}`,
          field: 'ph_level',
          value: measurement.ph_level,
        });
      }
    }

    if (measurement.ec_level !== undefined) {
      if (measurement.ec_level < VALIDATION_RULES.ec.min || measurement.ec_level > VALIDATION_RULES.ec.max) {
        throw new HydroponicError({
          code: 'VALIDATION_ERROR',
          message: `EC must be between ${VALIDATION_RULES.ec.min} and ${VALIDATION_RULES.ec.max} mS/cm`,
          field: 'ec_level',
          value: measurement.ec_level,
        });
      }
    }

    if (measurement.water_temperature !== undefined) {
      if (
        measurement.water_temperature < VALIDATION_RULES.temperature.min ||
        measurement.water_temperature > VALIDATION_RULES.temperature.max
      ) {
        throw new HydroponicError({
          code: 'VALIDATION_ERROR',
          message: `Temperature must be between ${VALIDATION_RULES.temperature.min} and ${VALIDATION_RULES.temperature.max}°C`,
          field: 'water_temperature',
          value: measurement.water_temperature,
        });
      }
    }
  }, []);

  const addSystem = useMutation({
    mutationFn: async (system: Omit<HydroponicSystem, 'id' | 'created_at' | 'updated_at'>) => {
      if (!user) {
        throw new HydroponicError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to create a system',
        });
      }

      try {
        const { data, error } = await supabase
          .from('hydroponic_systems')
          .insert(system)
          .select()
          .single();

        if (error) throw new HydroponicError({
          code: 'NETWORK_ERROR',
          message: 'Failed to create hydroponic system',
        });

        return data as HydroponicSystem;
      } catch (error) {
        showError(error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hydroponics'] });
    },
  });

  const addMeasurement = useMutation({
    mutationFn: async ({
      systemId,
      measurement,
    }: {
      systemId: string;
      measurement: Omit<SystemMeasurement, 'id' | 'measured_at'>;
    }) => {
      if (!user) {
        throw new HydroponicError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to add measurements',
        });
      }

      try {
        validateMeasurement(measurement);

        const { data, error } = await supabase
          .from('system_measurements')
          .insert({
            ...measurement,
            system_id: systemId,
            measured_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw new HydroponicError({
          code: 'NETWORK_ERROR',
          message: 'Failed to add measurement',
        });

        return data as SystemMeasurement;
      } catch (error) {
        showError(error);
        throw error;
      }
    },
    onSuccess: (_, { systemId }) => {
      queryClient.invalidateQueries({ queryKey: ['hydroponics', systemId] });
    },
  });

  const deleteSystem = useMutation({
    mutationFn: async (systemId: string) => {
      if (!user) {
        throw new HydroponicError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to delete a system',
        });
      }

      try {
        const { error } = await supabase
          .from('hydroponic_systems')
          .delete()
          .eq('id', systemId)
          .eq('user_id', user.id);

        if (error) throw new HydroponicError({
          code: 'NETWORK_ERROR',
          message: 'Failed to delete hydroponic system',
        });
      } catch (error) {
        showError(error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hydroponics'] });
    },
  });

  const deleteMeasurement = useMutation({
    mutationFn: async ({ systemId, measurementId }: { systemId: string; measurementId: string }) => {
      if (!user) {
        throw new HydroponicError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to delete measurements',
        });
      }

      try {
        const { error } = await supabase
          .from('system_measurements')
          .delete()
          .eq('id', measurementId)
          .eq('system_id', systemId);

        if (error) throw new HydroponicError({
          code: 'NETWORK_ERROR',
          message: 'Failed to delete measurement',
        });
      } catch (error) {
        showError(error);
        throw error;
      }
    },
    onSuccess: (_, { systemId }) => {
      queryClient.invalidateQueries({ queryKey: ['hydroponics', systemId] });
    },
  });

  return {
    useSystems,
    useSystem,
    addSystem,
    addMeasurement,
    deleteSystem,
    deleteMeasurement,
    validateMeasurement,
  };
}
