import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  ScanSearch,
  Lock,
  Zap,
  Users,
  ArrowRight,
  CheckCircle2,
  Eye,
  Brain,
  Globe,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Lock,
    title: 'Privacy-First Analysis',
    description: 'All personal data (emails, phones, SSNs) is scrubbed locally in your browser before any analysis begins. Zero PII leaves your device.',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    icon: Brain,
    title: 'AI-Powered Detection',
    description: 'Gemini 2.5 Flash AI combined with deterministic heuristic rules delivers a hybrid risk score with plain-English explanations.',
    gradient: 'from-brand-500 to-indigo-600',
  },
  {
    icon: Eye,
    title: 'Transparent Scoring',
    description: 'See exactly why something is flagged. Every red flag, manipulation tactic, and risk factor is explained in simple terms.',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    icon: Globe,
    title: 'Community Threat Feed',
    description: 'Access a crowd-sourced, fully anonymized feed of the latest scam patterns. Contribute without compromising your privacy.',
    gradient: 'from-violet-500 to-purple-600',
  },
];

const THREAT_TYPES = [
  'Phishing Emails',
  'Job Scams',
  'Impersonation',
  'Crypto Fraud',
  'Fake Invoices',
  'SMS Scams',
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-grid pointer-events-none" />
      <div className="fixed inset-0 bg-radial-glow pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 mb-8">
              <ShieldCheck className="w-4 h-4 text-brand-400" />
              <span className="text-sm font-medium text-brand-300">Privacy-First Scam Detection</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 tracking-tight">
              <span className="text-white">Detect Scams</span>
              <br />
              <span className="gradient-text">Before They Strike</span>
            </h1>

            <p className="text-lg md:text-xl text-surface-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Paste any suspicious message, email, or URL and get an instant AI-powered security assessment —{' '}
              <span className="text-white font-medium">without exposing your personal data</span>.
            </p>

            {/* CTAs */}
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link to="/analyze" className="btn-primary text-base px-8 py-4 text-lg">
                <ScanSearch className="w-5 h-5" />
                Scan Now — Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/privacy" className="btn-secondary text-base px-8 py-4">
                <Lock className="w-5 h-5" />
                How We Protect You
              </Link>
            </div>

            {/* Trust signals */}
            <div className="flex items-center justify-center gap-6 mt-10 flex-wrap">
              {['Zero PII Storage', 'Client-Side Scrubbing', 'Ephemeral Mode'].map((signal) => (
                <div key={signal} className="flex items-center gap-1.5 text-surface-500 text-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  {signal}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Threat Types Ticker */}
      <section className="py-8 border-y border-surface-800/50 overflow-hidden">
        <div className="flex animate-[gradient_20s_linear_infinite]">
          <div className="flex gap-8 shrink-0 px-4 items-center">
            {[...THREAT_TYPES, ...THREAT_TYPES].map((type, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-surface-900 border border-surface-800 whitespace-nowrap"
              >
                <Zap className="w-3.5 h-3.5 text-brand-500" />
                <span className="text-sm text-surface-300 font-medium">{type}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-white">How </span>
              <span className="gradient-text">TrustShield AI</span>
              <span className="text-white"> Works</span>
            </h2>
            <p className="text-surface-400 text-lg max-w-xl mx-auto">
              A multi-layered defense system designed for everyday users.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="glass-card p-8 group"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5
                    shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-surface-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Steps */}
      <section className="py-24 px-4 border-t border-surface-800/50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Three Steps to Safety
            </h2>
          </motion.div>

          <div className="space-y-8">
            {[
              {
                step: '01',
                title: 'Paste Suspicious Content',
                desc: 'Copy any message, email, job offer, or URL that looks suspicious into the analyzer.',
              },
              {
                step: '02',
                title: 'Automatic PII Protection',
                desc: 'Our engine instantly detects and removes personal information before any analysis occurs.',
              },
              {
                step: '03',
                title: 'Get Your Safety Report',
                desc: 'Receive a detailed risk score, red flag breakdown, and actionable safety steps — all in plain English.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="flex items-start gap-6 glass-card p-6"
              >
                <span className="text-4xl font-black text-brand-500/30 font-mono shrink-0">
                  {item.step}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-surface-400">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-12"
          >
            <Users className="w-12 h-12 text-brand-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Protect Yourself?
            </h2>
            <p className="text-surface-400 mb-8 text-lg">
              Join the community of security-aware users. No account required to start scanning.
            </p>
            <Link to="/analyze" className="btn-primary text-lg px-10 py-4">
              <ScanSearch className="w-5 h-5" />
              Start Your First Scan
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-800/50 py-8 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand-500" />
            <span className="text-sm text-surface-500">
              TrustShield AI — Privacy-First Security
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-surface-500">
            <Link to="/about" className="hover:text-white transition-colors">About</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/feed" className="hover:text-white transition-colors">Threat Feed</Link>
            <Link to="/analyze" className="hover:text-white transition-colors">Analyze</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
