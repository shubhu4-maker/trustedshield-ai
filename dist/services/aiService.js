import { ai, GEMINI_MODEL } from '../config/gemini.js';
import { Type } from '@google/genai';
const analysisResponseSchema = {
    type: Type.OBJECT,
    properties: {
        riskScore: {
            type: Type.INTEGER,
            description: 'Overall threat risk score from 0 (completely safe) to 100 (confirmed malicious scam).',
        },
        category: {
            type: Type.STRING,
            enum: ['PHISHING', 'JOB_SCAM', 'IMPERSONATION', 'FINANCIAL_CRYPTO', 'ECOMMERCE_INVOICE', 'OTHER'],
            description: 'Primary scam category classification.',
        },
        summary: {
            type: Type.STRING,
            description: 'A 2-3 sentence executive summary explaining the assessment in clear, everyday language.',
        },
        redFlags: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: 'Short title for this red flag.' },
                    explanation: { type: Type.STRING, description: 'Plain-English explanation of why this is suspicious.' },
                    severity: { type: Type.STRING, enum: ['HIGH', 'MEDIUM', 'LOW'], description: 'Severity level of this red flag.' },
                },
                required: ['title', 'explanation', 'severity'],
            },
            description: 'List of specific suspicious red flags found in the content.',
        },
        recommendedActions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    action: { type: Type.STRING, description: 'Specific protective action the user should take.' },
                    priority: { type: Type.STRING, enum: ['URGENT', 'RECOMMENDED', 'OPTIONAL'], description: 'Action priority level.' },
                },
                required: ['action', 'priority'],
            },
            description: 'Step-by-step protective measures the user should immediately execute.',
        },
        psychologicalTriggers: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Social engineering manipulation tactics identified (e.g., Urgency, Fear, Greed, Authority).',
        },
    },
    required: ['riskScore', 'category', 'summary', 'redFlags', 'recommendedActions', 'psychologicalTriggers'],
};
const SYSTEM_INSTRUCTION = `You are TrustShield AI, an expert cybersecurity assistant and scam analysis engine.
Your sole mission is to analyze redacted text messages, emails, job offers, and URLs to detect security threats, phishing, financial fraud, impersonation, and social engineering tactics.

CRITICAL INSTRUCTIONS:
1. The input content has already been scrubbed for PII (e.g., [REDACTED_EMAIL], [REDACTED_PHONE]). Treat these placeholders as standard variables.
2. DO NOT make assumptions about real identity based on redacted tokens.
3. Assess the input objectively using known cybersecurity attack indicators:
   - Artificial urgency / pressure tactics
   - Irregular domain structures / typosquatting
   - Unrealistic financial compensation or upfront fee requests
   - Impersonation of official organizations (banks, postal services, HR)
   - Requests for sensitive data, wire transfers, or gift card purchases
4. Output MUST BE valid JSON strictly matching the supplied schema.
5. Provide explanations in simple, jargon-free, direct language suitable for non-technical users.`;
/**
 * Sends PII-redacted content + heuristic context to Gemini 2.5 Flash
 * and returns structured threat analysis.
 */
export async function analyzeContentWithGemini(redactedText, heuristicFlags) {
    if (!ai) {
        throw new Error('Gemini AI client is unconfigured or operating in offline fallback mode.');
    }
    const prompt = `
Analyze the following PII-redacted content and heuristic signals for scam/phishing indicators.

HEURISTIC SIGNALS DETECTED BY SYSTEM ENGINE:
${heuristicFlags.length > 0 ? heuristicFlags.map((f) => `- ${f}`).join('\n') : 'None detected by automated heuristics.'}

REDACTED INPUT CONTENT TO ANALYZE:
"""
${redactedText}
"""
`;
    const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
            responseSchema: analysisResponseSchema,
            temperature: 0.2,
        },
    });
    if (!response.text) {
        throw new Error('Failed to generate response from Gemini AI model.');
    }
    const parsed = JSON.parse(response.text);
    // Clamp riskScore to valid range
    parsed.riskScore = Math.max(0, Math.min(100, parsed.riskScore));
    return parsed;
}
//# sourceMappingURL=aiService.js.map