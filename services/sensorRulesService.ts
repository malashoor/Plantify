import { supabase } from 'lib/supabase';
import { SensorRule, CreateSensorRuleInput, UpdateSensorRuleInput } from 'types/sensorRules';

/**
 * Fetch all sensor rules for the authenticated user, optionally filtered by plant_id
 */
export async function getSensorRules(plantId?: string): Promise<SensorRule[]> {
  let query = supabase
    .from('sensor_rules')
    .select('*')
    .order('created_at', { ascending: false });

  if (plantId) {
    query = query.eq('plant_id', plantId);
  }

  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching sensor rules:', error);
    throw new Error(`Failed to fetch sensor rules: ${error.message}`);
  }
  
  return data as SensorRule[];
}

/**
 * Get a single sensor rule by ID
 */
export async function getSensorRule(id: string): Promise<SensorRule> {
  const { data, error } = await supabase
    .from('sensor_rules')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching sensor rule:', error);
    throw new Error(`Failed to fetch sensor rule: ${error.message}`);
  }
  
  return data as SensorRule;
}

/**
 * Create a new sensor rule
 */
export async function createSensorRule(input: CreateSensorRuleInput): Promise<SensorRule> {
  const { data, error } = await supabase
    .from('sensor_rules')
    .insert([input])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating sensor rule:', error);
    throw new Error(`Failed to create sensor rule: ${error.message}`);
  }
  
  return data as SensorRule;
}

/**
 * Update an existing sensor rule
 */
export async function updateSensorRule(id: string, input: UpdateSensorRuleInput): Promise<SensorRule> {
  const { data, error } = await supabase
    .from('sensor_rules')
    .update(input)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating sensor rule:', error);
    throw new Error(`Failed to update sensor rule: ${error.message}`);
  }
  
  return data as SensorRule;
}

/**
 * Delete a sensor rule
 */
export async function deleteSensorRule(id: string): Promise<void> {
  const { error } = await supabase
    .from('sensor_rules')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting sensor rule:', error);
    throw new Error(`Failed to delete sensor rule: ${error.message}`);
  }
}

