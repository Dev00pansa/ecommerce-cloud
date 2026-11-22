"use client";

interface KhumLabLogoProps {
  size?: number;
  className?: string;
  variant?: "mark" | "hero";
}

export function KhumLabLogo({
  size = 36,
  className = "",
  variant = "mark",
}: KhumLabLogoProps) {
  if (variant === "hero") {
    return (
      <div className="relative flex items-center justify-center select-none py-4">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute h-[280px] w-[280px] sm:h-[340px] sm:w-[340px] rounded-full bg-emerald-500/20 blur-3xl animate-pulse"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute h-[270px] w-[270px] sm:h-[330px] sm:w-[330px] rounded-full border border-emerald-500/20 border-dashed animate-orbit-slow"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute h-[225px] w-[225px] sm:h-[275px] sm:w-[275px] rounded-full border border-emerald-400/15 animate-orbit-reverse"
        >
          <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]" />
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-emerald-300/70" />
        </div>

        <div className="group relative z-10 animate-khum-logo-3d transition-transform duration-500 hover:scale-105">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 256 256"
            fill="none"
            className="h-[250px] w-[250px] sm:h-[310px] sm:w-[310px] drop-shadow-[0_0_28px_rgba(16,185,129,0.38)] transition-all duration-500 group-hover:drop-shadow-[0_0_44px_rgba(52,211,153,0.62)]"
          >
            <defs>
              <linearGradient
                id="heroKlEmerald"
                x1="32"
                y1="40"
                x2="228"
                y2="216"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#6EE7B7" />
                <stop offset="50%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#047857" />
              </linearGradient>
              <linearGradient
                id="heroKlSilver"
                x1="40"
                y1="48"
                x2="148"
                y2="204"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="65%" stopColor="#E2E8F0" />
                <stop offset="100%" stopColor="#94A3B8" />
              </linearGradient>
              <linearGradient
                id="heroKlBright"
                x1="140"
                y1="48"
                x2="224"
                y2="204"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#A7F3D0" />
                <stop offset="45%" stopColor="#34D399" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>

            <path
              d="M24 78V42L42 24H78"
              stroke="url(#heroKlEmerald)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M178 24H214L232 42V78"
              stroke="url(#heroKlEmerald)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M232 178V214L214 232H178"
              stroke="url(#heroKlEmerald)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M78 232H42L24 214V178"
              stroke="url(#heroKlEmerald)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <rect
              x="36"
              y="36"
              width="184"
              height="184"
              rx="18"
              stroke="#34D399"
              strokeWidth="1.75"
              strokeDasharray="10 8"
              opacity="0.35"
            />

            <rect
              x="44"
              y="56"
              width="24"
              height="144"
              rx="6"
              fill="url(#heroKlSilver)"
            />
            <path
              d="M72 124L114 59C116.2 55.6 120 53.5 124.1 53.5H139L92 132L72 124Z"
              fill="url(#heroKlSilver)"
            />
            <path
              d="M84 118L140 200H114.5C110.2 200 106.2 197.8 103.9 194.2L72 144L84 118Z"
              fill="url(#heroKlEmerald)"
            />
            <polygon
              points="74,116 86,128 74,140 62,128"
              fill="#FFFFFF"
            />

            <path
              d="M152 68L166 54H178V176H220V200H158C154.7 200 152 197.3 152 194V68Z"
              fill="url(#heroKlBright)"
            />
            <rect
              x="188"
              y="138"
              width="10"
              height="26"
              rx="3"
              fill="#34D399"
              opacity="0.75"
            />
            <rect
              x="204"
              y="116"
              width="10"
              height="48"
              rx="3"
              fill="#A7F3D0"
            />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      fill="none"
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="markKlEmerald"
          x1="24"
          y1="24"
          x2="232"
          y2="232"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#6EE7B7" />
          <stop offset="50%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient
          id="markKlSilver"
          x1="40"
          y1="48"
          x2="148"
          y2="204"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="65%" stopColor="#E2E8F0" />
          <stop offset="100%" stopColor="#94A3B8" />
        </linearGradient>
      </defs>

      <path
        d="M22 78V40L40 22H78"
        stroke="url(#markKlEmerald)"
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M178 22H216L234 40V78"
        stroke="url(#markKlEmerald)"
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M234 178V216L216 234H178"
        stroke="url(#markKlEmerald)"
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M78 234H40L22 216V178"
        stroke="url(#markKlEmerald)"
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <rect
        x="44"
        y="56"
        width="26"
        height="144"
        rx="6"
        fill="url(#markKlSilver)"
      />
      <path
        d="M72 124L114 56H140L92 132L72 124Z"
        fill="url(#markKlSilver)"
      />
      <path
        d="M84 118L140 200H112L72 144L84 118Z"
        fill="url(#markKlEmerald)"
      />
      <polygon points="74,116 86,128 74,140 62,128" fill="#FFFFFF" />

      <path
        d="M152 68L166 54H180V174H220V200H158C154.7 200 152 197.3 152 194V68Z"
        fill="url(#markKlEmerald)"
      />
      <rect x="200" y="122" width="14" height="38" rx="3" fill="#A7F3D0" />
    </svg>
  );
}
