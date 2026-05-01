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

// Define the schema for a single candlestick
const CandlestickSchema = z.object({
  type: z.enum(['Bullish', 'Bearish', 'Doji']).describe("Type of the candle: 'Bullish' (green), 'Bearish' (red), or 'Doji' (gray)."),
  body: z.number().min(0).describe('The thickness/length of the candle body. A larger value indicates a stronger price movement.'),
  wickTop: z.number().min(0).describe('The length of the upper wick (shadow). Represents the highest price reached above the body.'),
  wickBottom: z.number().min(0).describe('The length of the lower wick (shadow). Represents the lowest price reached below the body.'),
  offsetY: z.number().describe('The absolute Y-axis position of the candle on the chart. Influences the overall price level of the candle.'),
});

// Define the input schema for the flow, which is an array of candlesticks
const RefinePatternWithAIInputSchema = z.object({
  patternDescription: z.string().optional().describe('An optional natural language description of the market scenario or pattern, to guide the AI in making more realistic adjustments.'),
  candlesticks: z.array(CandlestickSchema).min(1).describe('An array of candlestick objects representing the pattern to be refined.'),
});
export type RefinePatternWithAIInput = z.infer<typeof RefinePatternWithAIInputSchema>;

// The output schema will be the refined array of candlesticks
const RefinePatternWithAIOutputSchema = z.object({
  refinedCandlesticks: z.array(CandlestickSchema).min(1).describe('The array of candlesticks with subtly adjusted parameters for more realistic and dynamic appearance.'),
});
export type RefinePatternWithAIOutput = z.infer<typeof RefinePatternWithAIOutputSchema>;

// Exported wrapper function
export async function refinePatternWithAI(input: RefinePatternWithAIInput): Promise<RefinePatternWithAIOutput> {
  return refinePatternWithAIFlow(input);
}

// Define the prompt for the AI model
const refinePatternPrompt = ai.definePrompt({
  name: 'refinePatternPrompt',
  input: { schema: RefinePatternWithAIInputSchema },
  output: { schema: RefinePatternWithAIOutputSchema },
  prompt: `You are an expert financial market analyst specializing in candlestick patterns. Your task is to take a given candlestick pattern and subtly adjust its parameters (body, wickTop, wickBottom, offsetY) to make it appear more realistic and dynamic, suitable for educational demonstrations.

Here's what each parameter represents:
- 'type': The type of candle ('Bullish' for rising price, 'Bearish' for falling price, 'Doji' for indecision). Do not change this unless explicitly instructed or if it contradicts the general trend implied by offsetY changes.
- 'body': The size of the candle's main body. A larger body indicates a stronger price movement. Subtly vary this to show market strength or weakness.
- 'wickTop': The length of the upper wick (shadow). Represents the highest price reached above the body. Vary this to add dynamism, showing price rejection or probing higher levels.
- 'wickBottom': The length of the lower wick (shadow). Represents the lowest price reached below the body. Representing price rejection or probing lower levels.
- 'offsetY': The absolute Y-axis position of the candle on the chart. This dictates the overall price level. Adjust this subtly to introduce natural price fluctuations while generally preserving the pattern's overall shape and trend. Ensure that 'offsetY' adjustments maintain a logical flow; for example, a Bullish candle should generally have a higher 'offsetY' range than the previous candle, and vice versa for Bearish candles, unless the pattern explicitly depicts a strong reversal. The actual Open/Close/High/Low values are implicitly determined by body, wicks, and offsetY.

Consider the following input pattern and optional description. Make only subtle adjustments to the 'body', 'wickTop', 'wickBottom', and 'offsetY' values to enhance realism and dynamism without distorting the core pattern. Ensure 'offsetY' adjustments are relative and keep the candles visually connected and logical within the overall trend. Provide the output in JSON format, strictly adhering to the RefinePatternWithAIOutputSchema.

Input Pattern Description: {{{patternDescription}}}

Input Candlesticks:
{{#each candlesticks}}
  Candle {{ @index }}: Type: {{this.type}}, Body: {{this.body}}, Wick Top: {{this.wickTop}}, Wick Bottom: {{this.wickBottom}}, Offset Y: {{this.offsetY}}
{{/each}}
`,
});

// Define the Genkit flow
const refinePatternWithAIFlow = ai.defineFlow(
  {
    name: 'refinePatternWithAIFlow',
    inputSchema: RefinePatternWithAIInputSchema,
    outputSchema: RefinePatternWithAIOutputSchema,
  },
  async (input) => {
    const { output } = await refinePatternPrompt(input);
    if (!output) {
      throw new Error('Failed to refine candlestick pattern: No output received from AI.');
    }
    return output;
  }
);
