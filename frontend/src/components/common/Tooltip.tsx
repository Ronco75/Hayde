import React from 'react';

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
}

function Tooltip({ children, content }: TooltipProps) {
  return (
    <span className="relative inline-block group/tt">
      {children}
      <span
        className="
          pointer-events-none
          invisible opacity-0 group-hover/tt:visible group-hover/tt:opacity-100
          group-focus-within/tt:visible group-focus-within/tt:opacity-100
          transition-opacity duration-150
          absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50
          bg-slate-800 text-gray-100 text-xs font-medium
          whitespace-nowrap px-2.5 py-1.5 rounded-md
          border border-white/10 shadow-elev-2
        "
        role="tooltip"
      >
        {content}
        <span
          className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 border border-white/10 rotate-45"
          aria-hidden
        />
      </span>
    </span>
  );
}

export default Tooltip;


