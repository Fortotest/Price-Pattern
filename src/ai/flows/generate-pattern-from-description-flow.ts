'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating candlestick chart data based on a natural language description.
 *
 * - generatePatternFromDescription - A function that takes a market scenario description and returns candlestick data.
 * - GeneratePatternFromDescriptionInput - The input type for the generatePatternFromDescription function.
 * - GeneratePatternFromDescriptionOutput - The return type for the generatePatternFromDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CandlestickSchema = z.object({
  open: z.number().min(0).describe("The opening price of the candlestick. Must be a non-negative number."),
  high: z.number().min(0).describe("The highest price of the candlestick. Must be greater than or equal to open, close, and low."),
  low: z.number().min(0).describe("The lowest price of the candlestick. Must be less than or equal to open, close, and high."),
  close: z.number().min(0).describe("The closing price of the candlestick. Must be a non-negative number."),
}).describe("Represents a single candlestick with Open, High, Low, and Close prices.");

const GeneratePatternFromDescriptionInputSchema = z.object({
  description: z.string().describe("A natural language description of a market scenario or candlestick pattern."),
});
export type GeneratePatternFromDescriptionInput = z.infer<typeof GeneratePatternFromDescriptionInputSchema>;

const GeneratePatternFromDescriptionOutputSchema = z.object({
  candlesticks: z.array(CandlestickSchema).describe("An array of candlestick data, representing the described market pattern."),
});
export type GeneratePatternFromDescriptionOutput = z.infer<typeof GeneratePatternFromDescriptionOutputSchema>;

export async function generatePatternFromDescription(input: GeneratePatternFromDescriptionInput): Promise<GeneratePatternFromDescriptionOutput> {
  return generatePatternFromDescriptionFlow(input);
}

const generateCandlestickPatternPrompt = ai.definePrompt({
  name: 'generateCandlestickPatternPrompt',
  input: {schema: GeneratePatternFromDescriptionInputSchema},
  output: {schema: GeneratePatternFromDescriptionOutputSchema},
  prompt: `You are an expert financial analyst assistant. Your task is to generate a realistic sequence of candlestick data based on a user's natural language description of a market scenario or pattern.

Each candlestick in the sequence must follow these rules:
1.  **OHLC Consistency**: 'low' must be less than or equal to 'open' and 'close', and 'high' must be greater than or equal to 'open' and 'close'.
2.  **Auto-Snap**: For all candlesticks after the first one, the 'open' price of the current candlestick MUST be exactly equal to the 'close' price of the IMMEDIATELY preceding candlestick. This ensures a continuous price action without unnatural gaps.
3.  **Realism**: The generated OHLC values should reflect a plausible market movement for the described pattern.
4.  **Quantity**: Generate a sufficient number of candlesticks (typically between 10 to 30 candles) to clearly represent the described pattern or market scenario.

Generate the candlestick data in a JSON array format, where each object has 'open', 'high', 'low', and 'close' numerical values.

Market Scenario Description: {{{description}}}`,
});

const generatePatternFromDescriptionFlow = ai.defineFlow(
  {
    name: 'generatePatternFromDescriptionFlow',
    inputSchema: GeneratePatternFromDescriptionInputSchema,
    outputSchema: GeneratePatternFromDescriptionOutputSchema,
  },
  async (input) => {
    const {output} = await generateCandlestickPatternPrompt(input);
    if (!output) {
      throw new Error("Failed to generate candlestick pattern data.");
    }
    return output;
  }
);
