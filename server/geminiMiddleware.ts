import { GoogleGenAI } from '@google/genai';
import type { IncomingMessage, ServerResponse } from 'node:http';

export function createGeminiMiddleware() {
  return async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    // 1. Health & status check
    if (req.url === '/api/ai/status' && req.method === 'GET') {
      const serverKey = process.env.GEMINI_API_KEY;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        status: 'ok',
        hasKey: Boolean(serverKey && serverKey.trim().length > 0),
        model: 'gemini-3.8-flash',
        provider: 'Google Gemini API'
      }));
      return;
    }

    // 2. AI Plan Generation
    if (req.url === '/api/ai/generate-plan' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk;
      });

      req.on('end', async () => {
        try {
          const payload = JSON.parse(body);
          const clientHeaderKey = req.headers['x-gemini-api-key'] as string | undefined;
          const apiKey = clientHeaderKey || process.env.GEMINI_API_KEY;

          if (!apiKey || apiKey.trim().length === 0) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: false,
              isLiveAi: false,
              error: 'GEMINI_API_KEY_MISSING',
              message: 'Gemini API key is not configured. Add GEMINI_API_KEY to your .env file or enter your API key in Settings.'
            }));
            return;
          }

          const ai = new GoogleGenAI({ apiKey });

          const prompt = `You are an expert event planner and financial strategist.
Create a personalized, practical, and mathematically sound celebration plan based on the following specifications:
- Event Name: ${payload.name}
- Event Type: ${payload.type}
- Target Date: ${payload.date}
- Location: ${payload.location}
- Expected Guests: ${payload.guestCount} attendees
- Total Budget Ceiling: INR ₹${payload.totalBudget} (MUST NOT BE EXCEEDED)
- Venue Preference: ${payload.venuePreference}
- Theme / Notes: ${payload.theme || 'Standard'}
- Special Requirements: ${payload.notes || 'None'}

Return ONLY valid JSON matching this exact structure:
{
  "conceptSummary": "2-3 sentence concept overview",
  "strategicAdvice": ["3-4 actionable pieces of planner advice"],
  "budgetAllocations": [
    {
      "category": "venue" | "catering" | "decor" | "entertainment_av" | "photography" | "logistics" | "contingency" | "other",
      "name": "Specific line item name",
      "allocatedAmount": number,
      "priority": "essential" | "flexible" | "discretionary",
      "notes": "Brief explanation"
    }
  ],
  "milestones": [
    {
      "title": "Task title",
      "description": "Task detail",
      "category": "catering" | "venue" | "decor" | "entertainment_av" | "general",
      "priority": "high" | "medium" | "low",
      "dueDaysBeforeEvent": number
    }
  ],
  "contingencyScenarios": [
    {
      "trigger": "Disruption description",
      "backupPlan": "Specific mitigation strategy",
      "estimatedCostImpactINR": number
    }
  ]
}

CRITICAL RULES:
1. The sum of allocatedAmount across all budgetAllocations MUST be less than or equal to ${payload.totalBudget}.
2. Always include a non-zero contingency buffer allocation.
3. Keep line item prices realistic for Indian market conditions.`;

          const interaction = await ai.interactions.create({
            model: 'gemini-3.8-flash',
            input: prompt
          });

          const rawText = interaction.output_text || '';
          
          // Extract JSON from markdown fences if present
          let jsonText = rawText.trim();
          if (jsonText.startsWith('```json')) {
            jsonText = jsonText.replace(/^```json\s*/, '').replace(/```\s*$/, '');
          } else if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/^```\s*/, '').replace(/```\s*$/, '');
          }

          const parsed = JSON.parse(jsonText);

          // Strictly validate budget totals using application arithmetic
          const targetCap = Number(payload.totalBudget);
          let sumAllocated = parsed.budgetAllocations.reduce((sum: number, item: any) => sum + (Number(item.allocatedAmount) || 0), 0);

          if (sumAllocated > targetCap) {
            const excess = sumAllocated - targetCap;
            // Deduct excess from the largest allocation
            const largest = parsed.budgetAllocations.reduce((max: any, item: any) => 
              item.allocatedAmount > max.allocatedAmount ? item : max, parsed.budgetAllocations[0]
            );
            if (largest) {
              largest.allocatedAmount = Math.max(0, largest.allocatedAmount - excess);
            }
          }

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: true,
            isLiveAi: true,
            model: 'gemini-3.8-flash',
            plan: parsed
          }));
        } catch (err: any) {
          console.error('Gemini API Error in middleware:', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: false,
            isLiveAi: false,
            error: 'AI_GENERATION_FAILED',
            message: err?.message || 'Error generating AI plan.'
          }));
        }
      });
      return;
    }

    next();
  };
}
