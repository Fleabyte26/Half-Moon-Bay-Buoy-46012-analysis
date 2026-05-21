export type OceanLocation = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  description: string;
  bathymetryInfo: string;
  stationId: string;
  historicalTrends: string;
};

export const locations: OceanLocation[] = [
  {
    id: 'half-moon-bay',
    name: 'Half Moon Bay, CA',
    lat: 37.363,
    lng: -122.881,
    description: 'Home to Mavericks, where deep-water swells meet a unique reef ledge.',
    bathymetryInfo: 'A sudden rise from the deep Half Moon Bay bowl onto a shallow rocky reef.',
    stationId: '46012',
    historicalTrends: 'Historical analysis of Buoy 46012 shows that WNW swells (285-300°) with periods > 15s produce the most consistent high-quality sessions. Data from 1984-2024 indicates a 85% correlation between these conditions and waves over 4m at the reef.'
  },
  {
    id: 'rincon',
    name: 'Rincon, California',
    lat: 34.373,
    lng: -119.476,
    description: 'The "Queen of the Coast," a world-class right-hand point break.',
    bathymetryInfo: 'A perfect cobblestone point that wraps swells along the shoreline.',
    stationId: '46053',
    historicalTrends: 'Rincon thrives on long-period W swells. GitHub analysis identifies a "Magic Window" when low tide coincides with W swells at 13s+. Correlation with NW winds is negative; optimal sessions require NE/E winds.'
  },
  {
    id: 'malibu',
    name: 'Malibu, California',
    lat: 34.0259,
    lng: -118.7798,
    description: 'South-facing point break known for its long, peeling waves.',
    bathymetryInfo: 'Shallow cobblestone point with a gradual slope.',
    stationId: '46221',
    historicalTrends: 'S/SW swells are the primary driver. Analysis shows that 180-200° swells under 3m at 12s create the longest "rideable" peeling waves historically.'
  },
  {
    id: 'nazare',
    name: 'Nazaré, Portugal',
    lat: 39.6012,
    lng: -9.0703,
    description: 'Home to the world\'s largest waves.',
    bathymetryInfo: 'The Nazaré Canyon funnels swells directly towards Praia do Norte.',
    stationId: '06209',
    historicalTrends: 'The canyon effect magnifies W swells by 3x. Analysis suggests a high probability of "Giant" status when swell period exceeds 17s.'
  }
];

export const generateHistoricalData = (stationId: string) => {
  const baseHeight = stationId === '46012' ? 2.5 : 1.2;
  const variance = stationId === '46012' ? 10 : 4;
  
  return Array.from({ length: 40 }, (_, i) => ({
    year: 1984 + i,
    avgWaveHeight: baseHeight + Math.random() * 1.5,
    maxWaveHeight: baseHeight * 2 + Math.random() * variance,
    temp: 14 + Math.random() * 8,
    stormFreq: Math.floor(Math.random() * 12)
  }));
};

export const currentForecastByStation: Record<string, any> = {
  '46012': {
    waveHeight: '3.2m',
    period: '16s',
    direction: 'W (280°)',
    wind: '12kts (NW)',
    waterTemp: '13.5°C',
    tide: 'Ebbing (Low at 11:15 AM)',
    buoyData: 'Station 46012 - Significant wave height: 3.1m, Peak period: 17s.',
    meteorologicalConditions: 'Partly cloudy, moderate NW winds.',
    tideTableSummary: 'High tide: 05:12 AM (1.8m), Low tide: 11:15 AM (0.1m)'
  },
  '46053': {
    waveHeight: '1.5m',
    period: '12s',
    direction: 'WNW (295°)',
    wind: '5kts (N)',
    waterTemp: '16.0°C',
    tide: 'Rising (High at 2:10 PM)',
    buoyData: 'Station 46053 - Significant wave height: 1.4m, Peak period: 13s.',
    meteorologicalConditions: 'Clear sunny skies.',
    tideTableSummary: 'Low tide: 07:45 AM (0.3m), High tide: 02:10 PM (1.5m)'
  },
  'default': {
    waveHeight: '1.8m',
    period: '12s',
    direction: 'WNW (290°)',
    wind: '8kts (NE)',
    waterTemp: '16.5°C',
    tide: 'Rising (High at 2:45 PM)',
    buoyData: 'Significant wave height: 1.7m, Peak period: 13s.',
    meteorologicalConditions: 'Clear skies.',
    tideTableSummary: 'Low tide: 08:32 AM (0.2m), High tide: 02:45 PM (1.6m)'
  }
};
