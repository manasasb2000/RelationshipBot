import Link from 'next/link';
export function HeartMark({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      width="35"
      height="35"
      viewBox="0 0 40 40"
      fill="none"
    >
      <path
        d="M20 34S5 24.5 5 14.8C5 6 16 4.5 20 12c4-7.5 15-6 15 2.8C35 24.5 20 34 20 34Z"
        fill="currentColor"
      />
      <path
        d="M12 13c0-3 4-4 6-1"
        stroke="white"
        strokeOpacity=".65"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 25c5-7 13-5 17-12"
        stroke="white"
        strokeOpacity=".55"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
export function Logo() {
  return (
    <Link href="/" aria-label="LoveStory home" className="brand">
      <HeartMark />
      <span>
        LoveStory<span className="brand-dot">.</span>
      </span>
    </Link>
  );
}
