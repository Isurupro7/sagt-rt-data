interface CraneIconProps {
  className?: string;
  isActive?: boolean;
}

export function CraneIcon({ className = 'w-8 h-8', isActive = false }: CraneIconProps) {
  const primary = isActive ? '#1e293b' : '#94a3b8';
  const secondary = isActive ? '#334155' : '#cbd5e1';

  return (
    <svg
      viewBox="0 0 512 512"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Main frame - top beam */}
      <rect x="100" y="80" width="312" height="18" rx="3" fill={primary} />
      {/* Top cabin */}
      <rect x="225" y="52" width="62" height="30" rx="3" fill={primary} />
      <rect x="232" y="58" width="16" height="16" rx="2" fill={secondary} />
      <rect x="254" y="58" width="16" height="16" rx="2" fill={secondary} />
      {/* Left leg */}
      <rect x="110" y="80" width="16" height="290" rx="2" fill={primary} />
      <rect x="134" y="80" width="16" height="290" rx="2" fill={primary} />
      {/* Right leg */}
      <rect x="362" y="80" width="16" height="290" rx="2" fill={primary} />
      <rect x="386" y="80" width="16" height="290" rx="2" fill={primary} />
      {/* Cross beams */}
      <rect x="102" y="185" width="56" height="10" rx="2" fill={secondary} />
      <rect x="102" y="275" width="56" height="10" rx="2" fill={secondary} />
      <rect x="354" y="185" width="56" height="10" rx="2" fill={secondary} />
      <rect x="354" y="275" width="56" height="10" rx="2" fill={secondary} />
      {/* Trolley beam */}
      <rect x="158" y="108" width="196" height="12" rx="2" fill={secondary} />
      {/* Trolley */}
      <rect x="234" y="100" width="44" height="26" rx="3" fill={primary} />
      {/* Hoist cables */}
      <rect x="248" y="126" width="2.5" height="75" fill={primary} />
      <rect x="261" y="126" width="2.5" height="75" fill={primary} />
      {/* Spreader */}
      <rect x="230" y="200" width="52" height="10" rx="2" fill={primary} />
      {/* Container */}
      <rect x="222" y="212" width="68" height="48" rx="2" fill="none" stroke={primary} strokeWidth="3.5" />
      {/* Wheels */}
      <circle cx="118" cy="384" r="14" fill={primary} />
      <circle cx="142" cy="384" r="14" fill={primary} />
      <circle cx="370" cy="384" r="14" fill={primary} />
      <circle cx="394" cy="384" r="14" fill={primary} />
      <circle cx="118" cy="384" r="5" fill="white" />
      <circle cx="142" cy="384" r="5" fill="white" />
      <circle cx="370" cy="384" r="5" fill="white" />
      <circle cx="394" cy="384" r="5" fill="white" />
      {/* Wheel base */}
      <rect x="102" y="372" width="56" height="6" rx="3" fill={primary} />
      <rect x="354" y="372" width="56" height="6" rx="3" fill={primary} />
    </svg>
  );
}
