'use server';
/**
 * @fileOverview A predictive AI agent that builds a multi-day session itinerary 
 * based on 40-year historical buoy trends, bathymetrics, and tidal data.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TripPlannerInputSchema = z.object({
  location: z.string().describe('The destination for the trip (e.g., "North Shore, Hawaii").'),
  startDate: z.string().describe('ISO date string for trip start.'),
  endDate: z.string().describe('ISO date string for trip end.'),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced', 'pro']).default('advanced'),
  historicalContext: z.string().optional().describe('Historical buoy analysis to correlate against.'),
});

const TripDaySchema = z.object({
  date: z.string(),
  probabilityScore: z.number().min(0).max(100),
  morningSession: z.string(),
  afternoonSession: z.string(),
  reasoning: z.string(),
  tideContext: z.string().describe('Tidal influence prediction (e.g., "Best on incoming mid-tide").'),
  historicalMatch: z.string().describe('How this day matches specific historical peak signatures.'),
});

const TripPlannerOutputSchema = z.object({
  summary: z.string(),
  days: z.array(TripDaySchema),
  overallConfidence: z.string(),
  gearRecommendation: z.string(),
  historicalPredictorSummary: z.string().describe('Overall summary of how historical data influenced this trip prediction.'),
});

export async function planTrip(input: z.infer<typeof TripPlannerInputSchema>) {
  return tripPlannerFlow(input);
}

const tripPlannerFlow = ai.defineFlow(
  {
    name: 'tripPlannerFlow',
    inputSchema: TripPlannerInputSchema,
    outputSchema: TripPlannerOutputSchema,
  },
  async (input) => {
    const prompt = await ai.generate({
      prompt: `You are an Advanced Marine ML Expedition Planner. Build a detailed session itinerary for ${input.location} from ${input.startDate} to ${input.endDate}.
      
      --- HISTORICAL PREDICTOR CONTEXT ---
      {{{historicalContext}}}
      
      --- TASK ---
      1. Correlate the trip dates with 40-year climatological patterns for ${input.location}.
      2. Factor in bathymetric reef ledge influence on forecasted swell angles.
      3. Use your internal knowledge of tide tables for this region.
      4. Specifically use the provided historical trends to weight the "probabilityScore".
      
      Provide a day-by-day breakdown for an ${input.experienceLevel} user.
      Return the response in the specified JSON format.`,
      config: { responseMimeType: 'application/json' }
    });

    return prompt.output as any;
  }
);
