import React from 'react';
import { View, StyleSheet, Image, ScrollView, Pressable } from 'react-native';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';
import { usePlantPhotos } from '@/hooks/usePlantPhotos';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Camera } from 'lucide-react-native';

type PlantPhoto = {
  id: string;
  plantId: string;
  plantName: string;
  imageUrl: string;
  takenAt: string;
};

type DashboardPhotosProps = {
  onPhotoPress?: (photoId: string) => void;
  onViewAllPress?: () => void;
  onAddPhotoPress?: () => void;
  testID?: string;
};

export const DashboardPhotos = ({
  onPhotoPress,
  onViewAllPress,
  onAddPhotoPress,
  testID,
}: DashboardPhotosProps) => {
  const { t } = useTranslation();
  const { data: photos, isLoading, error, refetch } = usePlantPhotos();

  if (isLoading) {
    return <LoadingState message={t('photos.loading')} />;
  }

  if (error) {
    return <ErrorState message={error.message} onRetry={refetch} />;
  }

  if (!photos?.length) {
    return (
      <Card style={styles.emptyCard}>
        <Text style={styles.emptyText}>
          {t('photos.noPhotos')}
        </Text>
        <Button
          variant="primary"
          onPress={onAddPhotoPress}
          accessibilityLabel={t('photos.takeFirstPhoto')}
          accessibilityHint={t('photos.takeFirstPhotoHint')}
        >
          <View style={styles.addPhotoButton}>
            <Camera size={20} color={Colors.Text.Primary} />
            <Text style={styles.addPhotoText}>
              {t('photos.takeFirstPhoto')}
            </Text>
          </View>
        </Button>
      </Card>
    );
  }

  const renderPhoto = (photo: PlantPhoto) => (
    <Pressable
      key={photo.id}
      onPress={() => onPhotoPress?.(photo.id)}
      style={styles.photoContainer}
      accessibilityLabel={t('photos.viewPhoto', { plant: photo.plantName })}
      accessibilityHint={t('photos.viewPhotoHint')}
      testID={`photo-${photo.id}`}
    >
      <Image
        source={{ uri: photo.imageUrl }}
        style={styles.photo}
        accessibilityLabel={t('photos.plantImage', { plant: photo.plantName })}
      />
      <View style={styles.photoInfo}>
        <Text style={styles.plantName} numberOfLines={1}>
          {photo.plantName}
        </Text>
        <Text style={styles.photoDate}>
          {t('photos.takenAt', { date: photo.takenAt })}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {t('photos.title')}
        </Text>
        <Button
          variant="text"
          onPress={onViewAllPress}
          accessibilityLabel={t('photos.viewAll')}
          accessibilityHint={t('photos.viewAllHint')}
        >
          <View style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>
              {t('photos.viewAll')}
            </Text>
            <ChevronRight size={16} color={Colors.Text.Primary} />
          </View>
        </Button>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {photos.map(renderPhoto)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.MD,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.Text.Primary,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    color: Colors.Text.Primary,
    marginRight: Spacing.XS,
  },
  scrollContent: {
    paddingRight: Spacing.MD,
  },
  photoContainer: {
    width: 200,
    marginRight: Spacing.MD,
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: Colors.Background.Light,
  },
  photoInfo: {
    marginTop: Spacing.SM,
  },
  plantName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.Text.Primary,
    marginBottom: Spacing.XS,
  },
  photoDate: {
    fontSize: 14,
    color: Colors.Text.Secondary,
  },
  emptyCard: {
    padding: Spacing.LG,
    alignItems: 'center',
  },
  emptyText: {
    marginBottom: Spacing.MD,
    textAlign: 'center',
    color: Colors.Text.Secondary,
  },
  addPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addPhotoText: {
    marginLeft: Spacing.SM,
    color: Colors.Text.Primary,
  },
}); 