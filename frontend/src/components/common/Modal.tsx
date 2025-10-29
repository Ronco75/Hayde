import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

function Modal({ isOpen, onClose, children }: ModalProps) {
  // Close modal on ESC key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
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
  }, [isOpen, onClose]);

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity" />

      {/* Modal Container - Click outside to close */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-3 overflow-y-auto"
        onClick={onClose}
      >
        {/* Modal Content */}
        <div
          className="bg-slate-900 text-gray-100 rounded-2xl shadow-elev-3 max-w-md w-full p-6 sm:p-4 transform transition-all border border-white/10 my-auto max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()} // מונע סגירה בלחיצה על המודל עצמו
        >
          {children}
        </div>
      </div>
    </>
  );
}

export default Modal;