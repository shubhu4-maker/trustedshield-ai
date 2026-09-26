import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ScanSearch,
  FileText,
  Link2,
  Shield,
  Loader2,
  EyeOff,
  Globe,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import PiiRedactorPreview from '../components/PiiRedactorPreview';
import { scrubPiiClient } from '../utils/piiScrubber';
import { analyzeContent } from '../services/api';

const SAMPLE_PRESETS = [
  {
    label: '🎣 Phishing Email',
    type: 'TEXT' as const,
    content:
      'Urgent: Your Wells Fargo account has been temporarily restricted due to unusual login attempts. Please verify your identity immediately at https://wellsfargo-security-alert.xyz/verify or call account manager David at (555) 234-5678 within 24 hours to avoid suspension.',
  },
  {
    label: '💼 Fake Job Offer',
    type: 'TEXT' as const,
    content:
      'Congratulations John! Apex Global Tech has accepted your application for Remote Data Specialist ($65/hr). To finalize your employment contract, send your SSN 123-45-6789 and contact HR Director Lisa on Telegram @apex_global_hr to send a $150 equipment onboarding deposit via wire transfer.',
  },
  {
    label: '🧾 Invoice Scam',
    type: 'TEXT' as const,
    content:
      'Geek Squad Invoice #GS-89211: Thank you for renewing your Total Protection 3-Year Plan. Your card ending in 4111 has been debited $499.00. If you did not authorize this charge, call our toll-free cancellation team immediately at 1-800-555-0199 or email refund@geeksquad-billing.cam.',
  },
  {
    label: '🪙 Crypto Fraud',
    type: 'TEXT' as const,
    content:
      'Exclusive Tesla Crypto Giveaway: Send 0.25 BTC or 2 ETH to our official promotional wallet bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq and receive double back instantly. Limited time offer expires in 12 hours!',
  },
  {
    label: '🔗 Malicious URL',
    type: 'URL' as const,
    content: 'https://paypal-account-security-update.xyz/login',
  },
];

