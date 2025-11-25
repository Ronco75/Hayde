/**
 * Badge Component
 * Status badges with variants, sizes, and optional pulse animation
 */

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

export type BadgeVariant =
  | 'pending'
  | 'confirmed'
  | 'declined'
  | 'maybe'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'default';

export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: ReactNode;
  pulse?: boolean;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  icon,
  pulse = false,
  className = ''
}) => {
  // Variant styles (background, text, border)
  const variantClasses: Record<BadgeVariant, string> = {
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    confirmed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    declined: 'bg-red-500/10 text-red-400 border-red-500/20',
    maybe: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    danger: 'bg-red-500/10 text-red-400 border-red-500/20',
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    default: 'bg-gray-500/10 text-gray-400 border-gray-500/20'
  };

  // Size classes
  const sizeClasses: Record<BadgeSize, string> = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };

  // Pulse animation for pending states
  const pulseAnimation = pulse
    ? {
        initial: { scale: 1, opacity: 1 },
        animate: {
          scale: [1, 1.05, 1],
          opacity: [1, 0.8, 1]
        },
        transition: {
          duration: 2,
          ease: 'easeInOut',
          repeat: Infinity
        }
      }
    : {};

  return (
    <motion.span
      className={`
        inline-flex
        items-center
        gap-1
        rounded-full
        border
        font-medium
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      {...pulseAnimation}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </motion.span>
  );
};

export default Badge;
