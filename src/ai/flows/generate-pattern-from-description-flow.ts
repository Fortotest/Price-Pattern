
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
  prompt: `You are an expert financial analyst. 

Task: Generate a sequence of EXACTLY {{count}} candlesticks for a {{pattern}} market pattern.

CRITICAL RULES:
1. ARRAY LENGTH: You MUST return exactly {{count}} objects in the 'candlesticks' array. No more, no less.
2. VOLATILITY: Level is {{volatility}}. High level means larger wicks and bigger price jumps.
3. CONTINUITY: The 'open' of candle N must equal the 'close' of candle N-1.
4. PATTERN LOGIC:
   - Double Bottom: The price must drop to a support level, rise, drop back to the SAME support level, and then rise strongly.
   - Bullish Trend: Overall trajectory is upward with higher highs and higher lows.
   - Bearish Trend: Overall trajectory is downward with lower highs and lower lows.
   - Double Top: Two peaks at roughly the same resistance level.
   - Sideways: Price stays within a horizontal channel.
5. SCALE: Start around price 300. Ensure all prices remain positive (>0).

Output as a structured JSON with a 'candlesticks' array containing objects with open, high, low, and close.`,
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
