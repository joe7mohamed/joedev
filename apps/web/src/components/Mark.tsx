/** The mark's two halves at full size (also the loading screen's mark, which flies onto the header's). */
export const FULL = { upper: 'M12 15H50L36.2 28', lower: 'M27.8 36L14 49H52', width: 7 } as const;
const SMALL = { upper: 'M12 15H50L38 26.5', lower: 'M26 37.5L14 49H52', width: 9 };

export function Mark({ size = 28, className }: { size?: number; className?: string }) {
  const cut = size < 32 ? SMALL : FULL;
  const common = {
    fill: 'none',
    strokeWidth: cut.width,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  } as const;
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={className} aria-hidden="true">
      <path d={cut.upper} stroke="var(--ink)" {...common} />
      <path d={cut.lower} stroke="var(--accent)" {...common} />
    </svg>
  );
}
