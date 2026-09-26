/**
 * Server-side copy of shared validators.
 * Kept in sync with the shared/validators.ts file.
 * The server uses its own copy to avoid cross-package import issues with ESM/tsx.
 */
import { z } from 'zod';
export declare const AnalyzeRequestSchema: z.ZodEffects<z.ZodObject<{
    content: z.ZodString;
    contentType: z.ZodEnum<["TEXT", "URL"]>;
    isEphemeral: z.ZodDefault<z.ZodBoolean>;
    isPublic: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    content: string;
    contentType: "TEXT" | "URL";
    isEphemeral: boolean;
    isPublic: boolean;
}, {
    content: string;
    contentType: "TEXT" | "URL";
    isEphemeral?: boolean | undefined;
    isPublic?: boolean | undefined;
}>, {
    content: string;
    contentType: "TEXT" | "URL";
    isEphemeral: boolean;
    isPublic: boolean;
}, {
    content: string;
    contentType: "TEXT" | "URL";
    isEphemeral?: boolean | undefined;
    isPublic?: boolean | undefined;
}>;
export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;
export declare const PublicFeedQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    category: z.ZodOptional<z.ZodEnum<["PHISHING", "JOB_SCAM", "IMPERSONATION", "FINANCIAL_CRYPTO", "ECOMMERCE_INVOICE", "OTHER"]>>;
    search: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    category?: "PHISHING" | "JOB_SCAM" | "IMPERSONATION" | "FINANCIAL_CRYPTO" | "ECOMMERCE_INVOICE" | "OTHER" | undefined;
    search?: string | undefined;
}, {
    limit?: number | undefined;
    page?: number | undefined;
    category?: "PHISHING" | "JOB_SCAM" | "IMPERSONATION" | "FINANCIAL_CRYPTO" | "ECOMMERCE_INVOICE" | "OTHER" | undefined;
    search?: string | undefined;
}>;
export declare const ScanIdParamsSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export type ScanCategory = 'PHISHING' | 'JOB_SCAM' | 'IMPERSONATION' | 'FINANCIAL_CRYPTO' | 'ECOMMERCE_INVOICE' | 'OTHER';
export type RiskLevel = 'SAFE' | 'SUSPICIOUS' | 'DANGEROUS';
export declare function getRiskLevel(score: number): RiskLevel;
//# sourceMappingURL=validators.d.ts.map