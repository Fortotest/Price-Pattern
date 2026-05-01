'use server';
/**
 * @fileOverview A Genkit flow for refining candlestick patterns using AI.
 *
 * - refinePatternWithAI - A function that refines a given candlestick pattern.
 * - RefinePatternWithAIInput - The input type for the refinePatternWithAI function.
 * - RefinePatternWithAIOutput - The return type for the refinePatternWithAI function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CandlestickSchema = z.object({
  open: z.number().min(0).describe("The opening price."),
  high: z.number().min(0).describe("The highest price."),
  low: z.number().min(0).describe("The lowest price."),
  close: z.number().min(0).describe("The closing price."),
}).describe("Represents a single candlestick with Open, High, Low, and Close prices.");

const RefinePatternWithAIInputSchema = z.object({
  patternDescription: z.string().optional().describe('Context for refinement.'),
  candlesticks: z.array(CandlestickSchema).min(1).describe('The pattern to be refined.'),
});
export type RefinePatternWithAIInput = z.infer<typeof RefinePatternWithAIInputSchema>;

const RefinePatternWithAIOutputSchema = z.object({
  refinedCandlesticks: z.array(CandlestickSchema).min(1).describe('The refined array of candlesticks.'),
});
export type RefinePatternWithAIOutput = z.infer<typeof RefinePatternWithAIOutputSchema>;

export async function refinePatternWithAI(input: RefinePatternWithAIInput): Promise<RefinePatternWithAIOutput> {
  return refinePatternWithAIFlow(input);
}

const refinePatternPrompt = ai.definePrompt({
  name: 'refinePatternPrompt',
  input: { schema: RefinePatternWithAIInputSchema },
  output: { schema: RefinePatternWithAIOutputSchema },
  prompt: `You are an expert financial market analyst. Your task is to take a given candlestick pattern and subtly adjust its parameters to make it appear more realistic and dynamic for educational purposes.

Rules:
1. **Maintain Continuity**: For each candle (except the first), the 'open' price MUST equal the 'close' price of the previous candle.
2. **Subtle Variations**: Adjust wicks (high/low) and bodies (open/close) to add realistic "noise" and price action nuance.
3. **Preserve Intent**: Keep the general trend and shape of the input pattern.
4. **OHLC Consistency**: Ensure 'high' is always the maximum and 'low' is the minimum for each candle.

Input Context: {{{patternDescription}}}

Input Candlesticks (OHLC):
{{#each candlesticks}}
  Candle {{ @index }}: O:{{this.open}}, H:{{this.high}}, L:{{this.low}}, C:{{this.close}}
{{/each}}
`,
});

const refinePatternWithAIFlow = ai.defineFlow(
  {
    name: 'refinePatternWithAIFlow',
    inputSchema: RefinePatternWithAIInputSchema,
    outputSchema: RefinePatternWithAIOutputSchema,
  },
  async (input) => {
    const { output } = await refinePatternPrompt(input);
    if (!output) {
      throw new Error('Failed to refine candlestick pattern.');
    }
    return output;
  }
);
