import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { withAdminGuard } from '../../components/hoc/withAdminGuard';
import { Text } from '../../components/ui/Text';
import { supabase } from '../../utils/supabase';
import { Promotion } from '../../types/supabase';
import { Ionicons } from '@expo/vector-icons';

function PromotionCard({ promotion, onPress }: { promotion: Promotion; onPress: () => void }) {
  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={onPress}
    >
      <View style={styles.cardHeader}>
        <Text variant="subtitle">{promotion.code}</Text>
        <Text variant="caption" style={styles.type}>{promotion.type}</Text>
      </View>
      <Text>Value: {promotion.value}</Text>
      {promotion.expires_at && (
        <Text variant="caption">
          Expires: {new Date(promotion.expires_at).toLocaleDateString()}
        </Text>
      )}
    </TouchableOpacity>
  );
}

function PromotionsScreen() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPromotions(data || []);
    } catch (err) {
      console.error('Error fetching promotions:', err);
      Alert.alert('Error', 'Failed to load promotions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    // Navigate to create form
    navigation.navigate('CreatePromotion');
  };

  const handleEditPromotion = (promotion: Promotion) => {
    // Navigate to edit form with promotion data
    navigation.navigate('EditPromotion', { promotion });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="title">Promotions</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleCreateNew}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.list}>
        {promotions.map((promotion) => (
          <PromotionCard
            key={promotion.id}
            promotion={promotion}
            onPress={() => handleEditPromotion(promotion)}
          />
        ))}
        {promotions.length === 0 && (
          <Text style={styles.emptyText}>
            No promotions yet. Create one to get started!
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#2196F3',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    flex: 1,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  type: {
    textTransform: 'capitalize',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 32,
    color: '#666',
  },
});

export default withAdminGuard(PromotionsScreen); 