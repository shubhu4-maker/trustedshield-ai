import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Brain,
  Cpu,
  Target,
  Loader2,
  AlertTriangle,
  ShieldCheck,
  Globe,
  Info,
  CheckCircle2,
} from 'lucide-react';
import RiskGauge from '../components/RiskGauge';
import RedFlagCard from '../components/RedFlagCard';
import ActionChecklist from '../components/ActionChecklist';
import ReportExporter from '../components/ReportExporter';
import { getScan } from '../services/api';

interface ScanData {
  id: string;
  riskScore: number;
  riskLevel: string;
  category: string;
  summary: string;
  redFlags: Array<{
    title: string;
    explanation: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    source?: 'HEURISTIC' | 'AI';
  }>;
  recommendedActions: Array<{ action: string; priority: 'URGENT' | 'RECOMMENDED' | 'OPTIONAL' }>;
  psychologicalTriggers?: string[];
  heuristicScore?: number;
  aiScore?: number;
  heuristicFlags?: string[];
  analyzedUrl?: string | null;
  analyzed_url?: string | null;
  isAiAvailable?: boolean;
  aiEngine?: string;
  uncertaintyNote?: string;
  createdAt?: string;
  created_at?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  PHISHING: 'Phishing & Credential Harvest',
  JOB_SCAM: 'Employment & Job Scam',
  IMPERSONATION: 'Financial & Impersonation',
  FINANCIAL_CRYPTO: 'Cryptocurrency & Investment Scam',
  ECOMMERCE_INVOICE: 'E-Commerce & Fake Invoice',
  OTHER: 'Other / Unclassified',
};

