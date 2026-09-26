import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

const pageVariants = {
  initial: {
    opacity: 0,
    scale: 0.98,
    y: 12,
    filter: 'blur(4px)',
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1], // custom cubic-bezier for smooth morph feel
      staggerChildren: 0.06,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: -8,
    filter: 'blur(4px)',
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

/**
 * Wraps page content with a morph-style enter/exit transition.
 * Uses scale + blur + translate for a premium glass-morph feel.
 */
export default function PageTransition({ children, className = '' }: PageTransitionProps) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Staggered child variant — use on direct children inside PageTransition
 * for cascading morph-in effects.
 */
export const staggerChild = {
  initial: { opacity: 0, y: 16, scale: 0.97 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};
