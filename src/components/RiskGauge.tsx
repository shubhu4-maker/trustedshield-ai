import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, ShieldCheck, ShieldQuestion } from 'lucide-react';

interface RiskGaugeProps {
  score: number;
  size?: number;
  showLabel?: boolean;
  animate?: boolean;
}

export default function RiskGauge({ score, size = 200, showLabel = true, animate = true }: RiskGaugeProps) {
  const { level, color, bgColor, borderColor, Icon, label } = useMemo(() => {
    if (score <= 29) return {
      level: 'SAFE',
      color: '#10b981',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      Icon: ShieldCheck,
      label: 'Safe',
    };
    if (score <= 69) return {
      level: 'SUSPICIOUS',
      color: '#f59e0b',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
      Icon: ShieldQuestion,
      label: 'Suspicious',
    };
    return {
      level: 'DANGEROUS',
      color: '#f43f5e',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/20',
      Icon: ShieldAlert,
      label: 'Dangerous',
    };
  }, [score]);

  const strokeWidth = size * 0.06;
  const radius = (size - strokeWidth) / 2 - 10;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75; // 270 degrees
  const dashOffset = arcLength - (arcLength * score) / 100;
  const center = size / 2;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-[135deg]"
        >
          {/* Background arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgba(51, 65, 85, 0.3)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          {/* Score arc */}
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
            className="gauge-ring"
            style={{ filter: `drop-shadow(0 0 8px ${color}60)` }}
            initial={animate ? { strokeDashoffset: arcLength } : { strokeDashoffset: dashOffset }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="font-bold font-mono"
            style={{ color, fontSize: size * 0.22 }}
            initial={animate ? { opacity: 0, scale: 0.5 } : {}}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            {score}
          </motion.span>
          <span className="text-surface-500 text-xs font-medium -mt-1">/ 100</span>
        </div>
      </div>

      {showLabel && (
        <motion.div
          initial={animate ? { opacity: 0, y: 10 } : {}}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className={`flex items-center gap-2 px-4 py-2 rounded-full ${bgColor} border ${borderColor}`}
        >
          <Icon className="w-4 h-4" style={{ color }} />
          <span className="text-sm font-semibold" style={{ color }}>
            {label}
          </span>
        </motion.div>
      )}
    </div>
  );
}
