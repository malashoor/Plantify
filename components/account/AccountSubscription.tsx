import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  useColorScheme,
} from 'react-native';
import { useSubscription, useInvoices, useCancelSubscription } from '../../hooks/useSubscription';
import { usePlans, FALLBACK_PLANS } from '../../hooks/usePlans';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import { format } from 'date-fns';

export function AccountSubscription() {
  const { data: subscription, isLoading: isLoadingSubscription } = useSubscription();
  const { data: plans, isLoading: isLoadingPlans } = usePlans();
  const { data: invoices, isLoading: isLoadingInvoices } = useInvoices();
  const cancelSubscription = useCancelSubscription();
  const [showInvoices, setShowInvoices] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Find the current plan details
  const currentPlan = subscription && plans
    ? plans.find(plan => plan.id === subscription.plan_id)
    : null;
  
  // Fallback to static plans if needed
  const allPlans = plans || FALLBACK_PLANS;
  
  const handleCancelSubscription = () => {
    if (!subscription) return;
    
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You will lose access at the end of your billing period.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelSubscription.mutateAsync(subscription.stripe_subscription_id);
              Alert.alert(
                'Subscription Canceled',
                'Your subscription has been canceled. You will have access until the end of your current billing period.'
              );
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          }
        }
      ]
    );
  };
  
  const handleViewInvoice = (invoiceUrl: string) => {
    if (invoiceUrl) {
      Linking.openURL(invoiceUrl);
    }
  };
  
  const formatDate = (date: string) => {
    try {
      return format(new Date(date), 'MMM d, yyyy');
    } catch (error) {
      return date;
    }
  };
  
  if (isLoadingSubscription || isLoadingPlans) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      {subscription ? (
        // User has a subscription
        <View>
          <View style={styles.subscriptionCard}>
            <View style={styles.subscriptionHeader}>
              <Text style={[styles.subscriptionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Current Plan
              </Text>
              <View style={[
                styles.statusBadge, 
                { 
                  backgroundColor: subscription.status === 'active' 
                    ? '#85BB65' 
                    : subscription.status === 'trial'
                    ? '#FFC107'
                    : '#F44336'
                }
              ]}>
                <Text style={styles.statusText}>
                  {subscription.status === 'active' 
                    ? 'Active' 
                    : subscription.status === 'trial'
                    ? 'Trial'
                    : 'Canceled'}
                </Text>
              </View>
            </View>
            
            <Text style={[styles.planName, { color: Colors[colorScheme ?? 'light'].text }]}>
              {currentPlan?.name || 'Subscription'} Plan
            </Text>
            
            {currentPlan && (
              <Text style={[styles.price, { color: Colors[colorScheme ?? 'light'].text }]}>
                ${currentPlan.price}/month
              </Text>
            )}
            
            <Text style={[styles.billingInfo, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              {subscription.status === 'canceled' 
                ? `Access until: ${formatDate(subscription.current_period_end)}`
                : `Next billing date: ${formatDate(subscription.current_period_end)}`
              }
            </Text>
            
            {subscription.status === 'active' && (
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: Colors[colorScheme ?? 'light'].text }]}
                onPress={handleCancelSubscription}
              >
                <Text style={[styles.cancelButtonText, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Cancel Subscription
                </Text>
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity
            style={styles.invoicesHeader}
            onPress={() => setShowInvoices(!showInvoices)}
          >
            <Text style={[styles.invoicesTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Billing History
            </Text>
            <MaterialIcons
              name={showInvoices ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
              size={24}
              color={Colors[colorScheme ?? 'light'].text}
            />
          </TouchableOpacity>
          
          {showInvoices && (
            isLoadingInvoices ? (
              <ActivityIndicator size="small" color={Colors[colorScheme ?? 'light'].tint} />
            ) : invoices && invoices.length > 0 ? (
              <FlatList
                data={invoices}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.invoiceItem,
                      { backgroundColor: isDark ? '#2C2C2C' : '#FFFFFF' }
                    ]}
                    onPress={() => handleViewInvoice(item.invoice_pdf)}
                  >
                    <View style={styles.invoiceDetails}>
                      <Text style={[styles.invoiceDate, { color: Colors[colorScheme ?? 'light'].text }]}>
                        {formatDate(item.created_at)}
                      </Text>
                      <Text style={[styles.invoiceAmount, { color: Colors[colorScheme ?? 'light'].text }]}>
                        ${item.amount_paid.toFixed(2)}
                      </Text>
                    </View>
                    <MaterialIcons
                      name="receipt"
                      size={18}
                      color={Colors[colorScheme ?? 'light'].textSecondary}
                    />
                  </TouchableOpacity>
                )}
                style={styles.invoicesList}
              />
            ) : (
              <Text style={[styles.noInvoices, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                No billing history available
              </Text>
            )
          )}
        </View>
      ) : (
        // User doesn't have a subscription
        <View style={styles.noSubscriptionContainer}>
          <MaterialIcons
            name="subscriptions"
            size={64}
            color={Colors[colorScheme ?? 'light'].textSecondary}
          />
          <Text style={[styles.noSubscriptionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            No Active Subscription
          </Text>
          <Text style={[styles.noSubscriptionText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            Subscribe to a plan to access premium features
          </Text>
          <TouchableOpacity
            style={[styles.subscribePlanButton, { backgroundColor: '#85BB65' }]}
            onPress={() => {
              // Navigate to pricing screen
              // Replace with your navigation code
              alert('Navigate to pricing screen');
            }}
          >
            <Text style={styles.subscribePlanButtonText}>View Plans</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subscriptionCard: {
    padding: 16,
    borderRadius: 10,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subscriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  planName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 8,
  },
  billingInfo: {
    fontSize: 14,
    marginBottom: 16,
  },
  cancelButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  invoicesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  invoicesTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  invoicesList: {
    marginTop: 8,
  },
  invoiceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  invoiceDetails: {
    flex: 1,
  },
  invoiceDate: {
    fontSize: 14,
    marginBottom: 4,
  },
  invoiceAmount: {
    fontSize: 16,
    fontWeight: '500',
  },
  noInvoices: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
  },
  noSubscriptionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noSubscriptionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  noSubscriptionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  subscribePlanButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  subscribePlanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 