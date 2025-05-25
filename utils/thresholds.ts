export interface HeightRange {
  min: number;
  max: number;
}

export interface SafeRanges {
  ph: [number, number];
  ec: [number, number];
  temperature: [number, number];
  heightCm: HeightRange[];
}

export const SAFE_RANGES: SafeRanges = {
  ph: [5.5, 6.5],
  ec: [1.2, 2.4],
  temperature: [20, 25],
  heightCm: [
    { min: 0, max: 10 },    // Seedling stage
    { min: 10, max: 20 },   // Early growth
    { min: 20, max: 30 },   // Vegetative stage
    { min: 30, max: 50 },   // Flowering stage
    { min: 50, max: 100 },  // Mature stage
  ],
};

export function isWithinRange(value: number, range: [number, number] | HeightRange): boolean {
  if (Array.isArray(range)) {
    return value >= range[0] && value <= range[1];
  }
  return value >= range.min && value <= range.max;
}

export function getHeightRange(height: number): HeightRange {
  return SAFE_RANGES.heightCm.find(range => 
    height >= range.min && height <= range.max
  ) || SAFE_RANGES.heightCm[SAFE_RANGES.heightCm.length - 1];
} 