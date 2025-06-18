export enum AnalyticsEvent {
  // Screen Events
  SCREEN_VIEW = 'Screen View',
  APP_OPEN = 'App Open',
  APP_BACKGROUND = 'App Background',

  // User Events
  USER_SIGNUP = 'User Signup',
  USER_LOGIN = 'User Login',
  USER_LOGOUT = 'User Logout',

  // Feature Events
  PLANT_ANALYSIS = 'Plant Analysis',
  PLANT_IDENTIFICATION = 'Plant Identification',
  REMINDER_SET = 'Reminder Set',
  REMINDER_TRIGGERED = 'Reminder Triggered',

  // Subscription Events
  SUBSCRIPTION_START = 'Subscription Start',
  SUBSCRIPTION_CANCEL = 'Subscription Cancel',
  SUBSCRIPTION_RENEW = 'Subscription Renew',

  // Error Events
  ERROR_OCCURRED = 'Error Occurred',
  PAYMENT_ERROR = 'Payment Error',
  CRITICAL_ERROR = 'Critical Error',

  // Engagement Events
  FEATURE_USED = 'Feature Used',
  CONTENT_VIEW = 'Content View',
  CONTENT_SHARE = 'Content Share',
  NOTIFICATION_RECEIVED = 'Notification Received',
  NOTIFICATION_OPENED = 'Notification Opened'
}

export enum UserProperty {
  SUBSCRIPTION_STATUS = 'subscription_status',
  SUBSCRIPTION_TIER = 'subscription_tier',
  TOTAL_PLANTS = 'total_plants',
  ANALYZED_PLANTS = 'analyzed_plants',
  REMINDERS_SET = 'reminders_set',
  LAST_ANALYSIS = 'last_analysis_date',
  SIGNUP_DATE = 'signup_date',
  USER_TYPE = 'user_type',
  PLATFORM = 'platform',
  APP_VERSION = 'app_version',
  DEVICE_TYPE = 'device_type',
  ENGAGEMENT_SCORE = 'engagement_score'
}

export interface AnalyticsProperties {
  // Screen Properties
  screen_name?: string;
  previous_screen?: string;
  
  // User Properties
  user_id?: string;
  email?: string;
  
  // Subscription Properties
  subscription_id?: string;
  plan_type?: string;
  amount?: number;
  currency?: string;
  payment_method?: string;
  
  // Feature Properties
  feature_name?: string;
  feature_type?: string;
  duration_ms?: number;
  result?: string;
  
  // Error Properties
  error_type?: string;
  error_message?: string;
  error_code?: string;
  error_stack?: string;
  
  // Custom Properties
  [key: string]: any;
}

export interface AnalyticsUserProfile {
  $email?: string;
  $name?: string;
  $created?: string;
  [UserProperty.SUBSCRIPTION_STATUS]?: string;
  [UserProperty.SUBSCRIPTION_TIER]?: string;
  [UserProperty.TOTAL_PLANTS]?: number;
  [UserProperty.ANALYZED_PLANTS]?: number;
  [UserProperty.REMINDERS_SET]?: number;
  [UserProperty.LAST_ANALYSIS]?: string;
  [UserProperty.USER_TYPE]?: string;
  [key: string]: any;
} 