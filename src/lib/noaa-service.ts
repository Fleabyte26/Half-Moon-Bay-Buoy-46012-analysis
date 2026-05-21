
'use server';

/**
 * Service to interact with the NOAA National Data Buoy Center (NDBC) public data.
 */
export async function fetchNoaaRealtimeData(stationId: string) {
  // NOAA Real-time meteorological data path
  const url = `https://www.ndbc.noaa.gov/data/realtime2/${stationId}.txt`;
  
  try {
    const response = await fetch(url, {
      next: { revalidate: 1800 } // Cache for 30 mins
    });

    if (!response.ok) {
      return { 
        error: `Station ${stationId} not available on NOAA servers or currently offline.`,
        data: null 
      };
    }

    const text = await response.text();
    // Return a sample of the raw data for the agent to parse
    const lines = text.split('\n');
    const sample = lines.slice(0, 15).join('\n');
    
    return { data: sample, error: null };
  } catch (error: any) {
    return { error: error.message, data: null };
  }
}
