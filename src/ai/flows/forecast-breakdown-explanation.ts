'use server';
/**
 * @fileOverview A GenAI tool that explains, in natural language, how buoy data, bathymetrics,
 * meteorological conditions, and tide tables contribute to a specific wave forecast.
 *
 * - explainWaveForecast - A function that handles the wave forecast explanation process.
 * - ForecastBreakdownExplanationInput - The input type for the explainWaveForecast function.
 * - ForecastBreakdownExplanationOutput - The return type for the explainWaveForecast function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ForecastBreakdownExplanationInputSchema = z.object({
  buoyData: z.string().describe('Detailed buoy data relevant to the forecast area.'),
  bathymetrics: z.string().describe('Information about the underwater topography of the forecast area.'),
  meteorologicalConditions: z.string().describe('Current and forecasted meteorological conditions (e.g., wind speed, direction, atmospheric pressure).'),
  tideTables: z.string().describe('Relevant tide table information for the forecast period and location.'),
  waveForecast: z.string().describe('The specific wave forecast (e.g., wave height, period, direction) to be explained.'),
});
export type ForecastBreakdownExplanationInput = z.infer<typeof ForecastBreakdownExplanationInputSchema>;

const ForecastBreakdownExplanationOutputSchema = z.object({
  explanation: z.string().describe('A natural language explanation of how the provided data contributes to the wave forecast.'),
});
export type ForecastBreakdownExplanationOutput = z.infer<typeof ForecastBreakdownExplanationOutputSchema>;

export async function explainWaveForecast(
  input: ForecastBreakdownExplanationInput
): Promise<ForecastBreakdownExplanationOutput> {
  return forecastBreakdownExplanationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'forecastBreakdownExplanationPrompt',
  input: {schema: ForecastBreakdownExplanationInputSchema},
  output: {schema: ForecastBreakdownExplanationOutputSchema},
  prompt: `You are an expert oceanographer and meteorologist. Your task is to explain, in natural language, how various data points contribute to a specific wave forecast.

Provide a clear, concise, and insightful explanation. Focus on the interplay between the different factors and how they collectively shape the final wave prediction.

--- Input Data ---
Buoy Data: {{{buoyData}}}
Bathymetrics: {{{bathymetrics}}}
Meteorological Conditions: {{{meteorologicalConditions}}}
Tide Tables: {{{tideTables}}}

--- Wave Forecast to Explain ---
Wave Forecast: {{{waveForecast}}}

---
Based on the input data, explain how these factors contribute to the provided wave forecast.`,
});

const forecastBreakdownExplanationFlow = ai.defineFlow(
  {
    name: 'forecastBreakdownExplanationFlow',
    inputSchema: ForecastBreakdownExplanationInputSchema,
    outputSchema: ForecastBreakdownExplanationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
