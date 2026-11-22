"use client";

interface KhumLabLogoProps {
  size?: number;
  className?: string;
  variant?: "mark" | "hero";
}

/**
 * โลโก้เวกเตอร์แบรนด์ KhumLab พื้นหลังโปร่งใส 100%
 * - variant="mark": ใช้ใน Navbar และ Footer
 * - variant="hero": ใช้ในฝั่งขวาของส่วน Hero หน้าแรก พร้อมวงแหวนโคจรและแอนิเมชันลอยตัว 3 มิติ
 */
export function KhumLabLogo({
  size = 36,
  className = "",
  variant = "mark",
}: KhumLabLogoProps) {
  if (variant === "hero") {
    return (
      <div className="relative flex items-center justify-center select-none py-6">
        {/* แสงเรืองสีเขียวมรกตฟุ้งด้านหลังโลโก้ */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute h-[280px] w-[280px] sm:h-[340px] sm:w-[340px] rounded-full bg-emerald-500/20 blur-3xl animate-pulse"
        />

        {/* วงแหวนแสงโคจรด้านนอกหมุนช้าๆ */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute h-[270px] w-[270px] sm:h-[330px] sm:w-[330px] rounded-full border border-emerald-500/20 border-dashed animate-orbit-slow"
        />

        {/* วงแหวนโคจรวงในหมุนสวนทาง */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute h-[225px] w-[225px] sm:h-[275px] sm:w-[275px] rounded-full border border-emerald-400/15 animate-orbit-reverse"
        >
          <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]" />
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-emerald-300/70" />
        </div>

        {/* ตัวโลโก้หลักลอยตัว 3 มิติ + เรืองแสงชัดขึ้นเมื่อชี้เมาส์ */}
        <div className="group relative z-10 animate-khum-logo-3d transition-transform duration-500 hover:scale-105">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 256 256"
            fill="none"
            className="h-[250px] w-[250px] sm:h-[310px] sm:w-[310px] drop-shadow-[0_0_28px_rgba(16,185,129,0.38)] transition-all duration-500 group-hover:drop-shadow-[0_0_44px_rgba(52,211,153,0.62)]"
          >
            <defs>
              <linearGradient
                id="heroKhumEmerald"
                x1="24"
                y1="24"
                x2="232"
                y2="232"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#6EE7B7" />
                <stop offset="50%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#047857" />
              </linearGradient>
              <linearGradient
                id="heroKhumSilver"
                x1="48"
                y1="36"
                x2="200"
                y2="220"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="65%" stopColor="#E2E8F0" />
                <stop offset="100%" stopColor="#94A3B8" />
              </linearGradient>
              <linearGradient
                id="heroKhumAccent"
                x1="110"
                y1="40"
                x2="224"
                y2="140"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#A7F3D0" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
            </defs>

            {/* กรอบหกเหลี่ยมเรขาคณิตพื้นหลังโปร่งใส */}
            <path
              d="M128 16L226 72V184L128 240L30 184V72L128 16Z"
              stroke="url(#heroKhumEmerald)"
              strokeWidth="9"
              strokeLinejoin="round"
            />
            <path
              d="M128 34L210 81V175L128 222L46 175V81L128 34Z"
              stroke="#34D399"
              strokeWidth="2"
              strokeDasharray="12 10"
              opacity="0.55"
            />

            {/* แกนตั้งตัว K สีขาวเงินคมชัด */}
            <rect
              x="68"
              y="62"
              width="28"
              height="132"
              rx="8"
              fill="url(#heroKhumSilver)"
            />

            {/* ปีกบนตัว K พุ่งขึ้นสื่อถึงกำไรและจุดคุ้มทุน */}
            <path
              d="M106 124L164 64C167.5 60.4 172.3 58.4 177.3 58.4H194C198.4 58.4 200.7 63.7 197.6 66.9L136 130L106 124Z"
              fill="url(#heroKhumAccent)"
            />
            <path
              d="M168 58H198V88"
              stroke="#A7F3D0"
              strokeWidth="6.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* ขาล่างตัว K สีเขียวมรกต */}
            <path
              d="M114 118L196 187C200 190.4 197.6 197 192.3 197H165.5C161 197 156.7 195.2 153.5 192.1L102 142L114 118Z"
              fill="url(#heroKhumEmerald)"
            />

            {/* จุดสมดุลเพชรตรงกลาง */}
            <polygon
              points="110,114 126,128 110,142 94,128"
              fill="#FFFFFF"
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
          id="markKhumEmerald"
          x1="24"
          y1="24"
          x2="232"
          y2="232"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="55%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient
          id="markKhumSilver"
          x1="48"
          y1="36"
          x2="200"
          y2="220"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="65%" stopColor="#E2E8F0" />
          <stop offset="100%" stopColor="#94A3B8" />
        </linearGradient>
      </defs>
      <path
        d="M128 16L226 72V184L128 240L30 184V72L128 16Z"
        stroke="url(#markKhumEmerald)"
        strokeWidth="13"
        strokeLinejoin="round"
      />
      <rect
        x="68"
        y="62"
        width="30"
        height="132"
        rx="8"
        fill="url(#markKhumSilver)"
      />
      <path d="M106 124L168 62H198L136 130L106 124Z" fill="#34D399" />
      <path
        d="M114 118L196 194H162L102 142L114 118Z"
        fill="url(#markKhumEmerald)"
      />
      <polygon points="110,114 126,128 110,142 94,128" fill="#FFFFFF" />
    </svg>
  );
}
