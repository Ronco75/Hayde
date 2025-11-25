/**
 * Button Component
 * Modern button with framer-motion animations, variants, sizes, and loading states
 */

import React, { ReactNode, ButtonHTMLAttributes } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { buttonTap } from '../../utils/motion';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'gold';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
    children: ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    fullWidth?: boolean;
    className?: string;
}

function Button({
    children,
    variant = 'primary',
    size = 'md',
    type = 'button',
    onClick,
    disabled = false,
    loading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    className = '',
    ...rest
}: ButtonProps) {
    const variantClasses: Record<ButtonVariant, string> = {
        primary: 'bg-gradient-to-br from-primary-600 to-primary-700 text-white hover:from-primary-500 hover:to-primary-600 shadow-glow-purple',
        gold: 'bg-gradient-to-br from-gold-500 to-gold-600 text-white hover:from-gold-400 hover:to-gold-500 shadow-glow-gold',
        secondary: 'bg-surface-secondary border-2 border-border-default text-gray-200 hover:bg-surface-elevated hover:border-border-strong',
        ghost: 'bg-transparent text-primary-400 hover:bg-surface-secondary',
        danger: 'bg-gradient-to-br from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600',
        success: 'bg-gradient-to-br from-emerald-600 to-emerald-700 text-white hover:from-emerald-500 hover:to-emerald-600',
    };

    const sizeClasses: Record<ButtonSize, string> = {
        sm: 'px-3 py-2 text-sm h-10',
        md: 'px-5 py-2.5 text-base h-11',
        lg: 'px-6 py-3 text-lg h-14',
        icon: 'p-2.5 w-11 h-11',
    };

    const isDisabled = disabled || loading;

    return (
        <motion.button
            className={`
                ${sizeClasses[size]}
                ${variantClasses[variant]}
                ${fullWidth ? 'w-full' : ''}
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-lg
                font-semibold
                transition-all
                duration-200
                ease-in-out
                focus-visible:outline-none
                focus-visible:ring-4
                focus-visible:ring-primary-500/50
                disabled:opacity-50
                disabled:cursor-not-allowed
                relative
                overflow-hidden
                ${className}
            `.trim().replace(/\s+/g, ' ')}
            onClick={onClick}
            type={type}
            disabled={isDisabled}
            whileHover={!isDisabled ? { scale: 1.02 } : undefined}
            whileTap={!isDisabled ? buttonTap : undefined}
            {...rest}
        >
            {/* Loading Spinner */}
            {loading && (
                <motion.div
                    className="absolute inset-0 flex items-center justify-center bg-inherit"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <svg
                        className="animate-spin h-5 w-5 text-current"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                </motion.div>
            )}

            {/* Button Content */}
            <span
                className={`inline-flex items-center justify-center gap-2 ${
                    loading ? 'invisible' : ''
                }`}
            >
                {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
                {children}
                {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
            </span>
        </motion.button>
    );
}

export default Button;