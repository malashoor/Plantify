import React from 'react';
import {
  View,
  StyleSheet,
  Image,
  ViewStyle,
  ImageStyle,
} from 'react-native';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Spacing, Colors } from '@/theme';
import type { Guide } from '@/hooks/useWateringGuides';

interface GuideCardProps {
  guide: Guide;
}

export function GuideCard({ guide }: GuideCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        {guide.icon && (
          <Image 
            source={{ uri: guide.icon }} 
            style={styles.icon}
            accessibilityLabel={`${guide.title} icon`}
          />
        )}
        <View style={styles.content}>
          <Text style={styles.title}>{guide.title}</Text>
          <Text style={styles.description}>{guide.description}</Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: Spacing.S,
    padding: Spacing.M,
  } as ViewStyle,
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  } as ViewStyle,
  icon: {
    width: 32,
    height: 32,
    marginRight: Spacing.M,
    borderRadius: 4,
  } as ImageStyle,
  content: {
    flex: 1,
  } as ViewStyle,
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: Spacing.XS,
    color: Colors.text.primary,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.text.secondary,
  },
}); 