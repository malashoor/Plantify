import { useState, useEffect } from 'react';

export type SeedQualityTier = 'basic' | 'standard' | 'premium';
export type CropType = 'all' | 'leafy_greens' | 'fruiting' | 'root' | 'herbs';

export interface Seed {
  id: string;
  name: string;
  variety: string;
  species?: string;
  cropType: CropType;
  qualityTier: SeedQualityTier;
  rating: number; // 1-5 stars
  price?: number;
  currency?: string;
  imageUrl?: string;
  description?: string;
  plantingInstructions?: string[];
  harvestTime?: string; // e.g., "60-80 days"
  localFavorites: number; // Number of local gardeners who planted this
  marketplaceLink?: string;
  inStock?: boolean;
  seedCount?: number;
  vendor?: string;
  organicCertified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SeedFilters {
  searchText?: string;
  qualityTier?: SeedQualityTier;
  cropType?: CropType;
  priceRange?: { min: number; max: number };
  inStockOnly?: boolean;
  organicOnly?: boolean;
  sortBy?: 'rating' | 'localFavorites' | 'newest' | 'price';
  sortOrder?: 'asc' | 'desc';
}

export function useSeedRecommendations() {
  const [seeds, setSeeds] = useState<Seed[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<SeedFilters>({
    sortBy: 'rating',
    sortOrder: 'desc'
  });

  // Mock seed data for development
  const mockSeeds: Seed[] = [
    {
      id: '1',
      name: 'Cherry Tomato Supreme',
      variety: 'Cherry',
      species: 'Solanum lycopersicum',
      cropType: 'fruiting',
      qualityTier: 'premium',
      rating: 4.8,
      price: 3.99,
      currency: 'USD',
      imageUrl: 'https://example.com/cherry-tomato.jpg',
      description: 'Sweet, prolific cherry tomatoes perfect for containers',
      plantingInstructions: [
        'Start indoors 6-8 weeks before last frost',
        'Transplant after soil warms to 60°F',
        'Space 18-24 inches apart'
      ],
      harvestTime: '65-75 days',
      localFavorites: 23,
      marketplaceLink: 'https://seedstore.example.com/cherry-tomato',
      inStock: true,
      seedCount: 25,
      vendor: 'Heritage Seeds Co.',
      organicCertified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Gourmet Basil Mix',
      variety: 'Mixed',
      species: 'Ocimum basilicum',
      cropType: 'herbs',
      qualityTier: 'premium',
      rating: 4.7,
      price: 2.49,
      currency: 'USD',
      imageUrl: 'https://example.com/basil-mix.jpg',
      description: 'Variety pack of gourmet basil including Genovese, Purple, and Lemon',
      plantingInstructions: [
        'Sow directly in warm soil after last frost',
        'Keep soil consistently moist',
        'Pinch flowers to encourage leaf growth'
      ],
      harvestTime: '60-90 days',
      localFavorites: 18,
      marketplaceLink: 'https://seedstore.example.com/basil-mix',
      inStock: true,
      seedCount: 50,
      vendor: 'Herb Garden Supply',
      organicCertified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Rainbow Carrots',
      variety: 'Rainbow Mix',
      species: 'Daucus carota',
      cropType: 'root',
      qualityTier: 'standard',
      rating: 4.5,
      price: 1.99,
      currency: 'USD',
      imageUrl: 'https://example.com/rainbow-carrots.jpg',
      description: 'Colorful mix of purple, orange, yellow, and white carrots',
      plantingInstructions: [
        'Direct sow in loose, well-draining soil',
        'Sow every 2-3 weeks for continuous harvest',
        'Thin to 2 inches apart when 2 inches tall'
      ],
      harvestTime: '70-80 days',
      localFavorites: 12,
      marketplaceLink: 'https://seedstore.example.com/rainbow-carrots',
      inStock: true,
      seedCount: 100,
      vendor: 'Garden Valley Seeds',
      organicCertified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '4',
      name: 'Buttercrunch Lettuce',
      variety: 'Buttercrunch',
      species: 'Lactuca sativa',
      cropType: 'leafy_greens',
      qualityTier: 'standard',
      rating: 4.3,
      price: 1.79,
      currency: 'USD',
      imageUrl: 'https://example.com/buttercrunch-lettuce.jpg',
      description: 'Tender, buttery lettuce with excellent heat tolerance',
      plantingInstructions: [
        'Sow directly in cool weather',
        'Provide afternoon shade in hot climates',
        'Harvest outer leaves for continuous production'
      ],
      harvestTime: '55-65 days',
      localFavorites: 8,
      marketplaceLink: 'https://seedstore.example.com/buttercrunch-lettuce',
      inStock: false,
      seedCount: 200,
      vendor: 'Cool Season Seeds',
      organicCertified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '5',
      name: 'Jalapeno Hot Pepper',
      variety: 'Jalapeno',
      species: 'Capsicum annuum',
      cropType: 'fruiting',
      qualityTier: 'basic',
      rating: 4.1,
      price: 1.29,
      currency: 'USD',
      imageUrl: 'https://example.com/jalapeno-pepper.jpg',
      description: 'Classic medium-heat pepper, perfect for salsas and cooking',
      plantingInstructions: [
        'Start indoors 8-10 weeks before last frost',
        'Transplant to warm soil with full sun',
        'Support plants with stakes or cages'
      ],
      harvestTime: '75-85 days',
      localFavorites: 15,
      marketplaceLink: 'https://seedstore.example.com/jalapeno-pepper',
      inStock: true,
      seedCount: 15,
      vendor: 'Spicy Seeds Inc.',
      organicCertified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const fetchSeeds = async () => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // TODO: Replace with real Supabase/API call
      // const { data, error } = await supabase
      //   .from('seed_recommendations')
      //   .select('*')
      //   .order(filters.sortBy || 'rating', { ascending: filters.sortOrder === 'asc' });

      let filteredSeeds = [...mockSeeds];

      // Apply filters
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        filteredSeeds = filteredSeeds.filter(seed =>
          seed.name.toLowerCase().includes(searchLower) ||
          seed.variety.toLowerCase().includes(searchLower) ||
          seed.description?.toLowerCase().includes(searchLower)
        );
      }

      if (filters.qualityTier && filters.qualityTier !== 'standard') {
        filteredSeeds = filteredSeeds.filter(seed => seed.qualityTier === filters.qualityTier);
      }

      if (filters.cropType && filters.cropType !== 'all') {
        filteredSeeds = filteredSeeds.filter(seed => seed.cropType === filters.cropType);
      }

      if (filters.inStockOnly) {
        filteredSeeds = filteredSeeds.filter(seed => seed.inStock);
      }

      if (filters.organicOnly) {
        filteredSeeds = filteredSeeds.filter(seed => seed.organicCertified);
      }

      // Apply sorting
      if (filters.sortBy) {
        filteredSeeds.sort((a, b) => {
          let aValue, bValue;
          
          switch (filters.sortBy) {
            case 'rating':
              aValue = a.rating;
              bValue = b.rating;
              break;
            case 'localFavorites':
              aValue = a.localFavorites;
              bValue = b.localFavorites;
              break;
            case 'newest':
              aValue = new Date(a.createdAt).getTime();
              bValue = new Date(b.createdAt).getTime();
              break;
            case 'price':
              aValue = a.price || 0;
              bValue = b.price || 0;
              break;
            default:
              return 0;
          }

          if (filters.sortOrder === 'asc') {
            return aValue - bValue;
          } else {
            return bValue - aValue;
          }
        });
      }

      setSeeds(filteredSeeds);
      setHasMore(false); // No pagination in mock data
      setIsLoading(false);
    } catch (err) {
      setIsError(true);
      setError('Failed to fetch seed recommendations');
      setIsLoading(false);
      console.error('Error fetching seeds:', err);
    }
  };

  const refetch = async () => {
    await fetchSeeds();
  };

  const loadMore = async () => {
    // TODO: Implement pagination for real API
    console.log('Load more seeds...');
  };

  useEffect(() => {
    fetchSeeds();
  }, [filters]);

  return {
    seeds,
    isLoading,
    isError,
    error,
    refetch,
    loadMore,
    hasMore,
    filters,
    setFilters
  };
} 