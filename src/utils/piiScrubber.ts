/**
 * Client-side PII Scrubber — First line of defense.
 * Removes sensitive data BEFORE it ever leaves the browser.
 */

export interface PiiMatch {
  type: string;
  original: string;
  replacement: string;
  startIndex: number;
  endIndex: number;
}

export interface ClientPiiResult {
  redactedText: string;
  matches: PiiMatch[];
  piiDetected: boolean;
}

const PII_RULES: Array<{ name: string; regex: RegExp; replacement: string }> = [
  {
    name: 'EMAIL',
    regex: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g,
    replacement: '[REDACTED_EMAIL]',
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
    name: 'PHONE',
    regex: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
    replacement: '[REDACTED_PHONE]',
  },
  {
    name: 'IP_ADDRESS',
    regex: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    replacement: '[REDACTED_IP]',
  },
];

/**
 * Scrubs PII from input text and returns both the cleaned text
 * and a manifest of all matches (for visual highlighting in the UI).
 */
export function scrubPiiClient(text: string): ClientPiiResult {
  const matches: PiiMatch[] = [];
  let workingText = text;

  for (const rule of PII_RULES) {
    // Reset regex lastIndex
    rule.regex.lastIndex = 0;
    let match: RegExpExecArray | null;
    const tempMatches: PiiMatch[] = [];

    // Find all matches in original text
    const freshRegex = new RegExp(rule.regex.source, rule.regex.flags);
    while ((match = freshRegex.exec(text)) !== null) {
      tempMatches.push({
        type: rule.name,
        original: match[0],
        replacement: rule.replacement,
        startIndex: match.index,
        endIndex: match.index + match[0].length,
      });
    }

    matches.push(...tempMatches);
    workingText = workingText.replace(new RegExp(rule.regex.source, rule.regex.flags), rule.replacement);
  }

  return {
    redactedText: workingText,
    matches,
    piiDetected: matches.length > 0,
  };
}

/**
 * Generates HTML with PII tokens highlighted for visual preview.
 */
export function generatePiiHighlightHtml(text: string): string {
  let result = text;

  for (const rule of PII_RULES) {
    result = result.replace(
      new RegExp(rule.regex.source, rule.regex.flags),
      `<span class="pii-highlight">${rule.replacement}</span>`
    );
  }

  return result;
}
