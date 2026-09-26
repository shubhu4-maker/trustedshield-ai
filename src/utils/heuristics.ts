/**
 * Deterministic Heuristic Engine — Fast, rule-based security signals.
 * These run BEFORE the LLM call to provide deterministic context
 * and contribute 40% of the final composite risk score.
 */

export interface HeuristicResult {
  score: number; // 0-100
  flags: string[];
  signals: Record<string, unknown>;
}

// ── Suspicious TLDs ─────────────────────────────────────────────────────────────

const SUSPICIOUS_TLDS = new Set([
  '.xyz', '.top', '.tk', '.ml', '.ga', '.cf', '.gq',
  '.buzz', '.club', '.work', '.click', '.link', '.info',
  '.icu', '.cam', '.rest', '.surf', '.monster',
]);

// ── URL Shorteners ──────────────────────────────────────────────────────────────

const URL_SHORTENERS = new Set([
  'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly',
  'is.gd', 'buff.ly', 'rebrand.ly', 'cutt.ly', 'shorturl.at',
  'rb.gy', 'tiny.cc', 'lnkd.in',
]);

// ── Urgency Keywords ────────────────────────────────────────────────────────────

const URGENCY_KEYWORDS = [
  'urgent', 'immediate', 'act now', 'expires', 'limited time',
  'suspend', 'terminated', 'verify your', 'confirm your identity',
  'unauthorized', 'unusual activity', 'security alert', 'account locked',
  'within 24 hours', 'within 48 hours', 'final warning', 'last chance',
  'failure to comply', 'legal action', 'law enforcement',
];

// ── Financial Red Flags ─────────────────────────────────────────────────────────

const FINANCIAL_KEYWORDS = [
  'wire transfer', 'wire an', 'western union', 'moneygram', 'gift card',
  'itunes card', 'google play card', 'bitcoin', 'btc',
  'cryptocurrency', 'crypto wallet', 'eth', 'usdt', 'tether',
  'seed phrase', 'private key', 'upfront payment', 'processing fee',
  'advance fee', 'registration fee', 'equipment fee', 'onboarding fee',
  'onboarding deposit', 'cashier check', 'money order', 'deposit',
];

// ── Job Scam Keywords ──────────────────────────────────────────────────────────

const JOB_SCAM_KEYWORDS = [
  'remote data entry', 'data specialist', 'hiring manager on telegram',
  'contact recruiter', 'accepted your application', 'onboarding fee',
  'equipment fee', 'telegram @', 'telegram channel', 'pay for equipment',
  'background check deposit', 'salary is $', 'earn $65', 'earn $75',
];

// ── Invoice / Refund Scam Keywords ─────────────────────────────────────────────

const INVOICE_SCAM_KEYWORDS = [
  'geek squad', 'auto-renewal', 'total protection', 'total tech',
  'refund department', 'cancellation desk', 'charge of $', 'debited',
  'invoice #', 'order confirmation', 'did not authorize', 'call our refund',
  'cancel this charge', 'billing department',
];

// ── Crypto Wallet Patterns ──────────────────────────────────────────────────────

const CRYPTO_WALLET_REGEX = /\b(0x[a-fA-F0-9]{40}|[13][a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-zA-HJ-NP-Z0-9]{25,39}|T[a-zA-Z0-9]{33})\b/g;

// ── Impersonation Signals ───────────────────────────────────────────────────────

const IMPERSONATION_KEYWORDS = [
  'internal revenue', 'irs', 'social security administration',
  'microsoft support', 'apple support', 'amazon security',
  'paypal team', 'bank of america', 'wells fargo', 'chase bank',
  'customer service department', 'technical support',
  'ceo', 'cfo', 'managing director', 'human resources department',
];

/**
 * Calculates Shannon entropy for a string — high entropy domains are suspicious.
 */
