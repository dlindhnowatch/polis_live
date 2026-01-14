import regionsData from '@/data/regions-cities.json';

interface CityToRegion {
  [cityName: string]: string;
}

interface RegionData {
  cityToRegion: CityToRegion;
  regionToCities: { [region: string]: string[] };
  metadata: {
    totalCities: number;
    totalRegions: number;
    generatedAt: string;
    source: string;
  };
}

const data: RegionData = regionsData;

export function getRegionForLocation(locationName: string): string | null {
  const normalizedLocation = normalizeLocationName(locationName);
  
  // Direct match
  if (data.cityToRegion[normalizedLocation]) {
    return data.cityToRegion[normalizedLocation];
  }
  
  // Try to find matches with individual words
  const locationWords = normalizedLocation.split(/[\s,\-\/]+/).filter(word => word.length > 2);
  
  for (const [city, region] of Object.entries(data.cityToRegion)) {
    const cityWords = city.split(/[\s,\-\/]+/);
    
    // Check if any significant word from location matches city exactly
    const hasExactWordMatch = locationWords.some(locWord => 
      cityWords.some(cityWord => 
        locWord === cityWord || cityWord === locWord
      )
    );
    
    if (hasExactWordMatch) {
      return region;
    }
  }
  
  // Fallback: partial matches for longer words
  for (const [city, region] of Object.entries(data.cityToRegion)) {
    const cityWords = city.split(/[\s,\-\/]+/);
    
    const hasPartialMatch = locationWords.some(locWord => 
      locWord.length > 4 && cityWords.some(cityWord => 
        cityWord.length > 4 && (
          cityWord.includes(locWord) || 
          locWord.includes(cityWord) ||
          // Handle common Swedish endings
          (cityWord.endsWith('stad') && locWord === cityWord.replace('stad', '')) ||
          (cityWord.endsWith('borg') && locWord === cityWord.replace('borg', '')) ||
          (cityWord.endsWith('köping') && locWord === cityWord.replace('köping', ''))
        )
      )
    );
    
    if (hasPartialMatch) {
      return region;
    }
  }
  
  return null;
}

export function getCitiesForRegion(regionName: string): string[] {
  return data.regionToCities[regionName] || [];
}

export function getAllRegionsWithData(): string[] {
  return Object.keys(data.regionToCities);
}

export function getRegionMappingStats() {
  return data.metadata;
}

function normalizeLocationName(location: string): string {
  return location
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
    // Remove common prefixes/suffixes that might vary
    .replace(/^(kommun|stad|kommundel|stadsdel)\s+/, '')
    .replace(/\s+(kommun|stad|kommundel|stadsdel)$/, '')
    // Remove administrative suffixes
    .replace(/\s+(kommun|stad|borg|köping|hamn)$/, '')
    // Handle highway designations
    .replace(/\s+(E\d+|RV\d+|länsväg\s+\d+|riksväg\s+\d+).*$/, '')
    // Remove coordinates or other metadata
    .replace(/\([^)]*\)/, '')
    .trim();
}