interface CraneIconProps {
  className?: string;
  isActive?: boolean;
}

export function CraneIcon({ className = 'w-12 h-12', isActive = false }: CraneIconProps) {
  return (
    <svg
      viewBox="0 0 512 512"
      className={className}
      fill={isActive ? '#1e40af' : '#6b7280'}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Main frame - top beam */}
      <rect x="100" y="80" width="312" height="20" rx="4" />
      {/* Top cabin */}
      <rect x="220" y="50" width="72" height="35" rx="4" />
      <rect x="230" y="55" width="20" height="20" rx="2" fill={isActive ? '#3b82f6' : '#9ca3af'} />
      <rect x="260" y="55" width="20" height="20" rx="2" fill={isActive ? '#3b82f6' : '#9ca3af'} />
      {/* Left leg */}
      <rect x="108" y="80" width="20" height="300" rx="3" />
      <rect x="135" y="80" width="20" height="300" rx="3" />
      {/* Right leg */}
      <rect x="357" y="80" width="20" height="300" rx="3" />
      <rect x="384" y="80" width="20" height="300" rx="3" />
      {/* Cross beams left */}
      <rect x="100" y="180" width="65" height="12" rx="2" />
      <rect x="100" y="280" width="65" height="12" rx="2" />
      {/* Cross beams right */}
      <rect x="350" y="180" width="65" height="12" rx="2" />
      <rect x="350" y="280" width="65" height="12" rx="2" />
      {/* Trolley beam (horizontal) */}
      <rect x="155" y="110" width="200" height="14" rx="3" />
      {/* Trolley */}
      <rect x="230" y="100" width="50" height="30" rx="4" fill={isActive ? '#2563eb' : '#6b7280'} />
      {/* Hoist cables */}
      <rect x="245" y="130" width="3" height="80" />
      <rect x="262" y="130" width="3" height="80" />
      {/* Spreader */}
      <rect x="225" y="208" width="60" height="12" rx="2" fill={isActive ? '#1d4ed8' : '#4b5563'} />
      {/* Container outline */}
      <rect x="215" y="222" width="80" height="55" rx="3" fill="none" stroke={isActive ? '#1e40af' : '#6b7280'} strokeWidth="4" />
      {/* Left wheels */}
      <circle cx="118" cy="395" r="16" />
      <circle cx="145" cy="395" r="16" />
      <circle cx="118" cy="395" r="6" fill="white" />
      <circle cx="145" cy="395" r="6" fill="white" />
      {/* Right wheels */}
      <circle cx="367" cy="395" r="16" />
      <circle cx="394" cy="395" r="16" />
      <circle cx="367" cy="395" r="6" fill="white" />
      <circle cx="394" cy="395" r="6" fill="white" />
      {/* Wheel axles */}
      <rect x="100" y="380" width="65" height="8" rx="4" />
      <rect x="350" y="380" width="65" height="8" rx="4" />
    </svg>
  );
}
