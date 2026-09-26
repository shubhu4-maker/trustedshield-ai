import { motion } from 'framer-motion';
import {
  Shield,
  Lock,
  Eye,
  Database,
  Server,
  Fingerprint,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const PRIVACY_PILLARS = [
  {
    icon: Fingerprint,
    title: 'Client-Side PII Scrubbing',
    description:
      'Before any data leaves your browser, our regex engine scans for and removes emails, phone numbers, SSNs, credit card numbers, and IP addresses. These are replaced with safe tokens like [REDACTED_EMAIL].',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  {
    icon: Server,
    title: 'Server-Side Re-Verification',
    description:
      'Even after client-side scrubbing, our server runs a second pass of PII detection as a defense-in-depth measure. No raw personal data ever reaches our AI models or database.',
    color: 'text-brand-400',
    bg: 'bg-brand-500/10',
    border: 'border-brand-500/20',
  },
  {
    icon: Eye,
    title: 'Zero-Retention Ephemeral Mode',
    description:
      'Enable "Zero-Retention Mode" and your analysis runs entirely in memory. No database writes, no logs, no traces. The result exists only in your browser session.',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
  },
  {
    icon: Database,
    title: 'Encrypted Database Storage',
    description:
      'For users who opt-in to saving scans, only PII-scrubbed content is stored in Supabase PostgreSQL with Row Level Security (RLS) ensuring you can only access your own data.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  {
    icon: Lock,
    title: 'API Key Isolation',
    description:
      'Your AI analysis is powered by Gemini 2.5 Flash, but the API key is stored exclusively on our backend server. It is never exposed to the frontend or transmitted to your browser.',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
  },
  {
    icon: Shield,
    title: 'Security Headers & Rate Limiting',
    description:
      'Our server uses Helmet.js for strict Content Security Policy, HSTS, X-Frame-Options, and rate limiting (10 analysis requests/min) to prevent abuse and ensure service integrity.',
    color: 'text-teal-400',
    bg: 'bg-teal-500/10',
    border: 'border-teal-500/20',
  },
];

const DATA_FLOW = [
  'You paste a message or URL into the analyzer',
  'Your browser scrubs all PII (emails, phones, SSNs, etc.)',
  'You see a visual preview of what data will be sent',
  'Only the scrubbed content is sent to our secure backend',
  'The server re-verifies PII removal (defense-in-depth)',
  'Heuristic rules and Gemini AI analyze the cleaned content',
  'Results are returned — no raw PII is stored anywhere',
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-300">Privacy & Security Center</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-white">Your Data, </span>
            <span className="gradient-text">Your Control</span>
          </h1>
          <p className="text-surface-400 text-lg max-w-2xl mx-auto leading-relaxed">
            TrustShield AI is built on a foundational principle: <strong className="text-white">you should never have to sacrifice privacy for security</strong>.
            Here's exactly how we protect your data at every step.
          </p>
        </motion.div>

        {/* Privacy Pillars */}
        <div className="space-y-5 mb-16">
          {PRIVACY_PILLARS.map((pillar, i) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`glass-card p-6 flex items-start gap-5`}
            >
              <div className={`w-12 h-12 rounded-xl ${pillar.bg} border ${pillar.border} flex items-center justify-center shrink-0`}>
                <pillar.icon className={`w-6 h-6 ${pillar.color}`} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">{pillar.title}</h3>
                <p className="text-surface-400 leading-relaxed">{pillar.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Data Flow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-8 mb-16"
        >
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-brand-500" />
            How Your Data Flows
          </h2>
          <div className="space-y-4">
            {DATA_FLOW.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-4"
              >
                <div className="w-8 h-8 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-brand-400">{i + 1}</span>
                </div>
                <p className="text-surface-300 pt-1">{step}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Commitments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-8 mb-16"
        >
          <h2 className="text-xl font-bold text-white mb-6">Our Commitments</h2>
          <div className="space-y-3">
            {[
              'We never sell, share, or monetize your data.',
              'We never store raw PII — only redacted content.',
              'We never track you across sessions or sites.',
              'We use Gemini AI only for analysis — never for training.',
              'Ephemeral mode guarantees zero database persistence.',
              'All stored data is isolated with Row Level Security.',
            ].map((commitment, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-surface-300">{commitment}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <div className="text-center">
          <Link to="/analyze" className="btn-primary text-lg px-10 py-4">
            <Shield className="w-5 h-5" />
            Start a Private Scan
          </Link>
        </div>
      </div>
    </div>
  );
}
