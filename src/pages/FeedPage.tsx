import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Globe,
  Search,
  Filter,
  Loader2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import ThreatFeedCard from '../components/ThreatFeedCard';
import { getPublicFeed, toggleUpvote } from '../services/api';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'PHISHING', label: 'Phishing' },
  { value: 'JOB_SCAM', label: 'Job Scam' },
  { value: 'IMPERSONATION', label: 'Impersonation' },
  { value: 'FINANCIAL_CRYPTO', label: 'Financial / Crypto' },
  { value: 'ECOMMERCE_INVOICE', label: 'E-Commerce' },
  { value: 'OTHER', label: 'Other' },
];

export default function FeedPage() {
  const navigate = useNavigate();
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getPublicFeed({
        page,
        limit: 12,
        category: category || undefined,
        search: search || undefined,
      });
      if (res.success) {
        setScans(res.data.scans);
        setTotalPages(res.data.totalPages);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, category, search]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleUpvote = async (scanId: string) => {
    try {
      await toggleUpvote(scanId);
      fetchFeed();
    } catch {
      // Silent fail for unauthenticated users
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 mb-4">
            <Globe className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-medium text-violet-300">Community Intelligence</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            <span className="gradient-text">Community Threat Feed</span>
          </h1>
          <p className="text-surface-400 text-lg max-w-xl mx-auto">
            Anonymized, crowd-sourced scam intelligence. All PII has been stripped.
          </p>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col md:flex-row gap-4 mb-8"
        >
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search scam patterns..."
              className="input-field pl-11 pr-4"
            />
          </form>

          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="input-field pl-11 pr-10 appearance-none cursor-pointer min-w-[200px]"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Feed Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
            <p className="text-rose-400">{error}</p>
          </div>
        ) : scans.length === 0 ? (
          <div className="text-center py-20">
            <Globe className="w-10 h-10 text-surface-600 mx-auto mb-3" />
            <p className="text-surface-500">No scam reports found. Be the first to contribute!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {scans.map((scan: any) => (
              <ThreatFeedCard
                key={scan.id}
                id={scan.id}
                summary={scan.summary}
                category={scan.category}
                riskScore={scan.risk_score}
                riskLevel={scan.risk_level}
                upvotes={scan.upvotes}
                createdAt={scan.created_at}
                onUpvote={handleUpvote}
                onClick={(id) => navigate(`/report/${id}`)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-ghost disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <span className="text-sm text-surface-400 font-mono">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn-ghost disabled:opacity-30"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
