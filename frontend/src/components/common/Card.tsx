/**
 * Card Component
 * Unified card component with variants, sizes, and optional interactive states
 */

import React, { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cardHover } from '../../utils/motion';

export type CardVariant = 'default' | 'outlined' | 'elevated' | 'glass';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
  interactive?: boolean;
  hover?: boolean;
  className?: string;
  header?: ReactNode;
  footer?: ReactNode;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = 'default',
      padding = 'md',
      interactive = false,
      hover = false,
      className = '',
      header,
      footer,
      ...motionProps
    },
    ref
  ) => {
    // Variant styles
    const variantClasses: Record<CardVariant, string> = {
      default: 'bg-surface-primary border border-border-subtle',
      outlined: 'bg-transparent border-2 border-border-default',
      elevated: 'bg-surface-secondary shadow-lg border border-border-subtle',
      glass: 'glass border-border-subtle/50'
    };

    // Padding styles
    const paddingClasses: Record<CardPadding, string> = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8'
    };

    // Interactive and hover states
    const interactiveClasses = interactive
      ? 'cursor-pointer transition-all duration-200'
      : '';

    const motionVariants = hover && interactive ? cardHover : undefined;

    return (
      <motion.div
        ref={ref}
        className={`
          rounded-xl
          ${variantClasses[variant]}
          ${paddingClasses[padding]}
          ${interactiveClasses}
          ${className}
        `}
        initial={motionVariants ? 'rest' : undefined}
        whileHover={motionVariants ? 'hover' : undefined}
        {...motionProps}
      >
        {header && (
          <div className={`${padding !== 'none' ? '-mt-2 mb-4' : 'mb-4'}`}>
            {header}
          </div>
        )}

        {children}

        {footer && (
          <div className={`${padding !== 'none' ? '-mb-2 mt-4' : 'mt-4'}`}>
            {footer}
          </div>
        )}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
