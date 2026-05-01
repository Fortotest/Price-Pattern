'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating candlestick chart data based on structured market parameters.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CandlestickSchema = z.object({
  open: z.number().describe("The opening price."),
  high: z.number().describe("The highest price."),
  low: z.number().describe("The lowest price."),
  close: z.number().describe("The closing price."),
  offsetY: z.number().optional().describe("A vertical offset for the candle."),
});

const GeneratePatternInputSchema = z.object({
  count: z.number().min(2).max(200).describe("Number of candlesticks to generate."),
  pattern: z.enum(['Bullish Trend', 'Bearish Trend', 'Double Top', 'Double Bottom', 'Sideways']).describe("The market structure pattern."),
  volatility: z.number().min(0.1).max(2.0).describe("The noise/volatility level (0.1 to 2.0)."),
  description: z.string().optional().describe("Additional optional context."),
});
export type GeneratePatternInput = z.infer<typeof GeneratePatternInputSchema>;

const GeneratePatternOutputSchema = z.object({
  candlesticks: z.array(CandlestickSchema).describe("The generated array of candlestick data."),
});
export type GeneratePatternOutput = z.infer<typeof GeneratePatternOutputSchema>;

export async function generatePattern(input: GeneratePatternInput): Promise<GeneratePatternOutput> {
  return generatePatternFlow(input);
}

const generateCandlestickPatternPrompt = ai.definePrompt({
  name: 'generateCandlestickPatternPrompt',
  input: {schema: GeneratePatternInputSchema},
  output: {schema: GeneratePatternOutputSchema},
  prompt: `You are an expert financial analyst. Generate a sequence of exactly {{count}} candlesticks for a {{pattern}} market pattern.

Rules:
1. Volatility Level: {{volatility}}. Use this to scale the size of wicks and price fluctuations.
2. Continuity: The 'open' of candle N must equal the 'close' of candle N-1.
3. Pattern Accuracy: The overall sequence must clearly represent a {{pattern}}. 
   - Bullish Trend: Higher highs and higher lows.
   - Bearish Trend: Lower highs and lower lows.
   - Double Top: Two prominent peaks at similar price levels.
   - Double Bottom: Two prominent troughs at similar price levels.
   - Sideways: Price oscillating within a tight range.
4. Scale: Use a price range around 100-500.

Output the data as a JSON array of candlesticks with open, high, low, and close values.`,
});

const generatePatternFlow = ai.defineFlow(
  {
    name: 'generatePatternFlow',
    inputSchema: GeneratePatternInputSchema,
    outputSchema: GeneratePatternOutputSchema,
  },
  async (input) => {
    const {output} = await generateCandlestickPatternPrompt(input);
    if (!output) {
      throw new Error("Failed to generate candlestick pattern data.");
    }
    return output;
  }
);