export default function ReportPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [scanData, setScanData] = useState<ScanData | null>(
    (location.state as any)?.scanData || null
  );
  const [loading, setLoading] = useState(!scanData);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!scanData && id) {
      setLoading(true);

      // Check guest localStorage cache first
      try {
        const stored = JSON.parse(localStorage.getItem('trustshield_recent_scans') || '[]');
        const match = stored.find((s: any) => s.id === id);
        if (match) {
          setScanData(match);
          setLoading(false);
          return;
        }
      } catch {
        // Continue to API
      }

      getScan(id)
        .then((res) => {
          if (res.success && res.data) {
            setScanData(res.data);
          }
        })
        .catch((err) => setError(err.message || 'Report not found.'))
        .finally(() => setLoading(false));
    }
  }, [id, scanData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (error || !scanData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Report Not Found</h2>
        <p className="text-surface-400 max-w-md">{error || 'This report may have been created in zero-retention mode or has expired.'}</p>
        <Link to="/analyze" className="btn-primary mt-2">
          <ArrowLeft className="w-4 h-4" /> Start New Analysis
        </Link>
      </div>
    );
  }

  const createdAt = scanData.createdAt || scanData.created_at || new Date().toISOString();
  const targetUrl = scanData.analyzedUrl || scanData.analyzed_url;
  const isAiUnavailable = scanData.isAiAvailable === false;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Link & Export */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between mb-8 flex-wrap gap-3"
        >
          <Link to="/analyze" className="btn-ghost text-sm">
            <ArrowLeft className="w-4 h-4" /> New Scan
          </Link>
          <ReportExporter reportData={scanData} />
        </motion.div>

        {/* AI Offline / Uncertainty Notification */}
        {isAiUnavailable && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm flex items-start gap-3"
          >
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-200">
                Rule-Based Fallback Mode Active
              </p>
              <p className="text-surface-300 text-xs mt-1 leading-relaxed">
                Gemini AI reasoning was temporarily unconfigured or unreachable. This threat evaluation was performed exclusively using our deterministic heuristic rules engine.
              </p>
            </div>
          </motion.div>
        )}

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">
            <span className="gradient-text">Safety Advisory Report</span>
          </h1>
          <p className="text-surface-500 text-sm font-mono">
            Report ID: {scanData.id.slice(0, 8)}… • {new Date(createdAt).toLocaleString()}
          </p>
        </motion.div>

        {/* Risk Gauge + Category */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-8 flex flex-col items-center mb-8"
        >
          <RiskGauge score={scanData.riskScore} size={220} />
          <div className="mt-4 badge-category">
            {CATEGORY_LABELS[scanData.category] || scanData.category}
          </div>

          {targetUrl && (
            <div className="mt-4 px-4 py-2 rounded-lg bg-surface-900 border border-surface-800 text-xs text-surface-400 flex items-center gap-2 max-w-full">
              <Globe className="w-3.5 h-3.5 text-brand-400 shrink-0" />
              <span className="truncate">Analyzed Domain / URL: <strong className="text-surface-200 font-mono">{targetUrl}</strong></span>
              <span className="text-[10px] text-surface-500 hidden sm:inline">(Lexical evaluation only)</span>
            </div>
          )}
        </motion.div>

        {/* Score Breakdown (Heuristic vs AI) */}
        {(scanData.heuristicScore !== undefined || scanData.aiScore !== undefined) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="grid grid-cols-2 gap-4 mb-8"
          >
            <div className="glass-card p-5 flex items-center gap-4">
              <Cpu className="w-8 h-8 text-amber-400 shrink-0" />
              <div>
                <p className="text-2xl font-bold text-white font-mono">
                  {scanData.heuristicScore ?? '–'}
                </p>
                <p className="text-xs text-surface-400 font-medium">Heuristic Score (40%)</p>
                <p className="text-[10px] text-surface-500 mt-0.5">Deterministic syntax & regex rules</p>
              </div>
            </div>
            <div className="glass-card p-5 flex items-center gap-4">
              <Brain className="w-8 h-8 text-brand-400 shrink-0" />
              <div>
                <p className="text-2xl font-bold text-white font-mono">
                  {isAiUnavailable ? 'Offline' : (scanData.aiScore ?? '–')}
                </p>
                <p className="text-xs text-surface-400 font-medium">
                  {isAiUnavailable ? 'AI Unavailable' : 'AI Score (60%)'}
                </p>
                <p className="text-[10px] text-surface-500 mt-0.5">
                  {isAiUnavailable ? 'Heuristic fallback applied' : 'Google Gemini 2.5 Flash'}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card p-6 mb-8"
        >
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <Target className="w-5 h-5 text-brand-400" />
            Executive Assessment Summary
          </h2>
          <p className="text-surface-300 leading-relaxed text-sm md:text-base">{scanData.summary}</p>
        </motion.div>

        {/* Red Flags with Heuristic vs AI source indicator */}
        {scanData.redFlags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">
                🚩 Red Flags Detected ({scanData.redFlags.length})
              </h2>
              <span className="text-xs text-surface-500">
                Click to expand explanations
              </span>
            </div>
            <div className="space-y-3">
              {scanData.redFlags.map((flag, i) => (
                <RedFlagCard
                  key={i}
                  title={flag.title}
                  explanation={flag.explanation}
                  severity={flag.severity}
                  source={flag.source}
                  index={i}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Psychological Triggers */}
        {scanData.psychologicalTriggers && scanData.psychologicalTriggers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="glass-card p-6 mb-8"
          >
            <h2 className="text-lg font-bold text-white mb-3">
              🧠 Psychological Manipulation Tactics
            </h2>
            <div className="flex flex-wrap gap-2">
              {scanData.psychologicalTriggers.map((trigger, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium"
                >
                  {trigger}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Action Checklist */}
        {scanData.recommendedActions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="glass-card p-6 mb-8"
          >
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Protective Action Checklist
            </h2>
            <ActionChecklist actions={scanData.recommendedActions} />
          </motion.div>
        )}

        {/* Disclaimer & Limitations */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75 }}
          className="p-5 rounded-xl bg-surface-900/60 border border-surface-800 text-surface-400 text-xs space-y-2 mb-8"
        >
          <div className="flex items-center gap-2 text-surface-300 font-semibold">
            <Info className="w-4 h-4 text-brand-400" />
            <span>Advisory Notice & Model Limitations</span>
          </div>
          <p className="leading-relaxed">
            TrustShield AI is an automated advisory detection system designed to assist users in identifying common manipulation, social engineering, and fraud patterns. It does not constitute a legal, financial, or certified security audit.
          </p>
          <p className="leading-relaxed">
            <strong>Non-Execution Safety:</strong> URLs submitted for analysis are examined purely through static lexical and structural heuristics. No remote HTTP queries or payload executions are performed against untrusted links.
          </p>
          <p className="leading-relaxed">
            Zero-day phishing tactics and sophisticated targeted spear-phishing may evade automated detection. When in doubt, contact the alleged sender or financial institution directly using trusted official contact channels.
          </p>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8"
        >
          <Link to="/analyze" className="btn-primary">
            <ArrowLeft className="w-4 h-4" />
            Analyze Another Suspicious Message
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
