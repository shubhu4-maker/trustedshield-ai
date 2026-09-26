import { z } from 'zod';
export declare const SCAN_CATEGORIES: readonly ["PHISHING", "JOB_SCAM", "IMPERSONATION", "FINANCIAL_CRYPTO", "ECOMMERCE_INVOICE", "OTHER"];
export type ScanCategory = (typeof SCAN_CATEGORIES)[number];
export declare const RISK_LEVELS: {
    readonly SAFE: {
        readonly min: 0;
        readonly max: 29;
        readonly color: "text-emerald-500";
        readonly bg: "bg-emerald-500/10";
        readonly border: "border-emerald-500/20";
        readonly label: "SAFE";
    };
    readonly SUSPICIOUS: {
        readonly min: 30;
        readonly max: 69;
        readonly color: "text-amber-500";
        readonly bg: "bg-amber-500/10";
        readonly border: "border-amber-500/20";
        readonly label: "SUSPICIOUS";
    };
    readonly DANGEROUS: {
        readonly min: 70;
        readonly max: 100;
        readonly color: "text-rose-500";
        readonly bg: "bg-rose-500/10";
        readonly border: "border-rose-500/20";
        readonly label: "DANGEROUS";
    };
};
export type RiskLevel = keyof typeof RISK_LEVELS;
export declare function getRiskLevel(score: number): RiskLevel;
export declare const PiiRedactRequestSchema: any;
export declare const AnalyzeRequestSchema: any;
export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;
export declare const PublicFeedQuerySchema: any;
export type PublicFeedQuery = z.infer<typeof PublicFeedQuerySchema>;
export declare const UpvoteParamsSchema: any;
export declare const ScanIdParamsSchema: any;
export interface RedFlag {
    title: string;
    explanation: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
}
export interface RecommendedAction {
    action: string;
    priority: 'URGENT' | 'RECOMMENDED' | 'OPTIONAL';
}
export interface ScanResult {
    id: string;
    userId: string | null;
    contentType: 'TEXT' | 'URL';
    originalLength: number;
    redactedContent: string;
    analyzedUrl: string | null;
    riskScore: number;
    riskLevel: RiskLevel;
    category: ScanCategory;
    summary: string;
    redFlags: RedFlag[];
    recommendedActions: RecommendedAction[];
    heuristicSignals: Record<string, unknown>;
    isPublic: boolean;
    isEphemeral: boolean;
    upvotes: number;
    createdAt: string;
    psychologicalTriggers?: string[];
}
//# sourceMappingURL=validators.d.ts.map