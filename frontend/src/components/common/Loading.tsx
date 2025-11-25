/**
 * Loading Component
 * Modern loading state with animated spinner and optional skeleton mode
 */

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface LoadingProps {
  fullscreen?: boolean;
  message?: string;
}

function Loading({ fullscreen = true, message = 'טוען...' }: LoadingProps) {
  if (fullscreen) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-background-primary">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Spinning Icon */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'linear'
            }}
          >
            <Loader2 className="w-12 h-12 text-primary-500" />
          </motion.div>

          {/* Loading Text */}
          <motion.p
            className="text-gray-300 font-semibold text-lg"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            {message}
          </motion.p>

          {/* Animated Dots */}
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-primary-500 rounded-full"
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: 'easeInOut'
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // Inline loading (non-fullscreen)
  return (
    <div className="flex items-center justify-center py-8">
      <motion.div
        className="flex items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear'
          }}
        >
          <Loader2 className="w-6 h-6 text-primary-500" />
        </motion.div>
        <span className="text-gray-400 text-sm">{message}</span>
      </motion.div>
    </div>
  );
}

export default Loading;