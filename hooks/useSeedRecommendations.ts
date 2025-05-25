import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import * as Location from 'expo-location';

export type SeedQualityTier = 'premium' | 'standard' | 'basic';
export type CropType = 'leafy_greens' | 'fruiting' | 'root' | 'herbs' | 'all';

export type Seed = {
  id: string;
  name: string;
  variety: string;
  imageUrl: string;
  rating: number;
  marketplaceLink?: string;
  qualityTier: SeedQualityTier;
  cropType: CropType;
  supplier: string;
  price: number;
  inStock: boolean;
  localFavorites: number; // Number of local users who have planted this
  createdAt: string;
};

export type SeedFilters = {
  qualityTier?: SeedQualityTier;
  cropType?: CropType;
  minRating?: number;
  inStock?: boolean;
  searchText?: string;
  sortBy?: 'rating' | 'localFavorites' | 'newest';
};

export type UseSeedRecommendationsResult = {
  seeds: Seed[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  filters: SeedFilters;
  setFilters: (filters: SeedFilters) => void;
};

const PAGE_SIZE = 10;

export const useSeedRecommendations = (initialFilters?: SeedFilters): UseSeedRecommendationsResult => {
  const [seeds, setSeeds] = useState<Seed[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [filters, setFilters] = useState<SeedFilters>(initialFilters || {});
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const getLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission denied');
      }

      const location = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.warn('Failed to get location:', error);
    }
  }, []);

  const fetchSeeds = useCallback(async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setIsLoading(true);
        setPage(0);
      }
      setIsError(false);

      let query = supabase
        .from('seed_recommendations')
        .select(`
          id,
          name,
          variety,
          image_url,
          rating,
          marketplace_link,
          quality_tier,
          crop_type,
          supplier,
          price,
          in_stock,
          local_favorites,
          created_at
        `);

      // Apply filters
      if (filters.qualityTier) {
        query = query.eq('quality_tier', filters.qualityTier);
      }
      if (filters.cropType && filters.cropType !== 'all') {
        query = query.eq('crop_type', filters.cropType);
      }
      if (filters.minRating) {
        query = query.gte('rating', filters.minRating);
      }
      if (filters.inStock !== undefined) {
        query = query.eq('in_stock', filters.inStock);
      }
      if (filters.searchText) {
        query = query.ilike('name', `%${filters.searchText}%`);
      }

      // Apply sorting
      if (filters.sortBy === 'localFavorites') {
        query = query.order('local_favorites', { ascending: false });
      } else if (filters.sortBy === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else {
        query = query.order('rating', { ascending: false });
      }

      // Apply pagination
      const from = isRefreshing ? 0 : page * PAGE_SIZE;
      query = query.range(from, from + PAGE_SIZE - 1);

      const { data: recommendations, error: supabaseError } = await query;

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      const transformedSeeds = (recommendations as any[]).map(rec => ({
        id: rec.id,
        name: rec.name,
        variety: rec.variety,
        imageUrl: rec.image_url,
        rating: rec.rating,
        marketplaceLink: rec.marketplace_link,
        qualityTier: rec.quality_tier,
        cropType: rec.crop_type,
        supplier: rec.supplier,
        price: rec.price,
        inStock: rec.in_stock,
        localFavorites: rec.local_favorites,
        createdAt: rec.created_at,
      }));

      setSeeds(isRefreshing ? transformedSeeds : [...seeds, ...transformedSeeds]);
      setHasMore(transformedSeeds.length === PAGE_SIZE);
    } catch (err) {
      console.error('Failed to fetch seed recommendations:', err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [filters, location, page, seeds]);

  const loadMore = useCallback(async () => {
    if (!isLoading && hasMore) {
      setPage(prev => prev + 1);
    }
  }, [isLoading, hasMore]);

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  useEffect(() => {
    fetchSeeds(true);
  }, [filters]);

  useEffect(() => {
    if (page > 0) {
      fetchSeeds();
    }
  }, [page]);

  return {
    seeds,
    isLoading,
    isError,
    refetch: () => fetchSeeds(true),
    loadMore,
    hasMore,
    filters,
    setFilters,
  };
}; 