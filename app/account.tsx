import React, { useState } from 'react';
import { ScrollView, StyleSheet, useColorScheme, View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../hooks/useAuth';

// Simple theme object
const createTheme = (colorScheme: 'light' | 'dark' | null) => ({
  colors: {
    primary: '#4CAF50',
    primaryDark: '#388E3C',
    background: colorScheme === 'dark' ? '#121212' : '#FFFFFF',
    surface: colorScheme === 'dark' ? '#1E1E1E' : '#F8F9FA',
    text: colorScheme === 'dark' ? '#FFFFFF' : '#212121',
    textSecondary: colorScheme === 'dark' ? '#AAAAAA' : '#757575',
    border: colorScheme === 'dark' ? '#333333' : '#E0E0E0',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
  }
});

export default function AccountScreen() {
  const colorScheme = useColorScheme();
  const theme = createTheme(colorScheme);
  const { user, signOut, userRole } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              const { error } = await signOut();
              if (error) {
                Alert.alert('Error', error);
              } else {
                router.replace('/landing');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(dateString));
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return 'shield-checkmark';
      case 'grower': return 'leaf';
      case 'child': return 'happy';
      default: return 'person';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return theme.colors.error;
      case 'grower': return theme.colors.success;
      case 'child': return theme.colors.warning;
      default: return theme.colors.textSecondary;
    }
  };
  
  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Stack.Screen options={{ title: 'My Account' }} />
      
      {/* Profile Section */}
      <View style={[styles.profileCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <View style={styles.profileHeader}>
          <View style={[styles.avatarContainer, { backgroundColor: theme.colors.primary }]}>
            <Ionicons name="person" size={32} color="white" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.userName, { color: theme.colors.text }]}>
              {user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}
            </Text>
            <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>
              {user?.email}
            </Text>
            <View style={styles.roleContainer}>
              <Ionicons 
                name={getRoleIcon(userRole)} 
                size={16} 
                color={getRoleColor(userRole)} 
              />
              <Text style={[styles.userRole, { color: getRoleColor(userRole) }]}>
                {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
              </Text>
            </View>
          </View>
        </View>
        
        {user?.created_at && (
          <View style={styles.memberSince}>
            <Ionicons name="calendar" size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.memberSinceText, { color: theme.colors.textSecondary }]}>
              Member since {formatDate(user.created_at)}
            </Text>
          </View>
        )}
      </View>

      {/* Account Actions */}
      <View style={[styles.actionsCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Account Settings</Text>
        
        <TouchableOpacity 
          style={[styles.actionItem, { borderBottomColor: theme.colors.border }]}
          onPress={() => {
            try {
              console.log('🔧 Navigating to Edit Profile');
              router.push('/edit-profile');
            } catch (error) {
              console.error('Navigation error:', error);
              Alert.alert('Navigation Error', 'Could not open Edit Profile screen. Please try again.');
            }
          }}
        >
          <Ionicons name="create" size={20} color={theme.colors.textSecondary} />
          <Text style={[styles.actionText, { color: theme.colors.text }]}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionItem, { borderBottomColor: theme.colors.border }]}
          onPress={() => {
            try {
              console.log('🔔 Navigating to Notifications');
              router.push('/notifications');
            } catch (error) {
              console.error('Navigation error:', error);
              Alert.alert('Navigation Error', 'Could not open Notifications screen. Please try again.');
            }
          }}
        >
          <Ionicons name="notifications" size={20} color={theme.colors.textSecondary} />
          <Text style={[styles.actionText, { color: theme.colors.text }]}>Notifications</Text>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionItem, { borderBottomColor: theme.colors.border }]}
          onPress={() => {
            try {
              console.log('🔒 Navigating to Privacy & Security');
              router.push('/privacy');
            } catch (error) {
              console.error('Navigation error:', error);
              Alert.alert('Navigation Error', 'Could not open Privacy screen. Please try again.');
            }
          }}
        >
          <Ionicons name="shield-checkmark" size={20} color={theme.colors.textSecondary} />
          <Text style={[styles.actionText, { color: theme.colors.text }]}>Privacy & Security</Text>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionItem, { borderBottomColor: theme.colors.border }]}
          onPress={() => Alert.alert('Export Data', 'Data export functionality coming soon! This will allow you to download all your plant data, photos, and care history in a portable format.')}
        >
          <Ionicons name="download" size={20} color={theme.colors.textSecondary} />
          <Text style={[styles.actionText, { color: theme.colors.text }]}>Export Data</Text>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Support Section */}
      <View style={[styles.actionsCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Support</Text>
        
        <TouchableOpacity 
          style={[styles.actionItem, { borderBottomColor: theme.colors.border }]}
          onPress={() => Alert.alert('Help Center', 'Visit our help center at help.greensai.com')}
        >
          <Ionicons name="help-circle" size={20} color={theme.colors.textSecondary} />
          <Text style={[styles.actionText, { color: theme.colors.text }]}>Help Center</Text>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionItem, { borderBottomColor: theme.colors.border }]}
          onPress={() => Alert.alert('Contact Us', 'Email us at support@greensai.com')}
        >
          <Ionicons name="mail" size={20} color={theme.colors.textSecondary} />
          <Text style={[styles.actionText, { color: theme.colors.text }]}>Contact Support</Text>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionItem, { borderBottomColor: 'transparent' }]}
          onPress={() => Alert.alert('About', 'GreensAI v1.0.0\nYour AI-powered plant care companion')}
        >
          <Ionicons name="information-circle" size={20} color={theme.colors.textSecondary} />
          <Text style={[styles.actionText, { color: theme.colors.text }]}>About GreensAI</Text>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity 
        style={[styles.logoutButton, { backgroundColor: theme.colors.error }]}
        onPress={handleLogout}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <>
            <Ionicons name="hourglass" size={20} color="white" />
            <Text style={styles.logoutButtonText}>Signing Out...</Text>
          </>
        ) : (
          <>
            <Ionicons name="log-out" size={20} color="white" />
            <Text style={styles.logoutButtonText}>Sign Out</Text>
          </>
        )}
      </TouchableOpacity>

      {/* App Version */}
      <Text style={[styles.versionText, { color: theme.colors.textSecondary }]}>
        GreensAI v1.0.0
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  profileCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 8,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userRole: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  memberSince: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberSinceText: {
    fontSize: 12,
  },
  actionsCard: {
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    padding: 16,
    paddingBottom: 8,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  actionText: {
    fontSize: 16,
    flex: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  versionText: {
    fontSize: 12,
    textAlign: 'center',
  },
}); 