import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, AlertTriangle, Clock, Lightbulb } from 'lucide-react';

interface Action {
  action: string;
  priority: 'URGENT' | 'RECOMMENDED' | 'OPTIONAL';
}

interface ActionChecklistProps {
  actions: Action[];
}

const PRIORITY_CONFIG = {
  URGENT: {
    icon: AlertTriangle,
    color: 'text-rose-400',
    bg: 'bg-rose-500/5',
    border: 'border-rose-500/20',
    label: 'Urgent',
  },
  RECOMMENDED: {
    icon: Clock,
    color: 'text-amber-400',
    bg: 'bg-amber-500/5',
    border: 'border-amber-500/20',
    label: 'Recommended',
  },
  OPTIONAL: {
    icon: Lightbulb,
    color: 'text-blue-400',
    bg: 'bg-blue-500/5',
    border: 'border-blue-500/20',
    label: 'Optional',
  },
};

export default function ActionChecklist({ actions }: ActionChecklistProps) {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const completedCount = checkedItems.size;
  const totalCount = actions.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Sort by priority: URGENT first, then RECOMMENDED, then OPTIONAL
  const priorityOrder = { URGENT: 0, RECOMMENDED: 1, OPTIONAL: 2 };
  const sortedActions = [...actions].sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-surface-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-brand-500 to-emerald-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
        <span className="text-xs text-surface-400 font-mono shrink-0">
          {completedCount}/{totalCount}
        </span>
      </div>

      {/* Action items */}
      <div className="space-y-2">
        {sortedActions.map((item, index) => {
          const isChecked = checkedItems.has(index);
          const config = PRIORITY_CONFIG[item.priority];
          const PriorityIcon = config.icon;

          return (
            <motion.button
              key={index}
              onClick={() => toggleItem(index)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className={`w-full flex items-start gap-3 p-3 rounded-xl border transition-all duration-200 text-left
                ${isChecked
                  ? 'bg-emerald-500/5 border-emerald-500/20'
                  : `${config.bg} ${config.border} hover:bg-white/[0.02]`
                }`}
            >
              <div className="mt-0.5 shrink-0">
                {isChecked ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Circle className={`w-5 h-5 ${config.color} opacity-50`} />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm leading-relaxed transition-all duration-200 ${
                    isChecked ? 'text-surface-500 line-through' : 'text-surface-200'
                  }`}
                >
                  {item.action}
                </p>
              </div>

              <span
                className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider
                  ${isChecked ? 'bg-emerald-500/10 text-emerald-500' : `${config.bg} ${config.color}`}`}
              >
                <PriorityIcon className="w-3 h-3" />
                {config.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {completedCount === totalCount && totalCount > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium text-emerald-400">
            All safety steps completed! Great job protecting yourself.
          </span>
        </motion.div>
      )}
    </div>
  );
}
