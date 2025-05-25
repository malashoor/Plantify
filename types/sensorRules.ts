export type SensorParameter = 'pH' | 'EC' | 'temperature' | 'nitrogen' | 'phosphorus' | 'potassium' | 'water_level';

export type SensorCondition = '<' | '<=' | '>' | '>=';

export interface SlackAction {
  channel: string;
}

export interface SensorRuleActions {
  notification: boolean;
  sms: boolean;
  slack: SlackAction | null;
}

export interface SensorRule {
  id: string;
  parameter: SensorParameter;
  condition: SensorCondition;
  threshold: number;
  duration_minutes: number;
  actions: SensorRuleActions;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export interface CreateSensorRuleRequest {
  parameter: SensorParameter;
  condition: SensorCondition;
  threshold: number;
  duration_minutes: number;
  actions: SensorRuleActions;
}

export interface UpdateSensorRuleRequest extends Partial<CreateSensorRuleRequest> {
  id: string;
} 