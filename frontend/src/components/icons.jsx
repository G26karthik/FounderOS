import React from 'react';

/**
 * Common prop type interface for SVG icons.
 */
export function IconWrapper({ children, className = '', size = 20, onClick, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 transition-transform ${className}`}
      aria-hidden="true"
      onClick={onClick}
      {...props}
    >
      {children}
    </svg>
  );
}

export function MicIcon({ className, size, ...props }) {
  return (
    <IconWrapper className={className} size={size} {...props}>
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </IconWrapper>
  );
}

export function TimelineIcon({ className, size, ...props }) {
  return (
    <IconWrapper className={className} size={size} {...props}>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M7 8h10" />
      <path d="M7 12h10" />
      <path d="M7 16h10" />
    </IconWrapper>
  );
}

export function BrainIcon({ className, size, ...props }) {
  return (
    <IconWrapper className={className} size={size} {...props}>
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1 0-3.12 3 3 0 0 1 0-4.88 2.5 2.5 0 0 1 0-3.12A2.5 2.5 0 0 1 9.5 2Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 0-3.12 3 3 0 0 0 0-4.88 2.5 2.5 0 0 0 0-3.12A2.5 2.5 0 0 0 14.5 2Z" />
    </IconWrapper>
  );
}

export function LockIcon({ className, size, ...props }) {
  return (
    <IconWrapper className={className} size={size} {...props}>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </IconWrapper>
  );
}

export function RefreshIcon({ className, size, ...props }) {
  return (
    <IconWrapper className={className} size={size} {...props}>
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </IconWrapper>
  );
}

export function CheckIcon({ className, size, ...props }) {
  return (
    <IconWrapper className={className} size={size} {...props}>
      <path d="M20 6 9 17l-5-5" />
    </IconWrapper>
  );
}

export function TrashIcon({ className, size, ...props }) {
  return (
    <IconWrapper className={className} size={size} {...props}>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </IconWrapper>
  );
}

export function ChatIcon({ className, size, ...props }) {
  return (
    <IconWrapper className={className} size={size} {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </IconWrapper>
  );
}

export function WarningIcon({ className, size, ...props }) {
  return (
    <IconWrapper className={className} size={size} {...props}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" x2="12" y1="9" y2="13" />
      <line x1="12" x2="12" y1="17" y2="17.01" />
    </IconWrapper>
  );
}

export function IdeaIcon({ className, size, ...props }) {
  return (
    <IconWrapper className={className} size={size} {...props}>
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </IconWrapper>
  );
}

export function LightningIcon({ className, size, ...props }) {
  return (
    <IconWrapper className={className} size={size} {...props}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </IconWrapper>
  );
}

export function SparklesIcon({ className, size, ...props }) {
  return (
    <IconWrapper className={className} size={size} {...props}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5 5 3Z" opacity="0.6" />
      <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5Z" opacity="0.6" />
    </IconWrapper>
  );
}

export function SendIcon({ className, size, ...props }) {
  return (
    <IconWrapper className={className} size={size} {...props}>
      <line x1="22" x2="11" y1="2" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </IconWrapper>
  );
}

export function SearchIcon({ className, size, ...props }) {
  return (
    <IconWrapper className={className} size={size} {...props}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" x2="16.65" y1="21" y2="16.65" />
    </IconWrapper>
  );
}

export function ArrowRightIcon({ className, size, ...props }) {
  return (
    <IconWrapper className={className} size={size} {...props}>
      <line x1="5" x2="19" y1="12" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </IconWrapper>
  );
}
