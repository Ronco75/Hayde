/**
 * Skeleton Component
 * Loading skeleton with shimmer animation for various shapes
 */

import React from 'react';
import { motion } from 'framer-motion';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'card';

export interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  className?: string;
  count?: number;
}

const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  className = '',
  count = 1
}) => {
  // Variant-specific styles
  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return 'h-4 rounded';
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
        return 'rounded-lg';
      case 'card':
        return 'h-32 rounded-xl';
      default:
        return 'rounded';
    }
  };

  // Width and height styles
  const getDimensions = () => {
    const styles: React.CSSProperties = {};

    if (width) {
      styles.width = typeof width === 'number' ? `${width}px` : width;
    }

    if (height) {
      styles.height = typeof height === 'number' ? `${height}px` : height;
    }

    // Default dimensions for circular variant
    if (variant === 'circular' && !width && !height) {
      styles.width = '40px';
      styles.height = '40px';
    }

    return styles;
  };

  const skeletonElement = (
    <motion.div
      className={`
        relative
        overflow-hidden
        bg-surface-secondary
        ${getVariantClasses()}
        ${className}
      `}
      style={getDimensions()}
    >
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent"
        animate={{
          x: ['0%', '200%']
        }}
        transition={{
          duration: 1.5,
          ease: 'linear',
          repeat: Infinity
        }}
      />
    </motion.div>
  );

  // Render multiple skeletons if count > 1
  if (count > 1) {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index}>{skeletonElement}</div>
        ))}
      </div>
    );
  }

  return skeletonElement;
};

/**
 * Skeleton Card Component
 * Pre-built skeleton for card layouts
 */
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`bg-surface-primary border border-border-subtle rounded-xl p-6 ${className}`}>
      <div className="flex items-center gap-4 mb-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1">
          <Skeleton width="60%" className="mb-2" />
          <Skeleton width="40%" />
        </div>
      </div>
      <Skeleton count={3} className="mb-2" />
      <Skeleton width="80%" />
    </div>
  );
};

/**
 * Skeleton Table Row Component
 * Pre-built skeleton for table rows
 */
export const SkeletonTableRow: React.FC<{ columns?: number }> = ({ columns = 4 }) => {
  return (
    <div className="flex gap-4 py-3 border-b border-border-subtle">
      {Array.from({ length: columns }).map((_, index) => (
        <Skeleton key={index} className="flex-1" />
      ))}
    </div>
  );
};

export default Skeleton;
