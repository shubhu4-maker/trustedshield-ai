import { z } from 'zod';
export const SCAN_CATEGORIES = [
    'PHISHING',
    'JOB_SCAM',
    'IMPERSONATION',
    'FINANCIAL_CRYPTO',
    'ECOMMERCE_INVOICE',
    'OTHER',
];
export const RISK_LEVELS = {
    SAFE: { min: 0, max: 29, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'SAFE' },
    SUSPICIOUS: { min: 30, max: 69, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'SUSPICIOUS' },
    DANGEROUS: { min: 70, max: 100, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20', label: 'DANGEROUS' },
};
export function getRiskLevel(score) {
    if (score <= 29)
        return 'SAFE';
    if (score <= 69)
        return 'SUSPICIOUS';
    return 'DANGEROUS';
}
export const PiiRedactRequestSchema = z.object({
    text: z
        .string()
        .min(5, 'Input text must be at least 5 characters long.')
        .max(10000, 'Input text exceeds 10,000 character limit.'),
});
export const AnalyzeRequestSchema = z
    .object({
    content: z
        .string()
        .min(5, 'Content must be at least 5 characters long.')
        .max(10000, 'Content exceeds 10,000 character limit.'),
    contentType: z.enum(['TEXT', 'URL']),
    isEphemeral: z.boolean().default(false),
    isPublic: z.boolean().default(false),
})
    .superRefine((data, ctx) => {
    if (data.contentType === 'URL') {
        const trimmed = data.content.trim();
        const lower = trimmed.toLowerCase();
        // Check for unsupported schemes
        const disallowedSchemes = ['javascript:', 'data:', 'file:', 'ftp:', 'blob:', 'vbscript:'];
        for (const scheme of disallowedSchemes) {
            if (lower.startsWith(scheme)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `Unsupported URL scheme "${scheme}". Only HTTP and HTTPS URLs can be analyzed.`,
                    path: ['content'],
                });
                return;
            }
        }
        // Check domain structure
        try {
            const urlToTest = lower.startsWith('http://') || lower.startsWith('https://')
                ? trimmed
                : `https://${trimmed}`;
            const parsed = new URL(urlToTest);
            if (!parsed.hostname || !parsed.hostname.includes('.')) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Invalid URL or domain format. Must include a valid domain name (e.g., example.com).',
                    path: ['content'],
                });
            }
        }
        catch {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Malformed URL provided. Please provide a valid HTTP/HTTPS address or domain.',
                path: ['content'],
            });
        }
    }
});
export const PublicFeedQuerySchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(12),
    category: z
        .enum([
        'PHISHING',
        'JOB_SCAM',
        'IMPERSONATION',
        'FINANCIAL_CRYPTO',
        'ECOMMERCE_INVOICE',
        'OTHER',
    ])
        .optional(),
    search: z.string().optional(),
});
export const UpvoteParamsSchema = z.object({
    id: z.string().uuid('Invalid scan ID format.'),
});
export const ScanIdParamsSchema = z.object({
    id: z.string().uuid('Invalid scan ID format.'),
});
//# sourceMappingURL=validators.js.map