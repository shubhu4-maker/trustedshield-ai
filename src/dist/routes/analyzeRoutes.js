import { Router } from 'express';
import { AnalyzeRequestSchema } from '../validators.js';
import { optionalAuth } from '../middleware/auth.js';
import { analyzeRateLimiter } from '../middleware/rateLimiter.js';
import { ensurePiiScrubbed } from '../utils/piiScrubber.js';
import { runHeuristics, inferHeuristicCategory } from '../utils/heuristics.js';
import { analyzeContentWithGemini } from '../services/aiService.js';
import { createScan } from '../services/scanService.js';
const router = Router();
/**
 * POST /api/v1/analyze
 *
 * Core analysis endpoint:
 * 1. Validates & re-scrubs PII (defense-in-depth)
 * 2. Runs deterministic heuristic analysis
 * 3. Calls Gemini 2.5 Flash with structured output schema (with heuristic fallback)
 * 4. Blends scores (40% heuristic + 60% LLM)
 * 5. Persists result (in-memory or Supabase)
 */
router.post('/', analyzeRateLimiter, optionalAuth, async (req, res, next) => {
    try {
        // 1. Validate request body
        const validated = AnalyzeRequestSchema.parse(req.body);
        // 2. Server-side PII re-scrub (defense-in-depth)
        const piiResult = ensurePiiScrubbed(validated.content);
        const cleanContent = piiResult.redactedText;
        if (piiResult.piiDetected) {
            console.log(`[PII Defense] Server-side scrubber caught ${piiResult.redactionsApplied.length} residual PII item(s)`);
        }
        // 3. Deterministic heuristic analysis
        const heuristicResult = runHeuristics(cleanContent, validated.contentType);
        // 4. Extract URL if content type is URL
        let analyzedUrl = null;
        if (validated.contentType === 'URL') {
            const urlMatch = cleanContent.match(/https?:\/\/[^\s]+/);
            if (urlMatch) {
                analyzedUrl = urlMatch[0];
            }
            else if (cleanContent.match(/^[^\s]+\.[^\s]+$/)) {
                analyzedUrl = `https://${cleanContent.trim()}`;
            }
        }
        // 5. Gemini 2.5 Flash AI analysis
        let aiResult;
        let isAiAvailable = true;
        try {
            aiResult = await analyzeContentWithGemini(cleanContent, heuristicResult.flags);
        }
        catch (aiError) {
            isAiAvailable = false;
            console.warn(`[AI Engine] Gemini unavailable (${aiError.message}). Operating in deterministic heuristic safety mode.`);
            const inferredCategory = inferHeuristicCategory(cleanContent, heuristicResult.flags);
            aiResult = {
                riskScore: heuristicResult.score,
                category: inferredCategory,
                summary: 'AI analysis temporarily operating in deterministic heuristic mode. ' +
                    (heuristicResult.flags.length > 0
                        ? `Detected ${heuristicResult.flags.length} suspicious pattern(s) using rule-based inspection.`
                        : 'No suspicious patterns detected by automated safety rules.'),
                redFlags: heuristicResult.flags.map((f) => ({
                    title: f.split(':')[0] || f,
                    explanation: f,
                    severity: (f.includes('Critical') || f.includes('TLD') || f.includes('Shortener') || f.includes('Bitcoin')) ? 'HIGH' : 'MEDIUM',
                    source: 'HEURISTIC',
                })),
                recommendedActions: [
                    {
                        action: 'Verify sender identity independently before taking any requested action.',
                        priority: 'URGENT',
                    },
                    {
                        action: 'Never enter credentials or payment information on unverified sites.',
                        priority: 'URGENT',
                    },
                ],
                psychologicalTriggers: cleanContent.toLowerCase().includes('urgent') || cleanContent.toLowerCase().includes('immediate')
                    ? ['Urgency & Pressure']
                    : [],
            };
        }
        // Format red flags with source attribution
        const formattedRedFlags = aiResult.redFlags.map((flag) => ({
            ...flag,
            source: flag.source || (isAiAvailable ? 'AI' : 'HEURISTIC'),
        }));
        // 6. Blend scores: 40% heuristic + 60% LLM
        const compositeScore = isAiAvailable
            ? Math.round(heuristicResult.score * 0.4 + aiResult.riskScore * 0.6)
            : heuristicResult.score;
        const finalScore = Math.max(0, Math.min(100, compositeScore));
        // 7. Persist scan result
        const scanRecord = await createScan({
            userId: req.userId || null,
            contentType: validated.contentType,
            originalLength: validated.content.length,
            redactedContent: cleanContent,
            analyzedUrl,
            riskScore: finalScore,
            category: aiResult.category,
            summary: aiResult.summary,
            redFlags: formattedRedFlags,
            recommendedActions: aiResult.recommendedActions,
            heuristicSignals: heuristicResult.signals,
            isPublic: validated.isPublic,
            isEphemeral: validated.isEphemeral,
        });
        // 8. Return complete analysis response
        res.status(200).json({
            success: true,
            data: {
                id: scanRecord.id,
                riskScore: finalScore,
                riskLevel: finalScore <= 29 ? 'SAFE' : finalScore <= 69 ? 'SUSPICIOUS' : 'DANGEROUS',
                category: aiResult.category,
                summary: aiResult.summary,
                redFlags: formattedRedFlags,
                recommendedActions: aiResult.recommendedActions,
                psychologicalTriggers: aiResult.psychologicalTriggers || [],
                heuristicSignals: heuristicResult.signals,
                heuristicFlags: heuristicResult.flags,
                heuristicScore: heuristicResult.score,
                aiScore: aiResult.riskScore,
                compositeScore: finalScore,
                isAiAvailable,
                aiEngine: isAiAvailable ? 'Google Gemini 2.5 Flash' : 'Deterministic Heuristic Engine (Offline Fallback)',
                uncertaintyNote: isAiAvailable
                    ? undefined
                    : 'Gemini reasoning was offline/unconfigured. Assessment generated via deterministic heuristic analysis.',
                piiRedactions: piiResult.redactionsApplied,
                isEphemeral: validated.isEphemeral,
                isPublic: validated.isPublic,
                createdAt: scanRecord.created_at,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
export default router;
//# sourceMappingURL=analyzeRoutes.js.map