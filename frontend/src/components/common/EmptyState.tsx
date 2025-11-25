/**
 * EmptyState Component
 * Display empty states with icon, message, and optional CTA button
 */

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { scaleIn } from '../../utils/motion';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = ''
}) => {
  return (
    <motion.div
      className={`
        flex
        flex-col
        items-center
        justify-center
        text-center
        py-12
        px-6
        ${className}
      `}
      variants={scaleIn}
      initial="hidden"
      animate="visible"
    >
      {/* Icon */}
      {icon && (
        <motion.div
          className="mb-4 text-gray-600"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 15,
            delay: 0.1
          }}
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto flex items-center justify-center">
            {icon}
          </div>
        </motion.div>
      )}

      {/* Title */}
      <motion.h3
        className="text-xl sm:text-2xl font-semibold text-gray-300 mb-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {title}
      </motion.h3>

      {/* Description */}
      {description && (
        <motion.p
          className="text-sm sm:text-base text-gray-400 mb-6 max-w-md"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {description}
        </motion.p>
      )}

      {/* Action Button */}
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  );
};

export default EmptyState;
