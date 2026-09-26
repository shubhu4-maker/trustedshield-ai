/**
 * Server-side PII Scrubber — Defense-in-depth re-verification layer.
 * Client scrubs first, server re-scrubs to guarantee zero PII leakage to Gemini or DB.
 */
export interface PiiScrubResult {
    redactedText: string;
    redactionsApplied: PiiRedaction[];
    piiDetected: boolean;
}
export interface PiiRedaction {
    type: string;
    originalLength: number;
    replacement: string;
}
/**
 * Applies all PII redaction patterns to the input text.
 * Returns the scrubbed text along with a manifest of what was redacted.
 */
export declare function scrubPii(text: string): PiiScrubResult;
/**
 * Validates that the text has already been client-side scrubbed.
 * If residual PII is found, re-scrubs as a safety net.
 */
export declare function ensurePiiScrubbed(text: string): PiiScrubResult;
//# sourceMappingURL=piiScrubber.d.ts.map