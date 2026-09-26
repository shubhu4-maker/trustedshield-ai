import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Clock,
  Shield,
  Trash2,
  ExternalLink,
  Loader2,
  ShieldX,
  LogIn,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { getUserHistory } from '../services/api';
import type { User } from '@supabase/supabase-js';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchCloudHistory();
        } else {
          loadGuestHistory();
        }
      })
      .catch(() => {
        loadGuestHistory();
      });

    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          setIsGuest(false);
          fetchCloudHistory();
        } else {
          loadGuestHistory();
        }
      });
      return () => subscription.unsubscribe();
    } catch {
      loadGuestHistory();
    }
  }, []);

  const loadGuestHistory = () => {
    setIsGuest(true);
    try {
      const raw = localStorage.getItem('trustshield_recent_scans');
      if (raw) {
        const parsed = JSON.parse(raw);
        setScans(parsed);
      } else {
        setScans([]);
      }
    } catch {
      setScans([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCloudHistory = async () => {
    setLoading(true);
    try {
      const res = await getUserHistory();
      if (res.success && res.data.scans.length > 0) {
        setScans(res.data.scans);
      } else {
        // Fall back to guest storage if cloud vault is empty
        loadGuestHistory();
      }
    } catch {
      loadGuestHistory();
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    localStorage.removeItem('trustshield_recent_scans');
    setScans([]);
  };

  const getRiskBadgeClass = (level: string) => {
    switch (level) {
      case 'SAFE':
        return 'badge-safe';
      case 'SUSPICIOUS':
        return 'badge-suspicious';
      case 'DANGEROUS':
        return 'badge-dangerous';
      default:
        return 'badge';
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <LayoutDashboard className="w-7 h-7 text-brand-400" />
              <h1 className="text-3xl font-bold gradient-text">Threat History Vault</h1>
            </div>
            <p className="text-surface-400 text-sm">
              {scans.length} report{scans.length !== 1 ? 's' : ''} in {isGuest ? 'local session vault' : 'cloud account'}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {scans.length > 0 && (
              <button
                type="button"
                onClick={handleClearHistory}
                className="btn-ghost text-xs text-surface-400 hover:text-rose-400 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear Local History
              </button>
            )}
            <button
              onClick={() => navigate('/analyze')}
              className="btn-primary text-sm py-2 px-4"
            >
              <Shield className="w-4 h-4" />
              New Scan
            </button>
          </div>
        </motion.div>

        {/* Guest Banner */}
        {isGuest && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 rounded-xl bg-surface-900 border border-surface-800 text-sm flex items-center justify-between flex-wrap gap-4"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-brand-400 shrink-0" />
              <div>
                <span className="font-semibold text-white">Local Guest Session</span>
                <p className="text-xs text-surface-400">
                  Showing scans conducted from this device. Sign in with Supabase to sync your advisories securely across devices.
                </p>
              </div>
            </div>
            <span className="text-xs text-brand-400 font-medium">Guest Mode</span>
          </motion.div>
        )}

        {/* Scans List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          </div>
        ) : scans.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-12 text-center max-w-lg mx-auto"
          >
            <ShieldX className="w-12 h-12 text-surface-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">No Saved Scans Found</h2>
            <p className="text-surface-400 text-sm mb-6 leading-relaxed">
              When you analyze messages or URLs with "Zero-Retention Mode" off, safety reports will appear here in your personal vault.
            </p>
            <button onClick={() => navigate('/analyze')} className="btn-primary">
              <Shield className="w-4 h-4" /> Launch First Analysis
            </button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {scans.map((scan: any, i: number) => {
              const score = scan.riskScore ?? scan.risk_score ?? 0;
              const level = scan.riskLevel ?? scan.risk_level ?? 'SAFE';
              const cat = scan.category || 'OTHER';
              const created = scan.createdAt || scan.created_at || new Date().toISOString();

              return (
                <motion.div
                  key={scan.id || i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="glass-card p-5 flex items-center gap-4 cursor-pointer hover:border-brand-500/30 transition-all duration-200"
                  onClick={() => navigate(`/report/${scan.id}`, { state: { scanData: scan } })}
                >
                  <div className="w-12 h-12 rounded-xl bg-surface-900 border border-surface-800 flex items-center justify-center shrink-0">
                    <span className="text-lg font-bold font-mono text-white">
                      {score}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={getRiskBadgeClass(level)}>
                        {level}
                      </span>
                      <span className="badge-category text-[10px]">{cat}</span>
                    </div>
                    <p className="text-sm text-surface-300 truncate">{scan.summary}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-surface-500 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {new Date(created).toLocaleDateString()}
                    </span>
                    <ExternalLink className="w-4 h-4 text-surface-500" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
