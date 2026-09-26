type ScanCategory = 'PHISHING' | 'JOB_SCAM' | 'IMPERSONATION' | 'FINANCIAL_CRYPTO' | 'ECOMMERCE_INVOICE' | 'OTHER';
type RiskLevel = 'SAFE' | 'SUSPICIOUS' | 'DANGEROUS';
export interface ScanRecord {
    id: string;
    user_id: string | null;
    content_type: 'TEXT' | 'URL';
    original_length: number;
    redacted_content: string;
    analyzed_url: string | null;
    risk_score: number;
    risk_level: RiskLevel;
    category: ScanCategory;
    summary: string;
    red_flags: unknown[];
    recommended_actions: unknown[];
    heuristic_signals: Record<string, unknown>;
    is_public: boolean;
    is_ephemeral: boolean;
    upvotes: number;
    created_at: string;
}
export interface CreateScanInput {
    userId: string | null;
    contentType: 'TEXT' | 'URL';
    originalLength: number;
    redactedContent: string;
    analyzedUrl: string | null;
    riskScore: number;
    category: ScanCategory;
    summary: string;
    redFlags: unknown[];
    recommendedActions: unknown[];
    heuristicSignals: Record<string, unknown>;
    isPublic: boolean;
    isEphemeral: boolean;
}
export declare function createScan(input: CreateScanInput): Promise<ScanRecord>;
export declare function getScanById(scanId: string): Promise<ScanRecord | null>;
export declare function getPublicFeed(params: {
    page: number;
    limit: number;
    category?: string;
    search?: string;
}): Promise<{
    scans: ScanRecord[];
    total: number;
}>;
export declare function getUserHistory(userId: string, page?: number, limit?: number): Promise<{
    scans: ScanRecord[];
    total: number;
}>;
export declare function toggleUpvote(scanId: string, userId: string): Promise<{
    upvoted: boolean;
    upvotes: number;
}>;
export declare function togglePublish(scanId: string, userId: string): Promise<{
    isPublic: boolean;
}>;
export declare function getAdminStats(): Promise<{
    totalScans: number;
    categoryBreakdown: Record<string, number>;
    riskBreakdown: Record<string, number>;
    recentScans: ScanRecord[];
    topRedFlags: string[];
}>;
export {};
//# sourceMappingURL=scanService.d.ts.map