import * as XLSX from 'xlsx';

interface CityToRegion {
  [cityName: string]: string;
}

interface RegionData {
  regionName: string;
  cities: string[];
}

let cityToRegionMapping: CityToRegion | null = null;
let regionToCitiesMapping: { [region: string]: string[] } | null = null;

export async function loadRegionsAndCities(): Promise<{ cityToRegion: CityToRegion; regionToCities: { [region: string]: string[] } }> {
  if (cityToRegionMapping && regionToCitiesMapping) {
    return { cityToRegion: cityToRegionMapping, regionToCities: regionToCitiesMapping };
  }

  try {
    let fileBuffer: ArrayBuffer;
    
    // Check if we're running in Node.js environment (server-side)
    if (typeof window === 'undefined') {
      // Server-side: use Node.js fs
      const { readFileSync } = await import('fs');
      const path = await import('path');
      const filePath = path.join(process.cwd(), 'data', 'stader_lan.xlsx');
      const buffer = readFileSync(filePath);
      fileBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    } else {
      // Client-side: fetch the file
      const response = await fetch('/stader_lan.xlsx');
      if (!response.ok) {
        throw new Error('Failed to fetch Excel file');
      }
      fileBuffer = await response.arrayBuffer();
    }
    
    const workbook = XLSX.read(fileBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert sheet to JSON
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
    
    const cityToRegion: CityToRegion = {};
    const regionToCities: { [region: string]: string[] } = {};
    
    let currentRegion = '';
    
    // Parse the hierarchical structure: län followed by kommuner
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (row.length >= 2) {
        const code = row[0]?.toString().trim();
        const name = row[1]?.toString().trim();
        
        if (code && name) {
          // Check if this is a län (2-digit code)
          if (code.match(/^\d{2}$/)) {
            currentRegion = normalizeRegionName(name);
            if (!regionToCities[currentRegion]) {
              regionToCities[currentRegion] = [];
            }
          }
          // Check if this is a kommun (4-digit code) and we have a current region
          else if (code.match(/^\d{4}$/) && currentRegion) {
            const normalizedCity = normalizeLocationName(name);
            cityToRegion[normalizedCity] = currentRegion;
            
            if (!regionToCities[currentRegion].includes(normalizedCity)) {
              regionToCities[currentRegion].push(normalizedCity);
            }
          }
        }
      }
    }
    
    cityToRegionMapping = cityToRegion;
    regionToCitiesMapping = regionToCities;
    
    console.log(`Loaded ${Object.keys(cityToRegion).length} cities across ${Object.keys(regionToCities).length} regions`);
    
    return { cityToRegion, regionToCities };
  } catch (error) {
    console.error('Error loading regions and cities data:', error);
    // Return empty mappings if file can't be loaded
    return { cityToRegion: {}, regionToCities: {} };
  }
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

function normalizeRegionName(region: string): string {
  // Normalize region names to match our existing SWEDISH_REGIONS array
  const regionMapping: { [key: string]: string } = {
    'stockholms län': 'Stockholm',
    'uppsala län': 'Uppsala', 
    'södermanlands län': 'Södermanland',
    'östergötlands län': 'Östergötland',
    'jönköpings län': 'Jönköping',
    'kronobergs län': 'Kronoberg',
    'kalmar län': 'Kalmar',
    'gotlands län': 'Gotland',
    'blekinge län': 'Blekinge',
    'skåne län': 'Skåne',
    'hallands län': 'Halland',
    'västra götalands län': 'Västra Götaland',
    'värmlands län': 'Värmland',
    'örebro län': 'Örebro',
    'västmanlands län': 'Västmanland',
    'dalarnas län': 'Dalarna',
    'gävleborgs län': 'Gävleborg',
    'västernorrlands län': 'Västernorrland',
    'jämtlands län': 'Jämtland',
    'västerbottens län': 'Västerbotten',
    'norrbottens län': 'Norrbotten',
    
    // Also handle variations without "län"
    'stockholm': 'Stockholm',
    'uppsala': 'Uppsala',
    'södermanland': 'Södermanland',
    'östergötland': 'Östergötland',
    'jönköping': 'Jönköping',
    'kronoberg': 'Kronoberg',
    'kalmar': 'Kalmar',
    'gotland': 'Gotland',
    'blekinge': 'Blekinge',
    'skåne': 'Skåne',
    'halland': 'Halland',
    'västra götaland': 'Västra Götaland',
    'värmland': 'Värmland',
    'örebro': 'Örebro',
    'västmanland': 'Västmanland',
    'dalarna': 'Dalarna',
    'gävleborg': 'Gävleborg',
    'västernorrland': 'Västernorrland',
    'jämtland': 'Jämtland',
    'västerbotten': 'Västerbotten',
    'norrbotten': 'Norrbotten',
  };
  
  const normalized = region.toLowerCase().trim();
  return regionMapping[normalized] || region;
}

export async function getRegionForLocation(locationName: string): Promise<string | null> {
  const { cityToRegion } = await loadRegionsAndCities();
  
  const normalizedLocation = normalizeLocationName(locationName);
  
  // Direct match
  if (cityToRegion[normalizedLocation]) {
    return cityToRegion[normalizedLocation];
  }
  
  // Try to find matches with individual words
  const locationWords = normalizedLocation.split(/[\s,\-\/]+/).filter(word => word.length > 2);
  
  for (const [city, region] of Object.entries(cityToRegion)) {
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
  for (const [city, region] of Object.entries(cityToRegion)) {
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

export async function getCitiesForRegion(regionName: string): Promise<string[]> {
  const { regionToCities } = await loadRegionsAndCities();
  return regionToCities[regionName] || [];
}

export async function getAllRegionsWithData(): Promise<string[]> {
  const { regionToCities } = await loadRegionsAndCities();
  return Object.keys(regionToCities);
}