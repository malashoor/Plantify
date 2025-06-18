import { Plant } from '../types/Plant';

const TIMEOUT_DURATION = 30000; // 30 seconds

class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

const withTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number = TIMEOUT_DURATION
): Promise<T> => {
  let timeoutId: NodeJS.Timeout | undefined;
  
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new TimeoutError('Request timed out'));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    if (timeoutId) clearTimeout(timeoutId);
    return result;
  } catch (error) {
    if (timeoutId) clearTimeout(timeoutId);
    if (error instanceof Error) {
      if (error.name === 'TimeoutError') {
        throw error;
      }
      // Handle network errors
      if (
        error.message.includes('network') ||
        error.message.includes('connection') ||
        error.message.includes('offline')
      ) {
        throw new NetworkError('Network request failed');
      }
    }
    throw error;
  }
};

export const PlantService = {
  async getPlants(): Promise<Plant[]> {
    try {
      const response = await withTimeout(
        fetch('https://api.plantai.com/plants')
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const plants = await response.json();
      return plants;
    } catch (error) {
      if (error instanceof Error) {
        // Preserve timeout and network errors
        if (error.name === 'TimeoutError' || error.name === 'NetworkError') {
          throw error;
        }
      }
      throw new Error('Failed to fetch plants');
    }
  },

  async getCategories(): Promise<string[]> {
    try {
      const response = await withTimeout(
        fetch('https://api.plantai.com/categories')
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const categories = await response.json();
      return categories;
    } catch (error) {
      if (error instanceof Error) {
        // Preserve timeout and network errors
        if (error.name === 'TimeoutError' || error.name === 'NetworkError') {
          throw error;
        }
      }
      throw new Error('Failed to fetch categories');
    }
  },

  async getById(id: string): Promise<Plant> {
    try {
      const response = await withTimeout(
        fetch(`https://api.plantai.com/plants/${id}`)
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const plant = await response.json();
      return plant;
    } catch (error) {
      if (error instanceof Error) {
        // Preserve timeout and network errors
        if (error.name === 'TimeoutError' || error.name === 'NetworkError') {
          throw error;
        }
      }
      throw new Error(`Failed to fetch plant with id: ${id}`);
    }
  },
}; 