export type SensorParameter =
  | 'pH'
  | 'EC'
  | 'temperature'
  | 'nitrogen'
  | 'phosphorus'
  | 'potassium'
  | 'water_level';
export type SensorCondition = '<' | '>' | '<=' | '>=';

export interface SlackActionConfig {
  channel: string;
  mention?: string;
}

export interface SensorRuleActions {
  notification: boolean;
  sms?: boolean;
  slack?: SlackActionConfig;
}

export interface SensorRule {
  id: string;
  user_id: string;
  plant_id?: string;
  parameter: SensorParameter;
  condition: SensorCondition;
  threshold: number;
  duration_minutes: number;
  actions: SensorRuleActions;
  created_at: string;
  updated_at: string;
}

export interface CreateSensorRuleInput {
  plant_id?: string;
  parameter: SensorParameter;
  condition: SensorCondition;
  threshold: number;
  duration_minutes: number;
  actions: SensorRuleActions;
}

export interface UpdateSensorRuleInput {
  plant_id?: string;
  parameter?: SensorParameter;
  condition?: SensorCondition;
  threshold?: number;
  duration_minutes?: number;
  actions?: SensorRuleActions;
}

export interface SensorRuleWithStatus extends SensorRule {
  is_active: boolean;
  current_duration_minutes?: number;
  last_triggered_at?: string;
}

export type SensorRuleEvaluationResult = {
  triggered: boolean;
  reading: number;
  unit: string;
  rule: SensorRule;
};
