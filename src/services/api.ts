import { supabase } from '../utils/supabaseClient';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

/**
 * Gets the current session's access token for authenticated API calls.
 */
async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    return { Authorization: `Bearer ${session.access_token}` };
  }
  return {};
}

/**
 * Submits content for scam analysis.
 */
export async function analyzeContent(payload: {
  content: string;
  contentType: 'TEXT' | 'URL';
  isEphemeral: boolean;
  isPublic: boolean;
}) {
  const authHeaders = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Analysis failed.' }));
    throw new Error(errorData.error || `HTTP ${res.status}`);
  }

  return res.json();
}

/**
 * Fetches a single scan report by ID.
 */
export async function getScan(id: string) {
  const authHeaders = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/scans/${id}`, {
    headers: authHeaders,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Failed to load report.' }));
    throw new Error(errorData.error || `HTTP ${res.status}`);
  }

  return res.json();
}

/**
 * Fetches the public community threat feed.
 */
export async function getPublicFeed(params: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.category) searchParams.set('category', params.category);
  if (params.search) searchParams.set('search', params.search);

  const res = await fetch(`${API_BASE}/scans/feed?${searchParams.toString()}`);

  if (!res.ok) {
    throw new Error('Failed to load threat feed.');
  }

  return res.json();
}

/**
 * Fetches the authenticated user's scan history.
 */
export async function getUserHistory(page: number = 1) {
  const authHeaders = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/scans/user/history?page=${page}`, {
    headers: authHeaders,
  });

  if (!res.ok) {
    throw new Error('Failed to load scan history.');
  }

  return res.json();
}

/**
 * Toggles upvote on a public scan.
 */
export async function toggleUpvote(scanId: string) {
  const authHeaders = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/scans/${scanId}/upvote`, {
    method: 'POST',
    headers: authHeaders,
  });

  if (!res.ok) {
    throw new Error('Failed to toggle upvote.');
  }

  return res.json();
}

/**
 * Toggles public visibility for a scan.
 */
export async function togglePublish(scanId: string) {
  const authHeaders = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/scans/${scanId}/publish`, {
    method: 'POST',
    headers: authHeaders,
  });

  if (!res.ok) {
    throw new Error('Failed to toggle publish status.');
  }

  return res.json();
}

/**
 * Fetches admin dashboard stats.
 */
export async function getAdminStats() {
  const authHeaders = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/admin/stats`, {
    headers: authHeaders,
  });

  if (!res.ok) {
    throw new Error('Failed to load admin stats.');
  }

  return res.json();
}
