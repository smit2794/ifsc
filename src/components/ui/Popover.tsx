// src/components/ui/Popover.tsx
import React, { useState, useRef, useEffect } from 'react';

interface PopoverProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
  align?: 'left' | 'right' | 'center';
  className?: string;
}

export const Popover: React.FC<PopoverProps> = ({
  trigger,
  content,
  align = 'left',
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const alignClass = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 -translate-x-1/2',
  }[align];

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      <div onClick={() => setOpen(!open)} role="button" tabIndex={0}>
        {trigger}
      </div>

      {open && (
        <div
          className={`absolute z-50 mt-1.5 w-72 sm:w-80 bg-white rounded-md shadow-modal border border-borderColor p-3 text-xs text-textPrimary animate-in fade-in duration-100 ${alignClass}`}
        >
          {content}
        </div>
      )}
    </div>
  );
};
