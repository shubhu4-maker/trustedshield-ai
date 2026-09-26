import { motion } from 'framer-motion';
import { ThumbsUp, Tag, Clock, ShieldAlert } from 'lucide-react';

interface ThreatFeedCardProps {
  id: string;
  summary: string;
  category: string;
  riskScore: number;
  riskLevel: string;
  upvotes: number;
  createdAt: string;
  onUpvote?: (id: string) => void;
  onClick?: (id: string) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  PHISHING: 'Phishing',
  JOB_SCAM: 'Job Scam',
  IMPERSONATION: 'Impersonation',
  FINANCIAL_CRYPTO: 'Financial / Crypto',
  ECOMMERCE_INVOICE: 'E-Commerce / Invoice',
  OTHER: 'Other',
};

export default function ThreatFeedCard({
  id,
  summary,
  category,
  riskScore,
  riskLevel,
  upvotes,
  createdAt,
  onUpvote,
  onClick,
}: ThreatFeedCardProps) {
  const riskBadgeClass =
    riskLevel === 'SAFE'
      ? 'badge-safe'
      : riskLevel === 'SUSPICIOUS'
      ? 'badge-suspicious'
      : 'badge-dangerous';

  const timeAgo = getTimeAgo(createdAt);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="glass-card p-5 cursor-pointer group"
      onClick={() => onClick?.(id)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-surface-500" />
          <span className="badge-category text-[10px]">
            {CATEGORY_LABELS[category] || category}
          </span>
        </div>
        <span className={riskBadgeClass}>{riskScore}</span>
      </div>

      {/* Summary */}
      <p className="text-sm text-surface-300 leading-relaxed mb-4 line-clamp-3 group-hover:text-surface-200 transition-colors">
        {summary}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-surface-800">
        <div className="flex items-center gap-1.5 text-surface-500 text-xs">
          <Clock className="w-3 h-3" />
          {timeAgo}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onUpvote?.(id);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                     text-surface-400 hover:text-brand-400 hover:bg-brand-500/10
                     transition-all duration-200 active:scale-95"
        >
          <ThumbsUp className="w-3.5 h-3.5" />
          {upvotes}
        </button>
      </div>
    </motion.div>
  );
}

function getTimeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 30) return `${diffDay}d ago`;
  return new Date(dateStr).toLocaleDateString();
}