export default function AnalyzePage() {
  const navigate = useNavigate();

  const [content, setContent] = useState('');
  const [contentType, setContentType] = useState<'TEXT' | 'URL'>('TEXT');
  const [isEphemeral, setIsEphemeral] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  // PII state
  const [redactedText, setRedactedText] = useState('');
  const [piiCount, setPiiCount] = useState(0);

  // Real-time PII scanning
  useEffect(() => {
    if (content.length > 0) {
      const result = scrubPiiClient(content);
      setRedactedText(result.redactedText);
      setPiiCount(result.matches.length);
    } else {
      setRedactedText('');
      setPiiCount(0);
    }
  }, [content]);

  const handleClear = () => {
    setContent('');
    setRedactedText('');
    setPiiCount(0);
    setError('');
  };

  const loadPreset = (preset: (typeof SAMPLE_PRESETS)[0]) => {
    setContentType(preset.type);
    setContent(preset.content);
    setError('');
  };

  const handleSubmit = useCallback(async () => {
    const trimmed = content.trim();

    if (trimmed.length < 5) {
      setError('Please enter at least 5 characters to analyze.');
      return;
    }

    if (trimmed.length > 10000) {
      setError('Input exceeds maximum limit of 10,000 characters.');
      return;
    }

    if (contentType === 'URL') {
      const lower = trimmed.toLowerCase();
      const disallowedSchemes = ['javascript:', 'data:', 'file:', 'ftp:', 'blob:', 'vbscript:'];
      for (const scheme of disallowedSchemes) {
        if (lower.startsWith(scheme)) {
          setError(`Unsupported URL scheme "${scheme}". Only HTTP and HTTPS addresses or domains can be analyzed.`);
          return;
        }
      }

      try {
        const testUrl = lower.startsWith('http://') || lower.startsWith('https://')
          ? trimmed
          : `https://${trimmed}`;
        const parsed = new URL(testUrl);
        if (!parsed.hostname || !parsed.hostname.includes('.')) {
          setError('Invalid domain format. Please provide a valid domain name (e.g. site.com or https://site.com).');
          return;
        }
      } catch {
        setError('Malformed URL. Please enter a valid web address or domain.');
        return;
      }
    }

    setError('');
    setIsAnalyzing(true);

    try {
      // Send the PRE-REDACTED content to server
      // The server will re-scrub as defense-in-depth
      const piiResult = scrubPiiClient(content);

      const response = await analyzeContent({
        content: piiResult.redactedText,
        contentType,
        isEphemeral,
        isPublic,
      });

      if (response.success && response.data) {
        // Save to guest localStorage history vault
        try {
          const stored = JSON.parse(localStorage.getItem('trustshield_recent_scans') || '[]');
          const updated = [response.data, ...stored.filter((s: any) => s.id !== response.data.id)].slice(0, 20);
          localStorage.setItem('trustshield_recent_scans', JSON.stringify(updated));
        } catch {
          // Ignore localStorage errors
        }

        // Navigate to report page with the scan data
        navigate(`/report/${response.data.id}`, { state: { scanData: response.data } });
      }
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Please verify backend connectivity.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [content, contentType, isEphemeral, isPublic, navigate]);

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            <span className="gradient-text">Analyzer Studio</span>
          </h1>
          <p className="text-surface-400 text-lg">
            Paste suspicious content below. PII is scrubbed in real-time before analysis.
          </p>
        </motion.div>

        {/* Sample Presets Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-surface-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            Quick Test Presets (Click to load sample):
          </div>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => loadPreset(preset)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-900 border border-surface-700 text-surface-300 hover:text-white hover:border-brand-500/50 hover:bg-brand-500/10 transition-all duration-150"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="space-y-6">
          {/* Content Type Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex gap-3"
          >
            <button
              onClick={() => setContentType('TEXT')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border font-medium transition-all duration-200
                ${contentType === 'TEXT'
                  ? 'bg-brand-500/10 border-brand-500/30 text-brand-400'
                  : 'bg-surface-900 border-surface-700 text-surface-400 hover:border-surface-600'
                }`}
            >
              <FileText className="w-4 h-4" />
              Text / Message
            </button>
            <button
              onClick={() => setContentType('URL')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border font-medium transition-all duration-200
                ${contentType === 'URL'
                  ? 'bg-brand-500/10 border-brand-500/30 text-brand-400'
                  : 'bg-surface-900 border-surface-700 text-surface-400 hover:border-surface-600'
                }`}
            >
              <Link2 className="w-4 h-4" />
              URL / Domain
            </button>
          </motion.div>

          {/* Input Area */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={
                  contentType === 'TEXT'
                    ? 'Paste the suspicious email, SMS, WhatsApp message, or job offer here...'
                    : 'Enter the suspicious URL or domain (e.g., https://suspicious-site.xyz/login)...'
                }
                rows={7}
                maxLength={10000}
                className="input-field resize-none font-mono text-sm leading-relaxed"
              />
            </div>
            <div className="flex justify-between items-center mt-2 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span className="text-xs text-surface-500 font-mono">
                  {content.length}/10,000 characters
                </span>
                {content.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-xs text-surface-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset Input
                  </button>
                )}
              </div>
              {piiCount > 0 && (
                <span className="text-xs text-amber-400 flex items-center gap-1 font-medium bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {piiCount} PII token{piiCount > 1 ? 's' : ''} scrubbed locally
                </span>
              )}
            </div>
          </motion.div>

          {/* PII Redaction Preview */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-5"
          >
            <PiiRedactorPreview
              originalText={content}
              redactedText={redactedText}
              piiCount={piiCount}
            />
          </motion.div>

          {/* Options */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap gap-4"
          >
            {/* Zero Retention Toggle */}
            <label className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-900 border border-surface-700 cursor-pointer hover:border-surface-600 transition-all">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isEphemeral}
                  onChange={(e) => setIsEphemeral(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-surface-700 rounded-full peer-checked:bg-brand-500 transition-colors" />
                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
              </div>
              <div className="flex items-center gap-1.5">
                <EyeOff className="w-4 h-4 text-surface-400" />
                <div>
                  <span className="text-sm text-surface-200 font-medium block">Zero-Retention Mode</span>
                  <span className="text-[11px] text-surface-500">Volatile memory only — zero database trace</span>
                </div>
              </div>
            </label>

            {/* Public Toggle */}
            <label className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-900 border border-surface-700 cursor-pointer hover:border-surface-600 transition-all">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-surface-700 rounded-full peer-checked:bg-brand-500 transition-colors" />
                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
              </div>
              <div className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-surface-400" />
                <div>
                  <span className="text-sm text-surface-200 font-medium block">Share to Community Threat Feed</span>
                  <span className="text-[11px] text-surface-500">Contribute anonymized pattern to protect others</span>
                </div>
              </div>
            </label>
          </motion.div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm"
            >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <button
              onClick={handleSubmit}
              disabled={isAnalyzing || content.trim().length < 5}
              className="btn-primary w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-500/20"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing with TrustShield AI...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Analyze for Threats
                  <ScanSearch className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </motion.div>

          {/* Privacy Note & Non-Execution Disclaimer */}
          <div className="text-xs text-center text-surface-500 space-y-1">
            <p className="flex items-center justify-center gap-1.5">
              <Shield className="w-3 h-3 text-emerald-400" />
              <span>Personal data is scrubbed client-side before submission. Raw identifiers never leave your browser.</span>
            </p>
            <p className="text-surface-600 text-[11px]">
              URL analysis evaluates domain structure and lexical indicators safely without opening or executing active target links.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