function shannonEntropy(str: string): number {
  const len = str.length;
  if (len === 0) return 0;

  const freq: Map<string, number> = new Map();
  for (const char of str) {
    freq.set(char, (freq.get(char) || 0) + 1);
  }

  let entropy = 0;
  for (const count of freq.values()) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

/**
 * Extracts and analyzes domains found in text.
 */
function analyzeUrls(text: string): { flags: string[]; score: number; domains: string[] } {
  const urlRegex = /https?:\/\/[^\s<>"{}|\\^\[\]`]+/gi;
  const matches = text.match(urlRegex) || [];
  const flags: string[] = [];
  let score = 0;
  const domains: string[] = [];

  for (const rawUrl of matches) {
    try {
      const url = new URL(rawUrl);
      const hostname = url.hostname.toLowerCase();
      domains.push(hostname);

      // Check for known brand impersonation / typosquatting
      const TARGET_BRANDS = [
        { brand: 'paypal', official: 'paypal.com' },
        { brand: 'chase', official: 'chase.com' },
        { brand: 'wellsfargo', official: 'wellsfargo.com' },
        { brand: 'bankofamerica', official: 'bankofamerica.com' },
        { brand: 'citibank', official: 'citi.com' },
        { brand: 'amazon', official: 'amazon.com' },
        { brand: 'apple', official: 'apple.com' },
        { brand: 'microsoft', official: 'microsoft.com' },
        { brand: 'netflix', official: 'netflix.com' },
        { brand: 'usps', official: 'usps.com' },
        { brand: 'fedex', official: 'fedex.com' },
        { brand: 'dhl', official: 'dhl.com' },
      ];

      for (const target of TARGET_BRANDS) {
        if (hostname.includes(target.brand) && !hostname.endsWith(target.official)) {
          flags.push(`Brand lookalike / typosquatting detected: "${target.brand}" in non-official domain (${hostname})`);
          score += 25;
          break;
        }
      }

      // Check suspicious TLDs
      for (const tld of SUSPICIOUS_TLDS) {
        if (hostname.endsWith(tld)) {
          flags.push(`Suspicious TLD detected: ${tld} (domain: ${hostname})`);
          score += 20;
          break;
        }
      }

      // Check URL shorteners
      if (URL_SHORTENERS.has(hostname)) {
        flags.push(`URL shortener detected: ${hostname} — destination is hidden`);
        score += 15;
      }

      // Check domain entropy (high entropy = likely random/generated)
      const domainBase = hostname.split('.').slice(0, -1).join('.');
      const entropy = shannonEntropy(domainBase);
      if (entropy > 3.4 && domainBase.length > 8) {
        flags.push(`High-entropy domain detected (${entropy.toFixed(2)} bits): possible algorithmically generated domain`);
        score += 15;
      }

      // Check for IP-based URLs (not domain names)
      if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
        flags.push(`URL uses raw IP address instead of domain name: ${hostname}`);
        score += 25;
      }

      // Check for excessive subdomains (typosquatting technique)
      const subdomainCount = hostname.split('.').length - 2;
      if (subdomainCount >= 2) {
        flags.push(`Excessive subdomains detected (${subdomainCount + 1} levels): possible typosquatting`);
        score += 10;
      }

      // Check for @ in URL (credential phishing trick)
      if (rawUrl.includes('@')) {
        flags.push('URL contains @ symbol — possible credential-prepended phishing URL');
        score += 25;
      }
    } catch {
      // Malformed URL is itself suspicious
      flags.push(`Malformed URL detected: ${rawUrl.substring(0, 80)}`);
      score += 10;
    }
  }

  return { flags, score: Math.min(score, 65), domains };
}

/**
 * Checks text for keyword-based threat indicators.
 */
function analyzeKeywords(text: string): { flags: string[]; score: number } {
  const lowerText = text.toLowerCase();
  const flags: string[] = [];
  let score = 0;

  // Urgency keywords
  let urgencyCount = 0;
  for (const keyword of URGENCY_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      urgencyCount++;
      if (urgencyCount <= 3) {
        flags.push(`Urgency/pressure keyword detected: "${keyword}"`);
      }
    }
  }
  if (urgencyCount > 0) {
    score += Math.min(urgencyCount * 5, 20);
    if (urgencyCount > 3) {
      flags.push(`${urgencyCount} total urgency keywords detected — high-pressure tactics`);
    }
  }

  // Financial red flags
  let financialCount = 0;
  for (const keyword of FINANCIAL_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      financialCount++;
      if (financialCount <= 3) {
        flags.push(`Financial red flag keyword: "${keyword}"`);
      }
    }
  }
  if (financialCount > 0) {
    score += Math.min(financialCount * 7, 25);
    if (financialCount > 3) {
      flags.push(`${financialCount} total financial red flag keywords detected`);
    }
  }

  // Crypto wallets
  const cryptoMatches = text.match(CRYPTO_WALLET_REGEX);
  if (cryptoMatches) {
    flags.push(`Cryptocurrency wallet address(es) detected (${cryptoMatches.length} found)`);
    score += 15;
  }

  // Job scam red flags
  let jobScamCount = 0;
  for (const keyword of JOB_SCAM_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      jobScamCount++;
      if (jobScamCount <= 3) {
        flags.push(`Employment scam signal detected: "${keyword}"`);
      }
    }
  }
  if (jobScamCount > 0) {
    score += Math.min(jobScamCount * 12, 35);
  }

  // Invoice / fake charge scam red flags
  let invoiceScamCount = 0;
  for (const keyword of INVOICE_SCAM_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      invoiceScamCount++;
      if (invoiceScamCount <= 3) {
        flags.push(`Fake invoice/charge indicator: "${keyword}"`);
      }
    }
  }
  if (invoiceScamCount > 0) {
    score += Math.min(invoiceScamCount * 12, 35);
  }

  // Impersonation signals
  let impersonationCount = 0;
  for (const keyword of IMPERSONATION_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      impersonationCount++;
      if (impersonationCount <= 2) {
        flags.push(`Potential impersonation signal: "${keyword}"`);
      }
    }
  }
  if (impersonationCount > 0) {
    score += Math.min(impersonationCount * 10, 25);
  }

  return { flags, score: Math.min(score, 70) };
}

/**
 * Checks for common structural scam patterns.
 */
