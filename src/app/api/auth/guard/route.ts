import { NextResponse, type NextRequest } from "next/server";

interface RateLimitBucket {
  timestamps: number[];
  lockedUntil: number;
}

const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 60_000;
const MIN_HUMAN_TIME_MS = 1_500;

const rateLimitStore = new Map<string, RateLimitBucket>();

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  return realIp || "unknown-ip";
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      action?: string;
      honeypot?: string;
      elapsedMs?: number;
      humanVerified?: boolean;
    };

    const action = body.action === "register" ? "register" : "login";
    const honeypot = typeof body.honeypot === "string" ? body.honeypot.trim() : "";
    const elapsedMs = typeof body.elapsedMs === "number" ? body.elapsedMs : 0;

    if (honeypot.length > 0) {
      return NextResponse.json(
        {
          allowed: false,
          error: "ระบบตรวจพบพฤติกรรมอัตโนมัติที่ผิดปกติ คำขอถูกปฏิเสธ",
        },
        { status: 403 }
      );
    }

    if (!Number.isFinite(elapsedMs) || elapsedMs < MIN_HUMAN_TIME_MS) {
      return NextResponse.json(
        {
          allowed: false,
          error: "ส่งข้อมูลเร็วผิดปกติ กรุณารอสักครู่แล้วลองใหม่อีกครั้ง",
        },
        { status: 403 }
      );
    }

    if (action === "register" && body.humanVerified !== true) {
      return NextResponse.json(
        {
          allowed: false,
          error: "กรุณาเลื่อนแถบยืนยันตัวตนเพื่อยืนยันว่าไม่ใช่บอท",
        },
        { status: 403 }
      );
    }

    const ip = getClientIp(request);
    const key = `${ip}:${action}`;
    const now = Date.now();

    if (rateLimitStore.size > 2000) {
      for (const [k, v] of rateLimitStore.entries()) {
        if (v.lockedUntil < now && v.timestamps.every((t) => now - t > WINDOW_MS)) {
          rateLimitStore.delete(k);
        }
      }
    }

    const existing = rateLimitStore.get(key) ?? {
      timestamps: [],
      lockedUntil: 0,
    };

    if (existing.lockedUntil > now) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((existing.lockedUntil - now) / 1000)
      );
      return NextResponse.json(
        {
          allowed: false,
          retryAfterSeconds,
          error: `ทำรายการเกินกำหนด กรุณารออีก ${retryAfterSeconds} วินาทีก่อนลองใหม่อีกครั้ง`,
        },
        { status: 429 }
      );
    }

    const recentTimestamps = existing.timestamps.filter(
      (timestamp) => now - timestamp < WINDOW_MS
    );

    if (recentTimestamps.length >= MAX_ATTEMPTS) {
      const lockedUntil = now + LOCKOUT_MS;
      rateLimitStore.set(key, {
        timestamps: recentTimestamps,
        lockedUntil,
      });
      const retryAfterSeconds = Math.ceil(LOCKOUT_MS / 1000);
      return NextResponse.json(
        {
          allowed: false,
          retryAfterSeconds,
          error: `พยายามทำรายการเกิน 5 ครั้งภายใน 1 นาที ระบบล็อกชั่วคราว กรุณารอ ${retryAfterSeconds} วินาที`,
        },
        { status: 429 }
      );
    }

    recentTimestamps.push(now);
    rateLimitStore.set(key, {
      timestamps: recentTimestamps,
      lockedUntil: 0,
    });

    return NextResponse.json({ allowed: true });
  } catch {
    return NextResponse.json(
      {
        allowed: false,
        error: "คำขอไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง",
      },
      { status: 400 }
    );
  }
}
