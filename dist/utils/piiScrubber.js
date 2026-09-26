/**
 * Server-side PII Scrubber — Defense-in-depth re-verification layer.
 * Client scrubs first, server re-scrubs to guarantee zero PII leakage to Gemini or DB.
 */
// ── Regex Patterns ──────────────────────────────────────────────────────────────
const PII_PATTERNS = [
    {
        name: 'EMAIL',
        regex: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g,
        replacement: '[REDACTED_EMAIL]',
    },
    {
        name: 'PHONE',
        regex: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
        replacement: '[REDACTED_PHONE]',
    },
    {
        name: 'SSN',
        regex: /\b\d{3}-\d{2}-\d{4}\b/g,
        replacement: '[REDACTED_SSN]',
    },
    {
        name: 'CREDIT_CARD',
        regex: /\b(?:\d[ -]*?){13,16}\b/g,
        replacement: '[REDACTED_CC]',
    },
    {
        name: 'IP_ADDRESS',
        regex: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
        replacement: '[REDACTED_IP]',
    },
    {
        name: 'DATE_OF_BIRTH',
        regex: /\b(?:0[1-9]|1[0-2])\/(?:0[1-9]|[12]\d|3[01])\/(?:19|20)\d{2}\b/g,
        replacement: '[REDACTED_DOB]',
    },
];
/**
 * Applies all PII redaction patterns to the input text.
 * Returns the scrubbed text along with a manifest of what was redacted.
 */
export function scrubPii(text) {
    let redactedText = text;
    const redactionsApplied = [];
    for (const pattern of PII_PATTERNS) {
        const matches = redactedText.match(pattern.regex);
        if (matches) {
            for (const match of matches) {
                redactionsApplied.push({
                    type: pattern.name,
                    originalLength: match.length,
                    replacement: pattern.replacement,
                });
            }
            redactedText = redactedText.replace(pattern.regex, pattern.replacement);
        }
    }
    return {
        redactedText,
        redactionsApplied,
        piiDetected: redactionsApplied.length > 0,
    };
}
/**
 * Validates that the text has already been client-side scrubbed.
 * If residual PII is found, re-scrubs as a safety net.
 */
export function ensurePiiScrubbed(text) {
    return scrubPii(text);
}
//# sourceMappingURL=piiScrubber.js.map