/**
 * Framer Motion Animation Variants
 * Reusable animation presets for consistent motion design across the app
 */

import type { Variants, Transition } from 'framer-motion';

/**
 * Easing functions matching design tokens
 */
export const easings = {
  linear: [0, 0, 1, 1],
  easeIn: [0.4, 0, 1, 1],
  easeOut: [0, 0, 0.2, 1],
  easeInOut: [0.4, 0, 0.2, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
  smooth: [0.25, 0.1, 0.25, 1],
} as const;

/**
 * Transition presets
 */
export const transitions = {
  fast: { duration: 0.15, ease: easings.easeOut },
  base: { duration: 0.2, ease: easings.easeInOut },
  slow: { duration: 0.3, ease: easings.smooth },
  bounce: { duration: 0.5, ease: easings.bounce },
} as const;

/**
 * Fade In Animation
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: transitions.base
  },
  exit: {
    opacity: 0,
    transition: transitions.fast
  }
};

/**
 * Slide Up Animation
 */
export const slideUp: Variants = {
  hidden: {
    opacity: 0,
    y: 20
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.base
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: transitions.fast
  }
};

/**
 * Slide Down Animation
 */
export const slideDown: Variants = {
  hidden: {
    opacity: 0,
    y: -20
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.base
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: transitions.fast
  }
};

/**
 * Slide In From Left
 */
export const slideInLeft: Variants = {
  hidden: {
    opacity: 0,
    x: -20
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitions.base
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: transitions.fast
  }
};

/**
 * Slide In From Right
 */
export const slideInRight: Variants = {
  hidden: {
    opacity: 0,
    x: 20
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitions.base
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: transitions.fast
  }
};

/**
 * Scale In Animation
 */
export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transitions.base
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: transitions.fast
  }
};

/**
 * Scale In with Bounce
 */
export const scaleInBounce: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transitions.bounce
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: transitions.fast
  }
};

/**
 * Zoom In Animation
 */
export const zoomIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.5
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transitions.base
  },
  exit: {
    opacity: 0,
    scale: 0.5,
    transition: transitions.fast
  }
};

/**
 * Modal Overlay Animation
 */
export const modalOverlay: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2 }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15 }
  }
};

/**
 * Modal Content Animation (from bottom on mobile, center on desktop)
 */
export const modalContent: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.15 }
  }
};

/**
 * Stagger Container for Lists
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

/**
 * Stagger Item for List Children
 */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.base
  }
};

/**
 * Card Hover Animation
 */
export const cardHover = {
  rest: {
    scale: 1,
    y: 0,
    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.12), 0 1px 2px -1px rgb(0 0 0 / 0.08)'
  },
  hover: {
    scale: 1.02,
    y: -4,
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.2), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    transition: transitions.fast
  }
};

/**
 * Button Tap Animation
 */
export const buttonTap = {
  scale: 0.98,
  transition: { duration: 0.1 }
};

/**
 * Page Transition Animation
 */
export const pageTransition: Variants = {
  hidden: {
    opacity: 0,
    y: 20
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: easings.easeOut
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
      ease: easings.easeIn
    }
  }
};

/**
 * Number Counter Animation
 * For animated number displays on dashboard
 */
export const counterAnimation: Transition = {
  duration: 1,
  ease: easings.easeOut
};

/**
 * Pulse Animation
 * For status indicators, badges, notifications
 */
export const pulse: Variants = {
  initial: { scale: 1, opacity: 1 },
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      ease: easings.easeInOut,
      repeat: Infinity
    }
  }
};

/**
 * Shimmer Animation
 * For skeleton loading states
 */
export const shimmer: Variants = {
  initial: { x: '-100%' },
  animate: {
    x: '100%',
    transition: {
      duration: 1.5,
      ease: 'linear',
      repeat: Infinity
    }
  }
};

/**
 * Confetti Animation
 * For success states
 */
export const confetti: Variants = {
  hidden: {
    opacity: 0,
    scale: 0,
    rotate: 0
  },
  visible: (i: number) => ({
    opacity: [0, 1, 1, 0],
    scale: [0, 1.2, 1, 0.8],
    rotate: [0, 180, 360],
    y: [0, -100, -200],
    x: [(Math.random() - 0.5) * 100, (Math.random() - 0.5) * 200],
    transition: {
      duration: 1.5,
      delay: i * 0.03,
      ease: easings.easeOut
    }
  })
};

/**
 * Float Animation
 * For decorative elements
 */
export const float: Variants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      ease: easings.easeInOut,
      repeat: Infinity
    }
  }
};

/**
 * Shake Animation
 * For error states
 */
export const shake: Variants = {
  shake: {
    x: [0, -10, 10, -10, 10, 0],
    transition: {
      duration: 0.4,
      ease: easings.easeInOut
    }
  }
};

/**
 * Notification Slide In
 * For toast/alert messages
 */
export const notificationSlideIn: Variants = {
  hidden: {
    opacity: 0,
    y: -50,
    scale: 0.8
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 300
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.9,
    transition: { duration: 0.2 }
  }
};

/**
 * Drawer Slide In (for mobile menus)
 */
export const drawerSlideIn: Variants = {
  hidden: {
    x: '100%',
    opacity: 0
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 30,
      stiffness: 300
    }
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

/**
 * Tab Switch Animation
 */
export const tabSwitch: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 20 : -20,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: transitions.base
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 20 : -20,
    opacity: 0,
    transition: transitions.fast
  })
};
