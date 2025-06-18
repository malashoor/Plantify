import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'expo-router';
import React, { useState, useCallback } from 'react';
import { 
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Image,
  TextInput,
  useColorScheme,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSeedRecommendations, Seed, SeedQualityTier, CropType } from '../../hooks/useSeedRecommendations';
import placeholderSeedImage from '../../assets/images/placeholder-seed.png';

// Simple theme helper
const createTheme = (colorScheme: 'light' | 'dark' | null) => ({
  colors: {
    primary: '#4CAF50',
    background: colorScheme === 'dark' ? '#1E1E1E' : '#F5F5F5',
    surface: colorScheme === 'dark' ? '#2A2A2A' : '#FFFFFF',
    text: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
    textSecondary: colorScheme === 'dark' ? '#BBBBBB' : '#666666',
    border: colorScheme === 'dark' ? '#444444' : '#E0E0E0',
    error: '#F44336',
  }
});

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

// Custom Button Component
const Button = ({ 
  title, 
  onPress, 
  iconName, 
  style,
  textStyle,
  theme 
}: { 
  title: string; 
  onPress: () => void; 
  iconName?: keyof typeof Ionicons.glyphMap;
  style?: any;
  textStyle?: any;
  theme: any;
}) => (
  <TouchableOpacity 
    style={[styles.button, { backgroundColor: theme.colors.primary }, style]} 
    onPress={onPress}
  >
    <View style={styles.buttonContent}>
      {iconName && (
        <Ionicons name={iconName} size={20} color="white" style={styles.buttonIcon} />
      )}
      <Text style={[styles.buttonText, textStyle]}>{title}</Text>
    </View>
  </TouchableOpacity>
);

// Custom Card Component
const Card = ({ children, style, theme }: { children: React.ReactNode; style?: any; theme: any }) => (
  <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }, style]}>
    {children}
  </View>
);

// Custom SearchBar Component
const SearchBar = ({ 
  placeholder, 
  value, 
  onChangeText, 
  theme 
}: { 
  placeholder: string; 
  value: string; 
  onChangeText: (text: string) => void;
  theme: any;
}) => (
  <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
    <Ionicons name="search" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
    <TextInput
      style={[styles.searchInput, { color: theme.colors.text }]}
      placeholder={placeholder}
      placeholderTextColor={theme.colors.textSecondary}
      value={value}
      onChangeText={onChangeText}
    />
  </View>
);

// Custom Dropdown Component
type DropdownProps = {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
  theme: any;
};

