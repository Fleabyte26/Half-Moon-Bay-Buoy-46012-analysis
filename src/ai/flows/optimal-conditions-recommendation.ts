'use server';
/**
 * @fileOverview This file provides an AI agent for recommending optimal times and locations
 * for various water activities based on comprehensive marine data.
 *
 * - optimalConditionsRecommendation - A function that handles the recommendation process.
 * - OptimalConditionsRecommendationInput - The input type for the optimalConditionsRecommendation function.
 * - OptimalConditionsRecommendationOutput - The return type for the optimalConditionsRecommendation function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const OptimalConditionsRecommendationInputSchema = z.object({
  preferredActivity: z.string().describe('The user\'s preferred water activity (e.g., "calm sailing", "beginner surfing conditions").'),
  forecastPeriod: z.string().describe('The duration of the forecast period (e.g., "next 7 days", "next 24 hours").'),
  currentLocation: z.string().describe('The general area or specific location for which the forecast data is relevant (e.g., "Malibu, California", "North Atlantic").'),
  buoyDataSummary: z.string().describe('A summary of buoy data relevant to the forecast period and location, including wave height, period, and direction.'),
  bathymetricsSummary: z.string().describe('A summary of bathymetric data (underwater depth and terrain) for the relevant area.'),
  meteorologicalConditionsSummary: z.string().describe('A summary of meteorological conditions, including wind speed, direction, and any significant weather patterns.'),
  tideTablesSummary: z.string().describe('A summary of tide tables, indicating high and low tides and their timings.'),
});
export type OptimalConditionsRecommendationInput = z.infer<typeof OptimalConditionsRecommendationInputSchema>;

const OptimalConditionsRecommendationOutputSchema = z.object({
  recommendations: z.array(z.object({
    location: z.string().describe('A specific location or area within the forecast region.'),
    time: z.string().describe('The optimal time slot for the activity at this location (e.g., "Tomorrow, 10 AM - 2 PM", "Wednesday afternoon").'),
    reasoning: z.string().describe('A detailed explanation of why this time and location are optimal based on the provided data and preferred activity.'),
  })).describe('A list of optimal times and locations for the user\'s preferred activity.'),
  generalAdvice: z.string().describe('General advice or considerations for planning the activity based on overall conditions.'),
});
export type OptimalConditionsRecommendationOutput = z.infer<typeof OptimalConditionsRecommendationOutputSchema>;

export async function optimalConditionsRecommendation(input: OptimalConditionsRecommendationInput): Promise<OptimalConditionsRecommendationOutput> {
  return optimalConditionsRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimalConditionsRecommendationPrompt',
  input: { schema: OptimalConditionsRecommendationInputSchema },
  output: { schema: OptimalConditionsRecommendationOutputSchema },
  prompt: `You are an expert marine activity planner and forecaster. Your goal is to provide optimal recommendations for water activities based on a comprehensive analysis of marine data.

The user wants to plan for: "{{{preferredActivity}}}" within the "{{{forecastPeriod}}}" forecast period, for the general area of "{{{currentLocation}}}".

Here is the summarized data for your analysis:

---
**Buoy Data Summary:**
{{{buoyDataSummary}}}

---
**Bathymetrics Summary:**
{{{bathymetricsSummary}}}

---
**Meteorological Conditions Summary:**
{{{meteorologicalConditionsSummary}}}

---
**Tide Tables Summary:**
{{{tideTablesSummary}}}
---

Analyze all the provided data and the user's preferred activity. Identify specific times and locations that are most suitable for "{{{preferredActivity}}}". For each recommendation, provide a clear reasoning based on the buoy data, bathymetrics, meteorological conditions, and tide tables.

Also, provide some general advice or considerations based on the overall conditions for planning "{{{preferredActivity}}}".

Ensure your response is structured in the JSON format described in the output schema.`,
});

const optimalConditionsRecommendationFlow = ai.defineFlow(
  {
    name: 'optimalConditionsRecommendationFlow',
    inputSchema: OptimalConditionsRecommendationInputSchema,
    outputSchema: OptimalConditionsRecommendationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
