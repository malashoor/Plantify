import { Text, Card, Button, useTheme, ListItem, SearchBar } from '@rneui/themed';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'expo-router';
import React, { useState, useCallback } from 'react';
import { 
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import { useSeedRecommendations, Seed, SeedQualityTier, CropType } from '@/hooks/useSeedRecommendations';

const QUALITY_TIERS: { label: string; value: SeedQualityTier }[] = [
  { label: 'All Tiers', value: 'standard' },
  { label: 'Premium', value: 'premium' },
  { label: 'Standard', value: 'standard' },
  { label: 'Basic', value: 'basic' },
];

const CROP_TYPES: { label: string; value: CropType }[] = [
  { label: 'All Crops', value: 'all' },
  { label: 'Leafy Greens', value: 'leafy_greens' },
  { label: 'Fruiting', value: 'fruiting' },
  { label: 'Root', value: 'root' },
  { label: 'Herbs', value: 'herbs' },
];

const SORT_OPTIONS = [
  { label: 'Highest Rated', value: 'rating' },
  { label: 'Most Local Likes', value: 'localFavorites' },
  { label: 'Newest', value: 'newest' },
];

type DropdownProps = {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
};

function Dropdown({ label, value, options, onChange }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <View style={styles.filterSelect}>
      <Text style={styles.filterLabel}>{label}</Text>
      <Button
        title={selectedOption?.label || 'Select...'}
        type="outline"
        onPress={() => setIsOpen(true)}
        containerStyle={styles.dropdownButton}
      />
      {isOpen && (
        <View style={styles.dropdownList}>
          {options.map((option) => (
            <ListItem
              key={option.value}
              onPress={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              containerStyle={[
                styles.dropdownItem,
                option.value === value && styles.selectedDropdownItem,
              ]}
            >
              <ListItem.Content>
                <ListItem.Title
                  style={[
                    styles.dropdownItemText,
                    option.value === value && styles.selectedDropdownItemText,
                  ]}
                >
                  {option.label}
                </ListItem.Title>
              </ListItem.Content>
            </ListItem>
          ))}
        </View>
      )}
    </View>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

function SeedCard({ seed }: { seed: Seed }) {
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.push(`/seeds/${seed.id}`)}
      style={styles.cardTouchable}
    >
      <Card containerStyle={styles.card}>
        <Card.Title>{seed.name}</Card.Title>
        <Card.Image
          source={seed.imageUrl ? { uri: seed.imageUrl } : require('@/assets/images/placeholder-seed.png')}
          style={styles.image}
        />
        <View style={styles.cardContent}>
          <Text style={styles.variety}>{seed.variety}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingLabel}>Rating:</Text>
            <Text style={[styles.rating, { color: theme.colors.primary }]}>
              {seed.rating.toFixed(1)}/5
            </Text>
          </View>
          <View style={styles.qualityContainer}>
            <Text style={styles.qualityLabel}>Quality:</Text>
            <Text style={[styles.quality, { color: theme.colors.secondary }]}>
              {seed.qualityTier.charAt(0).toUpperCase() + seed.qualityTier.slice(1)}
            </Text>
          </View>
          {seed.localFavorites > 0 && (
            <Text style={styles.localFavorites}>
              {seed.localFavorites} local gardeners planted this
            </Text>
          )}
        </View>
        {seed.marketplaceLink ? (
          <Button
            title="Buy on Marketplace"
            onPress={() => {
              // Handle marketplace link
              console.log('Open marketplace:', seed.marketplaceLink);
            }}
            containerStyle={styles.buttonContainer}
          />
        ) : (
          <Text style={[styles.unavailable, { color: theme.colors.error }]}>
            Not available in marketplace
          </Text>
        )}
      </Card>
    </TouchableOpacity>
  );
}

export default function SeedsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { seeds, isLoading, isError, refetch, loadMore, hasMore, filters, setFilters } = useSeedRecommendations();
  const [searchText, setSearchText] = useState('');

  const handleSearch = useCallback((text: string) => {
    setSearchText(text);
    setFilters({ ...filters, searchText: text });
  }, [filters, setFilters]);

  const handleSort = useCallback((value: string) => {
    setFilters({ ...filters, sortBy: value as 'rating' | 'localFavorites' | 'newest' });
  }, [filters, setFilters]);

  if (isLoading && seeds.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text h4>Recommended Seeds</Text>
          <Button
            title="Add New Seed"
            onPress={() => router.push('/seeds/new')}
            icon={{
              name: 'add',
              type: 'material',
              color: 'white',
              size: 20,
            }}
          />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Loading seed recommendations...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text h4>Recommended Seeds</Text>
        <Button
          title="Add New Seed"
          onPress={() => router.push('/seeds/new')}
          icon={{
            name: 'add',
            type: 'material',
            color: 'white',
            size: 20,
          }}
        />
      </View>

      <View style={styles.searchContainer}>
        <SearchBar
          placeholder="Search seeds..."
          onChangeText={handleSearch}
          value={searchText}
          platform="ios"
          containerStyle={styles.searchBarContainer}
          inputContainerStyle={styles.searchBarInputContainer}
        />
        <Dropdown
          label="Sort By"
          value={filters.sortBy || 'rating'}
          options={SORT_OPTIONS}
          onChange={handleSort}
        />
      </View>

      <View style={styles.filters}>
        <Dropdown
          label="Quality Tier"
          value={filters.qualityTier || ''}
          options={QUALITY_TIERS}
          onChange={(value) => setFilters({ ...filters, qualityTier: value as SeedQualityTier })}
        />
        <Dropdown
          label="Crop Type"
          value={filters.cropType || ''}
          options={CROP_TYPES}
          onChange={(value) => setFilters({ ...filters, cropType: value as CropType })}
        />
      </View>

      {isError && (
        <Text style={[styles.error, { color: theme.colors.error }]}>
          Failed to load seed recommendations
        </Text>
      )}

      <FlatList
        data={seeds}
        keyExtractor={(item: Seed) => item.id}
        renderItem={({ item }: { item: Seed }) => <SeedCard seed={item} />}
        contentContainerStyle={styles.list}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <EmptyState message="No seed recommendations found. Try adjusting your filters." />
        }
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            colors={[theme.colors.primary]}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  searchBarContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    paddingHorizontal: 0,
  },
  searchBarInputContainer: {
    backgroundColor: '#f0f0f0',
  },
  filters: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  filterSelect: {
    flex: 1,
    marginHorizontal: 4,
  },
  filterLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  dropdownButton: {
    marginTop: 4,
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
  },
  dropdownItem: {
    paddingVertical: 8,
  },
  selectedDropdownItem: {
    backgroundColor: '#f0f0f0',
  },
  dropdownItemText: {
    fontSize: 16,
  },
  selectedDropdownItemText: {
    fontWeight: 'bold',
  },
  list: {
    padding: 8,
  },
  cardTouchable: {
    marginBottom: 16,
  },
  card: {
    borderRadius: 12,
    margin: 0,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  image: {
    height: 200,
    borderRadius: 8,
  },
  cardContent: {
    padding: 8,
  },
  variety: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingLabel: {
    fontSize: 16,
    marginRight: 8,
  },
  rating: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  qualityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  qualityLabel: {
    fontSize: 16,
    marginRight: 8,
  },
  quality: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  localFavorites: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  buttonContainer: {
    marginTop: 8,
  },
  unavailable: {
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  error: {
    textAlign: 'center',
    margin: 16,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
}); 