function Dropdown({ label, value, options, onChange, theme }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <View style={styles.filterSelect}>
      <Text style={[styles.filterLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
      <TouchableOpacity
        style={[styles.dropdownButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        onPress={() => setIsOpen(true)}
      >
        <Text style={[styles.dropdownButtonText, { color: theme.colors.text }]}>
          {selectedOption?.label || 'Select...'}
        </Text>
        <Ionicons name="chevron-down" size={16} color={theme.colors.textSecondary} />
      </TouchableOpacity>
      
      <Modal visible={isOpen} transparent animationType="fade">
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={[styles.dropdownModal, { backgroundColor: theme.colors.surface }]}>
            <ScrollView>
              {options.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.dropdownItem,
                    { borderBottomColor: theme.colors.border },
                    option.value === value && { backgroundColor: theme.colors.primary + '20' }
                  ]}
                  onPress={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                >
                  <Text style={[
                    styles.dropdownItemText,
                    { color: theme.colors.text },
                    option.value === value && { fontWeight: 'bold', color: theme.colors.primary }
                  ]}>
                    {option.label}
                  </Text>
                  {option.value === value && (
                    <Ionicons name="checkmark" size={16} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

function EmptyState({ message, theme }: { message: string; theme: any }) {
  return (
    <View style={styles.emptyContainer}>
      <Ionicons name="leaf-outline" size={48} color={theme.colors.textSecondary} />
      <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>{message}</Text>
    </View>
  );
}

function SeedCard({ seed, theme }: { seed: Seed; theme: any }) {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.push(`/seeds/${seed.id}`)}
      style={styles.cardTouchable}
    >
      <Card theme={theme}>
        <Text style={[styles.seedName, { color: theme.colors.text }]}>{seed.name}</Text>
        <Image
          source={seed.imageUrl ? { uri: seed.imageUrl } : placeholderSeedImage}
          style={styles.image}
        />
        <View style={styles.cardContent}>
          <Text style={[styles.variety, { color: theme.colors.textSecondary }]}>{seed.variety}</Text>
          <View style={styles.ratingContainer}>
            <Text style={[styles.ratingLabel, { color: theme.colors.text }]}>Rating:</Text>
            <Text style={[styles.rating, { color: theme.colors.primary }]}>
              {seed.rating.toFixed(1)}/5
            </Text>
          </View>
          <View style={styles.qualityContainer}>
            <Text style={[styles.qualityLabel, { color: theme.colors.text }]}>Quality:</Text>
            <Text style={[styles.quality, { color: theme.colors.primary }]}>
              {seed.qualityTier.charAt(0).toUpperCase() + seed.qualityTier.slice(1)}
            </Text>
          </View>
          {seed.localFavorites > 0 && (
            <Text style={[styles.localFavorites, { color: theme.colors.textSecondary }]}>
              {seed.localFavorites} local gardeners planted this
            </Text>
          )}
        </View>
        {seed.marketplaceLink ? (
          <Button
            title="Buy on Marketplace"
            onPress={() => {
              console.log('Open marketplace:', seed.marketplaceLink);
            }}
            theme={theme}
            style={styles.buyButton}
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
  const colorScheme = useColorScheme();
  const theme = createTheme(colorScheme);
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
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Recommended Seeds</Text>
          <Button
            title="Add New Seed"
            onPress={() => router.push('/seeds/new')}
            iconName="add"
            theme={theme}
          />
        </View>
        <EmptyState message="Loading seed recommendations..." theme={theme} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Recommended Seeds</Text>
        <Button
          title="Add New Seed"
          onPress={() => router.push('/seeds/new')}
          iconName="add"
          theme={theme}
        />
      </View>

      <View style={[styles.searchSection, { backgroundColor: theme.colors.surface }]}>
        <SearchBar
          placeholder="Search seeds..."
          value={searchText}
          onChangeText={handleSearch}
          theme={theme}
        />
        <View style={styles.dropdownRow}>
          <Dropdown
            label="Sort By"
            value={filters.sortBy || 'rating'}
            options={SORT_OPTIONS}
            onChange={handleSort}
            theme={theme}
          />
        </View>
      </View>

      <View style={[styles.filters, { backgroundColor: theme.colors.surface }]}>
        <Dropdown
          label="Quality Tier"
          value={filters.qualityTier || ''}
          options={QUALITY_TIERS}
          onChange={(value) => setFilters({ ...filters, qualityTier: value as SeedQualityTier })}
          theme={theme}
        />
        <Dropdown
          label="Crop Type"
          value={filters.cropType || ''}
          options={CROP_TYPES}
          onChange={(value) => setFilters({ ...filters, cropType: value as CropType })}
          theme={theme}
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
        renderItem={({ item }: { item: Seed }) => <SeedCard seed={item} theme={theme} />}
        contentContainerStyle={styles.list}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <EmptyState message="No seed recommendations found. Try adjusting your filters." theme={theme} />
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchSection: {
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  dropdownRow: {
    flexDirection: 'row',
  },
  filters: {
    flexDirection: 'row',
    padding: 16,
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
    marginBottom: 4,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dropdownButtonText: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownModal: {
    width: '80%',
    maxHeight: '60%',
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  dropdownItemText: {
    fontSize: 16,
  },
  list: {
    padding: 8,
  },
  cardTouchable: {
    marginBottom: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  seedName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  image: {
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  cardContent: {
    marginBottom: 12,
  },
  variety: {
    fontSize: 16,
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
    fontStyle: 'italic',
  },
  buyButton: {
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
    justifyContent: 'center',
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 16,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 6,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
}); 