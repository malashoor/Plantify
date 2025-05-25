import { Star } from 'lucide-react-native';
import React from 'react';

import type { InfluencerCampaign } from '@/utils/marketing';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';


interface Props {
  campaign: InfluencerCampaign;
  onApply: (code: string) => void;
}

export default function InfluencerPromo({ campaign, onApply }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{
            uri: `https://ui-avatars.com/api/?name=${campaign.influencer}&background=random`,
          }}
          style={styles.avatar}
        />
        <View style={styles.headerText}>
          <Text style={styles.influencerName}>{campaign.influencer}</Text>
          <Text style={styles.discount}>{campaign.discount}% OFF</Text>
        </View>
        <Star size={24} color="#FFD700" />
      </View>

      <View style={styles.codeContainer}>
        <Text style={styles.codeLabel}>Use Code</Text>
        <Text style={styles.code}>{campaign.code}</Text>
      </View>

      <TouchableOpacity
        style={styles.applyButton}
        onPress={() => onApply(campaign.code)}
      >
        <Text style={styles.applyButtonText}>Apply Discount</Text>
      </TouchableOpacity>

      <Text style={styles.validUntil}>
        Valid until {new Date(campaign.validUntil).toLocaleDateString()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    margin: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  influencerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
    fontFamily: 'Poppins-Bold',
  },
  discount: {
    fontSize: 14,
    color: '#2E7D32',
    fontFamily: 'Poppins-Medium',
  },
  codeContainer: {
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  codeLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
    fontFamily: 'Poppins-Regular',
  },
  code: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    letterSpacing: 2,
    fontFamily: 'Poppins-Bold',
  },
  applyButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Poppins-Bold',
  },
  validUntil: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
});
