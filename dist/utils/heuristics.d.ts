/**
 * Deterministic Heuristic Engine — Fast, rule-based security signals.
 * These run BEFORE the LLM call to provide deterministic context
 * and contribute 40% of the final composite risk score.
 */
export interface HeuristicResult {
    score: number;
    flags: string[];
    signals: Record<string, unknown>;
}
/**
 * Infers category deterministically from keywords and flags if AI is in fallback mode.
 */
export declare function inferHeuristicCategory(text: string, flags: string[]): 'PHISHING' | 'JOB_SCAM' | 'IMPERSONATION' | 'FINANCIAL_CRYPTO' | 'ECOMMERCE_INVOICE' | 'OTHER';
/**
 * Runs the complete deterministic heuristic analysis pipeline.
 * Returns a score (0-100), descriptive flags, and raw signal data.
 */
export declare function runHeuristics(text: string, contentType: 'TEXT' | 'URL'): HeuristicResult;
//# sourceMappingURL=heuristics.d.ts.map