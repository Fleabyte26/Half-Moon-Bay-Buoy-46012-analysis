
'use server';

/**
 * @fileOverview Gemini Agent that resolves natural language locations to NOAA station IDs 
 * and processes raw data into Firestore "Big Table" entries.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { fetchBuoyAnalysis } from '@/lib/github-service';
import { fetchNoaaRealtimeData } from '@/lib/noaa-service';

const EnquiryInputSchema = z.object({
  query: z.string().describe('A natural language location (e.g., "Mavericks") or a specific NOAA station ID.'),
  source: z.enum(['github', 'noaa']).default('noaa'),
});

const EnquiryOutputSchema = z.object({
  status: z.enum(['success', 'failed']),
  message: z.string(),
  resolvedStation: z.object({
    id: z.string(),
    name: z.string(),
    lat: z.number().optional(),
    lng: z.number().optional(),
  }).optional(),
  stationInfo: z.object({
    id: z.string(),
    lastReading: z.string().optional(),
    waveHeight: z.string().optional(),
  }).optional(),
});

export async function runEnquiryAgent(input: z.infer<typeof EnquiryInputSchema>) {
  return enquiryFlow(input);
}

const enquiryFlow = ai.defineFlow(
  {
    name: 'enquiryFlow',
    inputSchema: EnquiryInputSchema,
    outputSchema: EnquiryOutputSchema,
  },
  async (input) => {
    // 1. Resolve Query to Station ID using Gemini's world knowledge
    const resolution = await ai.generate({
      prompt: `You are a Marine Geospatial Expert. Convert the following query into a specific NOAA NDBC Buoy Station ID. 
      - If it's a name like "Mavericks", "North Shore", or "Rincon", find the primary swell-gathering buoy for that location.
      - If it's a 5-digit ID, verify its validity.
      
      Query: "${input.query}"
      
      Return JSON:
      {
        "stationId": "string",
        "commonName": "string",
        "lat": number,
        "lng": number,
        "confidence": number (0-1)
      }`,
      config: { responseMimeType: 'application/json' }
    });

    const resolved = resolution.output as any;
    const stationId = resolved?.stationId;

    if (!stationId) {
      return { status: 'failed', message: `The agent could not resolve "${input.query}" to a valid buoy station.` };
    }

    let rawData: string | null = null;
    let error: string | null = null;

    // 2. Fetch data from requested source (Historical GitHub or Live NOAA)
    if (input.source === 'github') {
      const gh = await fetchBuoyAnalysis(stationId);
      rawData = gh.data;
      error = gh.error;
    } else {
      const noaa = await fetchNoaaRealtimeData(stationId);
      rawData = noaa.data;
      error = noaa.error;
    }
    
    if (error || !rawData) {
      return { 
        status: 'failed', 
        message: error || `No data found for ${resolved.commonName} (${stationId})`,
        resolvedStation: { id: stationId, name: resolved.commonName, lat: resolved.lat, lng: resolved.lng }
      };
    }

    // 3. Use Gemini to parse and enrich the "Big Table" entry from raw text/CSV
    const analysis = await ai.generate({
      prompt: `Analyze this raw data excerpt for Station ${stationId} (${resolved.commonName}).
      
      Data (Source: ${input.source}): 
      ${rawData}
      
      Return a JSON object representing the most recent data point for ingestion into the Big Table:
      {
        "timestamp": "ISO format string",
        "waveHeight": number (in meters),
        "period": number (in seconds),
        "direction": number (in degrees),
        "status": "Short summary of conditions"
      }`,
      config: { responseMimeType: 'application/json' }
    });

    const parsed = analysis.output as any;

    return {
      status: 'success',
      message: `Enquiry complete. Big Table entry created for ${resolved.commonName} via ${input.source.toUpperCase()}.`,
      resolvedStation: {
        id: stationId,
        name: resolved.commonName,
        lat: resolved.lat,
        lng: resolved.lng
      },
      stationInfo: {
        id: stationId,
        lastReading: parsed?.timestamp,
        waveHeight: parsed?.waveHeight ? `${parsed.waveHeight}m` : 'N/A'
      }
    };
  }
);
