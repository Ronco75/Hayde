/**
 * Modal Component
 * Animated modal dialog with backdrop blur, ESC key, and click-outside-to-close
 */

import { useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { modalOverlay, modalContent } from '../../utils/motion';
import { X } from 'lucide-react';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  size?: ModalSize;
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
  className?: string;
}

function Modal({
  isOpen,
  onClose,
  children,
  title,
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEsc = true,
  className = ''
}: ModalProps) {
  // Size classes
  const sizeClasses: Record<ModalSize, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };

  // Close modal on ESC key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEsc) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, closeOnEsc]);

  const handleBackdropClick = () => {
    if (closeOnBackdrop) {
      onClose();
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/75 backdrop-blur-md z-40"
            variants={modalOverlay}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleBackdropClick}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            {/* Modal Content */}
            <motion.div
              className={`
                ${sizeClasses[size]}
                w-full
                bg-surface-primary
                rounded-2xl
                shadow-2xl
                border
                border-border-subtle
                my-auto
                max-h-[90vh]
                overflow-hidden
                ${className}
              `}
              variants={modalContent}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              {(title || showCloseButton) && (
                <div className="flex items-center justify-between p-6 border-b border-border-subtle">
                  {title && (
                    <h2 className="text-2xl font-display font-bold text-gray-50">
                      {title}
                    </h2>
                  )}
                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className="
                        p-2
                        rounded-lg
                        text-gray-400
                        hover:text-gray-200
                        hover:bg-surface-secondary
                        transition-all
                        duration-200
                        focus:outline-none
                        focus:ring-2
                        focus:ring-primary-500
                      "
                      aria-label="Close modal"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}

              {/* Body */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export default Modal;