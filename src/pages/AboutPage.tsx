import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Brain,
  Cpu,
  EyeOff,
  Globe,
  FileCheck2,
  Sparkles,
  ArrowRight,
  ScanSearch,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

const ARCHITECTURE_STEPS = [
  {
    step: '1',
    title: 'Client-Side PII Redaction',
    desc: 'Before any transmission, regular expressions run in your browser to identify and replace emails, phone numbers, credit cards, SSNs, and IP addresses with cryptographic tokens.',
    badge: 'Privacy Barrier 1',
  },
  {
    step: '2',
    title: 'Server Defense-in-Depth',
    desc: 'The backend re-scrubs incoming payloads. Raw personal data is strictly prohibited from touching database records or application memory.',
    badge: 'Privacy Barrier 2',
  },
  {
    step: '3',
    title: 'Deterministic Heuristic Engine',
    desc: 'Automated algorithms calculate Shannon entropy on domains, evaluate suspicious TLDs, scan for 50+ social-engineering triggers, and inspect crypto addresses without making external network calls to user links.',
    badge: 'Heuristic Layer (40%)',
  },
  {
    step: '4',
    title: 'Gemini 2.5 Flash Synthesis',
    desc: 'Cleaned text and heuristic flags are evaluated by Google Gemini 2.5 Flash using structured output schemas to detect nuanced psychological manipulation and impersonation.',
    badge: 'AI Layer (60%)',
  },
];

const TRUST_PRINCIPLES = [
  {
    title: 'No Active Payload Execution',
    desc: 'TrustShield AI inspects URL structures, subdomains, and lexical patterns. We never automatically load, crawl, or trigger user-submitted links in headless browsers, preventing drive-by exploits.',
    icon: ShieldCheck,
  },
  {
    title: 'Server-Side API Key Isolation',
    desc: 'All AI model keys and administrative tokens are maintained exclusively on the backend server. Zero credentials or keys are packaged into the frontend client bundle.',
    icon: Lock,
  },
  {
    title: 'Zero Unsupported Claims',
    desc: 'We never present synthetic or placeholder risk scores as real threat-intelligence or claim external third-party reputation database queries unless explicitly performed.',
    icon: FileCheck2,
  },
  {
    title: 'Zero-Retention Guarantees',
    desc: 'With Zero-Retention Mode toggled on, your scan data is held only in volatile memory for the duration of the request and is immediately discarded without leaving a database trace.',
    icon: EyeOff,
  },
];

export default function AboutPage() {
  return (
    <div className="relative min-h-screen pt-28 pb-16 px-4">
      {/* Background Gradients */}
      <div className="fixed inset-0 bg-grid pointer-events-none" />
      <div className="fixed inset-0 bg-radial-glow pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 mb-6">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span className="text-sm font-medium text-brand-300">
              AI Security, Privacy & Trust Hackathon
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
            <span className="text-white">Security with </span>
            <span className="gradient-text">Radical Privacy</span>
          </h1>

          <p className="text-surface-300 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            TrustShield AI bridges the gap between sophisticated cybersecurity defense and everyday privacy.
            We empower non-technical users to identify scams without sacrificing their personal data.
          </p>
        </motion.div>

        {/* Mission Statement Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-8 md:p-10 mb-16 border-brand-500/20"
        >
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="w-8 h-8 text-brand-400" />
            <h2 className="text-2xl font-bold text-white">Our Mission</h2>
          </div>
          <p className="text-surface-300 text-base md:text-lg leading-relaxed mb-6">
            Cybercriminals exploit urgency, fear, and technical obscurity to defraud millions every day.
            Traditional antivirus and threat analyzers often require users to upload full emails or click suspicious links,
            risking the very personal data they seek to protect.
          </p>
          <p className="text-surface-300 text-base md:text-lg leading-relaxed">
            <strong className="text-white">TrustShield AI changes the paradigm:</strong> personal identifiers are scrubbed
            directly inside the browser sandbox before any network request is dispatched. Our hybrid engine fuses
            deterministic heuristic algorithms with Google Gemini 2.5 Flash, delivering transparent, jargon-free safety
            guidance that respects user confidentiality.
          </p>
        </motion.div>

        {/* Multi-Layered Architecture Walkthrough */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-4">
            Multi-Layered Defense Architecture
          </h2>
          <p className="text-surface-400 text-center mb-10 max-w-xl mx-auto">
            How TrustShield AI evaluates threats while guaranteeing zero data leakage.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {ARCHITECTURE_STEPS.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl font-black text-brand-500 font-mono">
                      0{step.step}
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 font-medium">
                      {step.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-surface-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Security & Trust Principles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">
            Trust & Security Guarantees
          </h2>

          <div className="grid sm:grid-cols-2 gap-6">
            {TRUST_PRINCIPLES.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-brand-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-1.5">{item.title}</h3>
                  <p className="text-surface-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-card p-10 text-center"
        >
          <ShieldCheck className="w-12 h-12 text-brand-400 mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Ready to test a suspicious message?
          </h2>
          <p className="text-surface-400 max-w-lg mx-auto mb-8">
            Experience real-time PII redaction and instant AI threat scoring with zero risk.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/analyze" className="btn-primary text-base px-8 py-3">
              <ScanSearch className="w-4 h-4" />
              Open Analyzer Studio
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/privacy" className="btn-secondary text-base px-8 py-3">
              <Lock className="w-4 h-4" />
              Privacy Center
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
