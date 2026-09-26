import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface RedFlagCardProps {
  title: string;
  explanation: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  source?: 'HEURISTIC' | 'AI';
  index: number;
}

const SEVERITY_CONFIG = {
  HIGH: {
    icon: AlertTriangle,
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    text: 'text-rose-400',
    badge: 'bg-rose-500/20 text-rose-300',
    iconColor: 'text-rose-400',
  },
  MEDIUM: {
    icon: AlertCircle,
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    text: 'text-amber-400',
    badge: 'bg-amber-500/20 text-amber-300',
    iconColor: 'text-amber-400',
  },
  LOW: {
    icon: Info,
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    text: 'text-blue-400',
    badge: 'bg-blue-500/20 text-blue-300',
    iconColor: 'text-blue-400',
  },
};

export default function RedFlagCard({ title, explanation, severity, source, index }: RedFlagCardProps) {
  const [isOpen, setIsOpen] = useState(severity === 'HIGH');
  const config = SEVERITY_CONFIG[severity];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`rounded-xl border ${config.border} ${config.bg} overflow-hidden transition-all duration-200`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.02] transition-colors"
      >
        <Icon className={`w-5 h-5 ${config.iconColor} shrink-0`} />
        <span className="flex-1 text-sm font-medium text-surface-200">{title}</span>
        {source && (
          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono ${
            source === 'HEURISTIC'
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
          }`}>
            {source === 'HEURISTIC' ? '⚙️ Heuristic' : '✨ Gemini AI'}
          </span>
        )}
        <span className={`badge text-[10px] ${config.badge}`}>{severity}</span>
        <ChevronDown
          className={`w-4 h-4 text-surface-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1">
              <p className="text-sm text-surface-400 leading-relaxed pl-8">
                {explanation}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