function analyzeStructure(text: string): { flags: string[]; score: number } {
  const flags: string[] = [];
  let score = 0;

  // ALL CAPS abuse
  const capsWords = text.match(/\b[A-Z]{4,}\b/g) || [];
  if (capsWords.length > 3) {
    flags.push(`Excessive ALL CAPS usage detected (${capsWords.length} instances) — intimidation tactic`);
    score += 5;
  }

  // Excessive exclamation marks
  const exclamationCount = (text.match(/!/g) || []).length;
  if (exclamationCount > 5) {
    flags.push(`Excessive exclamation marks (${exclamationCount}) — artificial urgency`);
    score += 5;
  }

  // Grammar quality signal: multiple consecutive spaces or erratic formatting
  if (/\s{3,}/.test(text)) {
    flags.push('Erratic formatting detected — possible mass-produced scam content');
    score += 3;
  }

  // "Click here" patterns
  if (/click\s+(here|below|this|the\s+link)/i.test(text)) {
    flags.push('"Click here" directive detected — common phishing call-to-action');
    score += 8;
  }

  // "Dear Customer/User" generic salutation
  if (/dear\s+(customer|user|valued\s+member|account\s+holder|sir\/madam)/i.test(text)) {
    flags.push('Generic salutation detected ("Dear Customer") — mass phishing indicator');
    score += 6;
  }

  return { flags, score: Math.min(score, 25) };
}

/**
 * Infers category deterministically from keywords and flags if AI is in fallback mode.
 */
export function inferHeuristicCategory(text: string, flags: string[]): 'PHISHING' | 'JOB_SCAM' | 'IMPERSONATION' | 'FINANCIAL_CRYPTO' | 'ECOMMERCE_INVOICE' | 'OTHER' {
  const lower = text.toLowerCase();
  const flagStr = flags.join(' ').toLowerCase();

  if (
    lower.includes('bitcoin') || lower.includes('crypto') || lower.includes('wallet') ||
    lower.includes('eth') || lower.includes('gift card') || lower.includes('wire transfer') ||
    flagStr.includes('cryptocurrency')
  ) {
    return 'FINANCIAL_CRYPTO';
  }

  if (
    lower.includes('job') || lower.includes('position') || lower.includes('salary') ||
    lower.includes('hiring') || lower.includes('recruiter') || lower.includes('data entry') ||
    lower.includes('onboarding fee') || lower.includes('equipment fee')
  ) {
    return 'JOB_SCAM';
  }

  if (
    lower.includes('irs') || lower.includes('internal revenue') || lower.includes('social security') ||
    lower.includes('microsoft support') || lower.includes('apple support') || lower.includes('arrest warrant') ||
    lower.includes('law enforcement')
  ) {
    return 'IMPERSONATION';
  }

  if (
    lower.includes('invoice') || lower.includes('order confirmation') || lower.includes('auto-renewal') ||
    lower.includes('geek squad') || lower.includes('refund') || lower.includes('charge of')
  ) {
    return 'ECOMMERCE_INVOICE';
  }

  if (
    flagStr.includes('tld') || flagStr.includes('entropy') || flagStr.includes('shortener') ||
    flagStr.includes('typosquatting') || lower.includes('verify your') || lower.includes('suspend') ||
    lower.includes('login') || lower.includes('password')
  ) {
    return 'PHISHING';
  }

  return 'OTHER';
}

/**
 * Runs the complete deterministic heuristic analysis pipeline.
 * Returns a score (0-100), descriptive flags, and raw signal data.
 */
export function runHeuristics(text: string, contentType: 'TEXT' | 'URL'): HeuristicResult {
  let urlAnalysis = analyzeUrls(text);
  const keywordAnalysis = analyzeKeywords(text);
  const structureAnalysis = analyzeStructure(text);

  const allFlags = [
    ...urlAnalysis.flags,
    ...keywordAnalysis.flags,
    ...structureAnalysis.flags,
  ];

  let urlScore = urlAnalysis.score;
  const domains = [...urlAnalysis.domains];

  // If content type is URL and no URLs were found, re-analyze with https:// prefix
  if (contentType === 'URL' && domains.length === 0) {
    try {
      const testUrl = text.startsWith('http') ? text : `https://${text.trim()}`;
      const reanalysis = analyzeUrls(testUrl);
      allFlags.push(...reanalysis.flags);
      urlScore = Math.max(urlScore, reanalysis.score);
      domains.push(...reanalysis.domains);
    } catch {
      allFlags.push('Provided URL could not be parsed');
    }
  }

  const rawScore = urlScore + keywordAnalysis.score + structureAnalysis.score;
  const finalScore = Math.min(rawScore, 100);

  return {
    score: finalScore,
    flags: allFlags,
    signals: {
      urlAnalysis: {
        domainsFound: domains,
        flagCount: allFlags.filter((f) => f.includes('domain') || f.includes('URL') || f.includes('TLD')).length,
        score: urlScore,
      },
      keywordAnalysis: {
        flagCount: keywordAnalysis.flags.length,
        score: keywordAnalysis.score,
      },
      structureAnalysis: {
        flagCount: structureAnalysis.flags.length,
        score: structureAnalysis.score,
      },
      totalRawScore: rawScore,
    },
  };
}
