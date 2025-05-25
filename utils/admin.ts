import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from '@/utils/supabase';

// Admin role types
export type AdminRole =
  | 'super_admin'
  | 'content_moderator'
  | 'support_admin'
  | 'analytics_viewer';

// User activity tracking
export interface UserActivity {
  userId: string;
  action: string;
  timestamp: string;
  metadata: Record<string, any>;
}

// Content moderation
export interface ContentReport {
  id: string;
  userId: string;
  contentType: 'plant' | 'comment' | 'profile';
  contentId: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved';
  timestamp: string;
}

// Admin permissions
const ADMIN_PERMISSIONS = {
  super_admin: ['*'],
  content_moderator: ['read_content', 'moderate_content', 'ban_users'],
  support_admin: ['read_users', 'support_actions', 'refund_transactions'],
  analytics_viewer: ['read_analytics', 'export_reports'],
};

// Check admin permissions
export const hasPermission = async (permission: string): Promise<boolean> => {
  try {
    const {
      data: { role },
    } = await supabase.auth.getSession();
    if (!role) return false;

    const permissions = ADMIN_PERMISSIONS[role as AdminRole];
    return (
      permissions?.includes('*') || permissions?.includes(permission) || false
    );
  } catch (error) {
    console.error('Error checking admin permission:', error);
    return false;
  }
};

// Track user activity
export const trackUserActivity = async (
  activity: Omit<UserActivity, 'timestamp'>,
) => {
  try {
    const { error } = await supabase.from('user_activities').insert({
      ...activity,
      timestamp: new Date().toISOString(),
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error tracking user activity:', error);
  }
};

// Content moderation
export const reportContent = async (
  report: Omit<ContentReport, 'id' | 'timestamp' | 'status'>,
) => {
  try {
    const { error } = await supabase.from('content_reports').insert({
      ...report,
      status: 'pending',
      timestamp: new Date().toISOString(),
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error reporting content:', error);
  }
};

// User management
export const banUser = async (userId: string, reason: string) => {
  if (!(await hasPermission('ban_users'))) {
    throw new Error('Insufficient permissions');
  }

  try {
    const { error } = await supabase.from('user_bans').insert({
      user_id: userId,
      reason,
      banned_at: new Date().toISOString(),
    });

    if (error) throw error;

    // Disable user's auth
    await supabase.auth.admin.updateUserById(userId, {
      banned_until: '2100-01-01',
    });
  } catch (error) {
    console.error('Error banning user:', error);
    throw error;
  }
};

// Analytics tracking
export const trackAnalytics = async (
  event: string,
  properties: Record<string, any>,
) => {
  try {
    const { error } = await supabase.from('analytics_events').insert({
      event,
      properties,
      timestamp: new Date().toISOString(),
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error tracking analytics:', error);
  }
};

// Export analytics data
export const exportAnalytics = async (startDate: string, endDate: string) => {
  if (!(await hasPermission('export_reports'))) {
    throw new Error('Insufficient permissions');
  }

  try {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('*')
      .gte('timestamp', startDate)
      .lte('timestamp', endDate);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error exporting analytics:', error);
    throw error;
  }
};

// Security audit logging
export const logSecurityAudit = async (
  action: string,
  details: Record<string, any>,
) => {
  try {
    const { error } = await supabase.from('security_audit_logs').insert({
      action,
      details,
      timestamp: new Date().toISOString(),
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error logging security audit:', error);
  }
};
