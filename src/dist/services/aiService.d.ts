export interface AIAnalysisResult {
    riskScore: number;
    category: 'PHISHING' | 'JOB_SCAM' | 'IMPERSONATION' | 'FINANCIAL_CRYPTO' | 'ECOMMERCE_INVOICE' | 'OTHER';
    summary: string;
    redFlags: Array<{
        title: string;
        explanation: string;
        severity: 'HIGH' | 'MEDIUM' | 'LOW';
    }>;
    recommendedActions: Array<{
        action: string;
        priority: 'URGENT' | 'RECOMMENDED' | 'OPTIONAL';
    }>;
    psychologicalTriggers: string[];
}
/**
 * Sends PII-redacted content + heuristic context to Gemini 2.5 Flash
 * and returns structured threat analysis.
 */
export declare function analyzeContentWithGemini(redactedText: string, heuristicFlags: string[]): Promise<AIAnalysisResult>;
//# sourceMappingURL=aiService.d.ts.map