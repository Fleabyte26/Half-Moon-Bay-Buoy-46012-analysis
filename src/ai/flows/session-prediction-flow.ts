'use server';
/**
 * @fileOverview A predictive AI agent that calculates the probability of a "Good Session"
 * by correlating current forecasts with 40 years of historical buoy data.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SessionPredictionInputSchema = z.object({
  locationName: z.string(),
  historicalTrends: z.string().describe('Summary of the 40-year historical analysis from GitHub repo (e.g., "SW swells over 2m at 14s historically produce 90th percentile waves here").'),
  currentForecast: z.object({
    height: z.string(),
    period: z.string(),
    direction: z.string(),
    wind: z.string(),
    tide: z.string(),
  }),
  activity: z.string().default('surfing'),
});

export type SessionPredictionInput = z.infer<typeof SessionPredictionInputSchema>;

const SessionPredictionOutputSchema = z.object({
  probabilityScore: z.number().min(0).max(100).describe('The calculated probability (0-100) of a high-quality session.'),
  confidenceLevel: z.string().describe('AI confidence based on data integrity and historical correlation strength.'),
  predictionSummary: z.string().describe('Technical explanation of how current conditions match historical "epic" windows.'),
  upcomingWindows: z.array(z.object({
    day: z.string(),
    score: z.number(),
    reason: z.string(),
  })).describe('7-day probability forecast.'),
});

export type SessionPredictionOutput = z.infer<typeof SessionPredictionOutputSchema>;

export async function predictSession(input: SessionPredictionInput): Promise<SessionPredictionOutput> {
  return sessionPredictionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'sessionPredictionPrompt',
  input: { schema: SessionPredictionInputSchema },
  output: { schema: SessionPredictionOutputSchema },
  prompt: `You are an Advanced Marine ML Predictor. Your task is to calculate the probability of a "Good Session" for {{activity}} at {{locationName}}.

--- HISTORICAL CORRELATIONS (From Analysis) ---
{{{historicalTrends}}}

--- CURRENT FORECAST ---
Height: {{currentForecast.height}}
Period: {{currentForecast.period}}
Direction: {{currentForecast.direction}}
Wind: {{currentForecast.wind}}
Tide: {{currentForecast.tide}}

--- ANALYSIS TASK ---
1. Compare current metrics to the historical "Best Days" identified in the analysis.
2. Calculate a Probability Score (0-100) representing how likely this is to be a top-tier session.
3. Provide a technical summary of the "Pattern Match" (e.g., "Matches the 1998 El Niño swell signature").
4. Forecast the next 7 days based on these correlations.

Return the result in the specified JSON format.`,
});

const sessionPredictionFlow = ai.defineFlow(
  {
    name: 'sessionPredictionFlow',
    inputSchema: SessionPredictionInputSchema,
    outputSchema: SessionPredictionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
