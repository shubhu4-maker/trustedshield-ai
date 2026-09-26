import { supabaseAdmin } from '../config/supabase.js';
function getRiskLevel(score) {
    if (score <= 29)
        return 'SAFE';
    if (score <= 69)
        return 'SUSPICIOUS';
    return 'DANGEROUS';
}
// ── In-Memory Store & Seed Data (Guarantees full offline resilience) ────────────
const memoryScansStore = new Map();
const memoryUpvotesStore = new Set(); // "scanId:userId"
// Pre-populate with realistic community threat feed samples
const SEED_SCANS = [
    {
        id: '11111111-2222-3333-4444-555555555551',
        user_id: null,
        content_type: 'TEXT',
        original_length: 240,
        redacted_content: 'Urgent notice: Your PayPal account has been temporarily restricted. Please visit https://paypal-security-alert.xyz/verify to update your account within 24 hours.',
        analyzed_url: 'https://paypal-security-alert.xyz/verify',
        risk_score: 92,
        risk_level: 'DANGEROUS',
        category: 'PHISHING',
        summary: 'High-risk phishing attack impersonating PayPal. Uses artificial urgency and an untrusted .xyz domain to harvest account credentials.',
        red_flags: [
            { title: 'Suspicious TLD (.xyz)', explanation: 'Official PayPal services operate strictly on paypal.com, not .xyz top-level domains.', severity: 'HIGH' },
            { title: 'Artificial Urgency', explanation: 'Demands action within 24 hours to cause panic and bypass critical thinking.', severity: 'HIGH' },
            { title: 'Credential Harvesting Link', explanation: 'Directs victim to an unofficial replica login portal.', severity: 'HIGH' },
        ],
        recommended_actions: [
            { action: 'Do not click the link or provide any login details.', priority: 'URGENT' },
            { action: 'Navigate to paypal.com directly through your browser address bar.', priority: 'URGENT' },
            { action: 'Forward the message to spoof@paypal.com.', priority: 'RECOMMENDED' },
        ],
        heuristic_signals: { totalRawScore: 85 },
        is_public: true,
        is_ephemeral: false,
        upvotes: 24,
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
        id: '11111111-2222-3333-4444-555555555552',
        user_id: null,
        content_type: 'TEXT',
        original_length: 320,
        redacted_content: 'Congratulations! You have been selected for a Remote Data Entry position at Apex Global Solutions. Salary is $65/hr. Contact the hiring manager on Telegram @apex_careers and pay $150 onboarding fee for equipment setup.',
        analyzed_url: null,
        risk_score: 88,
        risk_level: 'DANGEROUS',
        category: 'JOB_SCAM',
        summary: 'Classic employment advance-fee scam. Offers unrealistic compensation for entry-level work and demands upfront payment for home equipment via Telegram.',
        red_flags: [
            { title: 'Upfront Onboarding Fee', explanation: 'Legitimate employers never require candidates to pay fees for equipment or background checks.', severity: 'HIGH' },
            { title: 'Telegram Recruiting', explanation: 'Professional corporations conduct hiring via verified enterprise channels, not encrypted messaging apps.', severity: 'HIGH' },
            { title: 'Unrealistic Compensation', explanation: '$65/hr for basic data entry is vastly above standard market compensation.', severity: 'MEDIUM' },
        ],
        recommended_actions: [
            { action: 'Cease all communication with the recruiter.', priority: 'URGENT' },
            { action: 'Never transfer funds or buy gift cards for employment.', priority: 'URGENT' },
            { action: 'Report the user handle on Telegram.', priority: 'RECOMMENDED' },
        ],
        heuristic_signals: { totalRawScore: 80 },
        is_public: true,
        is_ephemeral: false,
        upvotes: 18,
        created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    },
    {
        id: '11111111-2222-3333-4444-555555555553',
        user_id: null,
        content_type: 'TEXT',
        original_length: 280,
        redacted_content: 'Internal Revenue Service Alert: Final notice regarding overdue tax liabilities for 2024. Failure to transfer $1,200 via Bitcoin to wallet bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq will result in immediate federal arrest warrant.',
        analyzed_url: null,
        risk_score: 95,
        risk_level: 'DANGEROUS',
        category: 'IMPERSONATION',
        summary: 'Extreme intimidation scam impersonating the IRS. Threatens law enforcement action and demands payment via irreversible cryptocurrency.',
        red_flags: [
            { title: 'Cryptocurrency Demand by Government', explanation: 'Government agencies never accept payment via Bitcoin or any cryptocurrency.', severity: 'HIGH' },
            { title: 'Arrest Threat Intimidation', explanation: 'The IRS does not initiate arrest threats or police dispatch via email or SMS.', severity: 'HIGH' },
            { title: 'Bitcoin Wallet Address Detected', explanation: 'Irreversible transaction mechanism intended to prevent recovery.', severity: 'HIGH' },
        ],
        recommended_actions: [
            { action: 'Block sender immediately and do not respond.', priority: 'URGENT' },
            { action: 'Report to the Treasury Inspector General for Tax Administration (TIGTA).', priority: 'RECOMMENDED' },
        ],
        heuristic_signals: { totalRawScore: 90 },
        is_public: true,
        is_ephemeral: false,
        upvotes: 42,
        created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
    {
        id: '11111111-2222-3333-4444-555555555554',
        user_id: null,
        content_type: 'TEXT',
        original_length: 220,
        redacted_content: 'Geek Squad Order Confirmation: Thank you for your auto-renewal purchase of Total Protection ($499.99). If you did not authorize this charge, call our cancellation desk immediately at [REDACTED_PHONE].',
        analyzed_url: null,
        risk_score: 82,
        risk_level: 'DANGEROUS',
        category: 'ECOMMERCE_INVOICE',
        summary: 'Refund and cancellation invoice scam designed to induce panic over an unauthorized charge, prompting the victim to call a malicious call center.',
        red_flags: [
            { title: 'Fake Renewal Invoice', explanation: 'Fabricated high-dollar charge designed to provoke hasty reactive calls.', severity: 'HIGH' },
            { title: 'Direct Phone Call Vector', explanation: 'Attempts to route victim to social-engineering operators to gain remote device access.', severity: 'HIGH' },
        ],
        recommended_actions: [
            { action: 'Do not dial the telephone number provided in the notice.', priority: 'URGENT' },
            { action: 'Inspect your actual bank or card statement directly.', priority: 'URGENT' },
        ],
        heuristic_signals: { totalRawScore: 75 },
        is_public: true,
        is_ephemeral: false,
        upvotes: 15,
        created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
    {
        id: '11111111-2222-3333-4444-555555555555',
        user_id: null,
        content_type: 'URL',
        original_length: 35,
        redacted_content: 'https://chase-bank-verify-auth.top',
        analyzed_url: 'https://chase-bank-verify-auth.top',
        risk_score: 91,
        risk_level: 'DANGEROUS',
        category: 'PHISHING',
        summary: 'Lookalike domain spoofing Chase Bank using the suspicious .top generic top-level domain and multiple subdomains.',
        red_flags: [
            { title: 'Lookalike Brand Name', explanation: 'Uses "chase-bank" in hostname rather than official chase.com domain.', severity: 'HIGH' },
            { title: 'High-Risk TLD (.top)', explanation: 'Top-level domain frequently associated with spam and malicious landing pages.', severity: 'HIGH' },
        ],
        recommended_actions: [
            { action: 'Never open this link in your web browser.', priority: 'URGENT' },
            { action: 'Report domain to Google Safe Browsing and registrar.', priority: 'RECOMMENDED' },
        ],
        heuristic_signals: { totalRawScore: 88 },
        is_public: true,
        is_ephemeral: false,
        upvotes: 31,
        created_at: new Date(Date.now() - 3600000 * 36).toISOString(),
    },
];
for (const seed of SEED_SCANS) {
    memoryScansStore.set(seed.id, seed);
}
// ── Service Functions ─────────────────────────────────────────────────────────
export async function createScan(input) {
    const riskLevel = getRiskLevel(input.riskScore);
    const scanId = crypto.randomUUID();
    const now = new Date().toISOString();
    const record = {
        id: scanId,
        user_id: input.userId,
        content_type: input.contentType,
        original_length: input.originalLength,
        redacted_content: input.redactedContent,
        analyzed_url: input.analyzedUrl,
        risk_score: input.riskScore,
        risk_level: riskLevel,
        category: input.category,
        summary: input.summary,
        red_flags: input.redFlags,
        recommended_actions: input.recommendedActions,
        heuristic_signals: input.heuristicSignals,
        is_public: input.isPublic,
        is_ephemeral: input.isEphemeral,
        upvotes: 0,
        created_at: now,
    };
    // Always keep in memory store for session access
    memoryScansStore.set(scanId, record);
    if (input.isEphemeral) {
        return record;
    }
    // Attempt Supabase persistence with graceful fallback
    try {
        const { data, error } = await supabaseAdmin
            .from('scans')
            .insert({
            id: scanId,
            user_id: record.user_id,
            content_type: record.content_type,
            original_length: record.original_length,
            redacted_content: record.redacted_content,
            analyzed_url: record.analyzed_url,
            risk_score: record.risk_score,
            risk_level: record.risk_level,
            category: record.category,
            summary: record.summary,
            red_flags: record.red_flags,
            recommended_actions: record.recommended_actions,
            heuristic_signals: record.heuristic_signals,
            is_public: record.is_public,
            is_ephemeral: record.is_ephemeral,
            upvotes: 0,
        })
            .select()
            .single();
        if (!error && data) {
            memoryScansStore.set(data.id, data);
            return data;
        }
    }
    catch (err) {
        console.warn(`[ScanService] Supabase persistence skipped or failed (${err.message}). Stored in memory.`);
    }
    return record;
}
export async function getScanById(scanId) {
    // Check memory store first
    if (memoryScansStore.has(scanId)) {
        return memoryScansStore.get(scanId);
    }
    // Fallback to Supabase if not in memory
    try {
        const { data, error } = await supabaseAdmin
            .from('scans')
            .select('*')
            .eq('id', scanId)
            .single();
        if (!error && data) {
            memoryScansStore.set(data.id, data);
            return data;
        }
    }
    catch (err) {
        console.warn(`[ScanService] Supabase getScanById failed: ${err.message}`);
    }
    return null;
}
export async function getPublicFeed(params) {
    // Try Supabase first if available
    try {
        const offset = (params.page - 1) * params.limit;
        let query = supabaseAdmin
            .from('scans')
            .select('*', { count: 'exact' })
            .eq('is_public', true)
            .order('created_at', { ascending: false })
            .range(offset, offset + params.limit - 1);
        if (params.category)
            query = query.eq('category', params.category);
        if (params.search)
            query = query.ilike('summary', `%${params.search}%`);
        const { data, error, count } = await query;
        if (!error && data && data.length > 0) {
            return { scans: data, total: count || data.length };
        }
    }
    catch {
        // Supabase unavailable — fall back to in-memory store
    }
    // In-memory query
    let allPublic = Array.from(memoryScansStore.values()).filter((s) => s.is_public);
    if (params.category) {
        allPublic = allPublic.filter((s) => s.category === params.category);
    }
    if (params.search) {
        const term = params.search.toLowerCase();
        allPublic = allPublic.filter((s) => s.summary.toLowerCase().includes(term) ||
            s.category.toLowerCase().includes(term) ||
            (s.analyzed_url && s.analyzed_url.toLowerCase().includes(term)));
    }
    // Sort descending by created_at
    allPublic.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const total = allPublic.length;
    const start = (params.page - 1) * params.limit;
    const paged = allPublic.slice(start, start + params.limit);
    return { scans: paged, total };
}
export async function getUserHistory(userId, page = 1, limit = 20) {
    try {
        const offset = (page - 1) * limit;
        const { data, error, count } = await supabaseAdmin
            .from('scans')
            .select('*', { count: 'exact' })
            .eq('user_id', userId)
            .eq('is_ephemeral', false)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
        if (!error && data) {
            return { scans: data, total: count || 0 };
        }
    }
    catch {
        // Fall back to memory
    }
    const userScans = Array.from(memoryScansStore.values()).filter((s) => s.user_id === userId && !s.is_ephemeral);
    userScans.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const total = userScans.length;
    const start = (page - 1) * limit;
    const paged = userScans.slice(start, start + limit);
    return { scans: paged, total };
}
export async function toggleUpvote(scanId, userId) {
    const upvoteKey = `${scanId}:${userId}`;
    // Try Supabase first
    try {
        const { data: existing } = await supabaseAdmin
            .from('scan_upvotes')
            .select('id')
            .eq('scan_id', scanId)
            .eq('user_id', userId)
            .single();
        if (existing) {
            await supabaseAdmin.from('scan_upvotes').delete().eq('scan_id', scanId).eq('user_id', userId);
            await supabaseAdmin.rpc('decrement_upvote', { scan_id_input: scanId });
            const { data: scan } = await supabaseAdmin.from('scans').select('upvotes').eq('id', scanId).single();
            return { upvoted: false, upvotes: scan?.upvotes || 0 };
        }
        else {
            await supabaseAdmin.from('scan_upvotes').insert({ scan_id: scanId, user_id: userId });
            await supabaseAdmin.rpc('increment_upvote', { scan_id_input: scanId });
            const { data: scan } = await supabaseAdmin.from('scans').select('upvotes').eq('id', scanId).single();
            return { upvoted: true, upvotes: scan?.upvotes || 0 };
        }
    }
    catch {
        // In-memory fallback
        const scan = memoryScansStore.get(scanId);
        if (!scan)
            return { upvoted: false, upvotes: 0 };
        if (memoryUpvotesStore.has(upvoteKey)) {
            memoryUpvotesStore.delete(upvoteKey);
            scan.upvotes = Math.max(0, scan.upvotes - 1);
            return { upvoted: false, upvotes: scan.upvotes };
        }
        else {
            memoryUpvotesStore.add(upvoteKey);
            scan.upvotes += 1;
            return { upvoted: true, upvotes: scan.upvotes };
        }
    }
}
export async function togglePublish(scanId, userId) {
    const scan = memoryScansStore.get(scanId);
    if (scan && scan.user_id === userId) {
        scan.is_public = !scan.is_public;
    }
    try {
        const { data, error } = await supabaseAdmin
            .from('scans')
            .select('is_public, user_id')
            .eq('id', scanId)
            .single();
        if (!error && data && data.user_id === userId) {
            const nextPublic = !data.is_public;
            await supabaseAdmin.from('scans').update({ is_public: nextPublic }).eq('id', scanId);
            return { isPublic: nextPublic };
        }
    }
    catch {
        // Return memory status
    }
    return { isPublic: scan?.is_public ?? true };
}
export async function getAdminStats() {
    try {
        const { count: totalScans } = await supabaseAdmin
            .from('scans')
            .select('*', { count: 'exact', head: true });
        const { data: categoryData } = await supabaseAdmin.from('scans').select('category');
        const categoryBreakdown = {};
        for (const row of categoryData || []) {
            categoryBreakdown[row.category] = (categoryBreakdown[row.category] || 0) + 1;
        }
        const { data: riskData } = await supabaseAdmin.from('scans').select('risk_level');
        const riskBreakdown = {};
        for (const row of riskData || []) {
            riskBreakdown[row.risk_level] = (riskBreakdown[row.risk_level] || 0) + 1;
        }
        const { data: recentScans } = await supabaseAdmin
            .from('scans')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);
        if (totalScans !== null && totalScans > 0) {
            const flagCounts = {};
            for (const scan of recentScans || []) {
                const flags = (scan.red_flags || []);
                for (const flag of flags) {
                    if (flag?.title)
                        flagCounts[flag.title] = (flagCounts[flag.title] || 0) + 1;
                }
            }
            const topRedFlags = Object.entries(flagCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)
                .map(([flag]) => flag);
            return {
                totalScans,
                categoryBreakdown,
                riskBreakdown,
                recentScans: (recentScans || []),
                topRedFlags,
            };
        }
    }
    catch {
        // Fall through to in-memory stats
    }
    // Compute from memoryScansStore
    const allScans = Array.from(memoryScansStore.values());
    const categoryBreakdown = {};
    const riskBreakdown = {};
    const flagCounts = {};
    for (const scan of allScans) {
        categoryBreakdown[scan.category] = (categoryBreakdown[scan.category] || 0) + 1;
        riskBreakdown[scan.risk_level] = (riskBreakdown[scan.risk_level] || 0) + 1;
        const flags = (scan.red_flags || []);
        for (const flag of flags) {
            if (flag?.title)
                flagCounts[flag.title] = (flagCounts[flag.title] || 0) + 1;
        }
    }
    const topRedFlags = Object.entries(flagCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([flag]) => flag);
    const recentScans = [...allScans]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);
    return {
        totalScans: allScans.length,
        categoryBreakdown,
        riskBreakdown,
        recentScans,
        topRedFlags,
    };
}
//# sourceMappingURL=scanService.js.map