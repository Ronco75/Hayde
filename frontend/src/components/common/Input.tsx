/**
 * Input Component
 * Modern form input with floating label, icons, error states, and RTL support
 */

import React, { InputHTMLAttributes, ReactNode, useState, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { slideDown } from '../../utils/motion';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  inputSize?: 'sm' | 'md' | 'lg';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      fullWidth = false,
      inputSize = 'md',
      className = '',
      disabled = false,
      required = false,
      ...inputProps
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(!!inputProps.value || !!inputProps.defaultValue);

    // Size classes
    const sizeClasses = {
      sm: 'h-10 text-sm',
      md: 'h-11 text-base',
      lg: 'h-14 text-lg'
    };

    // Padding based on icons
    const paddingClasses = `
      ${leftIcon ? 'pl-11' : 'pl-4'}
      ${rightIcon ? 'pr-11' : 'pr-4'}
    `;

    const hasError = !!error;
    const isActive = isFocused || hasValue;

    const handleFocus = () => setIsFocused(true);
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setHasValue(!!e.target.value);
      inputProps.onBlur?.(e);
    };

    return (
      <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {leftIcon}
            </div>
          )}

          {/* Input Field */}
          <input
            ref={ref}
            className={`
              ${sizeClasses[inputSize]}
              ${paddingClasses}
              w-full
              rounded-lg
              bg-surface-secondary
              border-2
              ${hasError
                ? 'border-red-500 focus:border-red-500'
                : 'border-border-subtle focus:border-primary-500'
              }
              text-gray-50
              placeholder-gray-500
              transition-all
              duration-200
              outline-none
              disabled:opacity-50
              disabled:cursor-not-allowed
              ${label && !inputProps.placeholder ? 'pt-5' : ''}
            `}
            disabled={disabled}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={(e) => {
              setHasValue(!!e.target.value);
              inputProps.onChange?.(e);
            }}
            {...inputProps}
          />

          {/* Floating Label */}
          {label && (
            <label
              className={`
                absolute
                right-4
                pointer-events-none
                transition-all
                duration-200
                ${isActive || inputProps.placeholder
                  ? 'top-1.5 text-xs'
                  : 'top-1/2 -translate-y-1/2 text-base'
                }
                ${hasError
                  ? 'text-red-400'
                  : isFocused
                    ? 'text-primary-400'
                    : 'text-gray-400'
                }
              `}
            >
              {label}
              {required && <span className="text-red-400 mr-1">*</span>}
            </label>
          )}

          {/* Right Icon */}
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>

        {/* Helper Text or Error Message */}
        <AnimatePresence mode="wait">
          {(helperText || error) && (
            <motion.p
              key={error ? 'error' : 'helper'}
              variants={slideDown}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={`
                mt-1.5
                text-sm
                text-right
                ${hasError ? 'text-red-400' : 'text-gray-400'}
              `}
            >
              {error || helperText}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
