import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  BarChart3,
  Activity,
  AlertTriangle,
  Loader2,
  TrendingUp,
  Lock,
  LogIn,
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { getAdminStats } from '../services/api';
import type { User } from '@supabase/supabase-js';

const CATEGORY_COLORS: Record<string, string> = {
  PHISHING: 'bg-rose-500',
  JOB_SCAM: 'bg-amber-500',
  IMPERSONATION: 'bg-violet-500',
  FINANCIAL_CRYPTO: 'bg-orange-500',
  ECOMMERCE_INVOICE: 'bg-teal-500',
  OTHER: 'bg-surface-500',
};

const CATEGORY_LABELS: Record<string, string> = {
  PHISHING: 'Phishing',
  JOB_SCAM: 'Job Scam',
  IMPERSONATION: 'Impersonation',
  FINANCIAL_CRYPTO: 'Crypto / Financial',
  ECOMMERCE_INVOICE: 'E-Commerce',
  OTHER: 'Other',
};

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchStats();
      } else {
        setLoading(false);
      }
    });
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await getAdminStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-12 text-center max-w-md"
        >
          <Lock className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-3">Admin Access Required</h2>
          <p className="text-surface-400">
            This portal is restricted to administrators.
          </p>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <AlertTriangle className="w-10 h-10 text-rose-400 mb-3" />
        <p className="text-rose-400">{error}</p>
      </div>
    );
  }

  const maxCategoryCount = Math.max(
    ...Object.values(stats?.categoryBreakdown || { x: 1 }).map(Number),
    1
  );

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="w-6 h-6 text-brand-500" />
            <h1 className="text-3xl font-bold gradient-text">Threat Intelligence Admin</h1>
          </div>
          <p className="text-surface-400">System metrics and scam analytics overview.</p>
        </motion.div>

        {/* Stat Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid sm:grid-cols-3 gap-5 mb-10"
        >
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <Activity className="w-5 h-5 text-brand-400" />
              <span className="text-sm text-surface-400">Total Scans</span>
            </div>
            <p className="text-3xl font-bold text-white font-mono">
              {stats?.totalScans?.toLocaleString() || 0}
            </p>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <span className="text-sm text-surface-400">Dangerous Scans</span>
            </div>
            <p className="text-3xl font-bold text-white font-mono">
              {stats?.riskBreakdown?.DANGEROUS || 0}
            </p>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span className="text-sm text-surface-400">Safe Scans</span>
            </div>
            <p className="text-3xl font-bold text-white font-mono">
              {stats?.riskBreakdown?.SAFE || 0}
            </p>
          </div>
        </motion.div>

        {/* Category Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 mb-10"
        >
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-brand-500" />
            <h2 className="text-lg font-bold text-white">Scam Category Distribution</h2>
          </div>

          <div className="space-y-4">
            {Object.entries(stats?.categoryBreakdown || {}).map(([cat, count]: [string, any]) => (
              <div key={cat} className="flex items-center gap-4">
                <span className="text-sm text-surface-400 w-32 shrink-0">
                  {CATEGORY_LABELS[cat] || cat}
                </span>
                <div className="flex-1 h-6 bg-surface-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / maxCategoryCount) * 100}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-full rounded-full ${CATEGORY_COLORS[cat] || 'bg-surface-500'}`}
                  />
                </div>
                <span className="text-sm text-surface-300 font-mono w-10 text-right">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Red Flags */}
        {stats?.topRedFlags?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6"
          >
            <h2 className="text-lg font-bold text-white mb-4">🚩 Most Common Red Flags</h2>
            <div className="space-y-2">
              {stats.topRedFlags.map((flag: string, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-surface-900/50 border border-surface-800"
                >
                  <span className="text-xs text-surface-500 font-mono w-6">#{i + 1}</span>
                  <span className="text-sm text-surface-300">{flag}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
