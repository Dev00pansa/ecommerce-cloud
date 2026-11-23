import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt =
  "KhumLab — ระบบคำนวณต้นทุน ตั้งราคาขาย และวิเคราะห์จุดคุ้มทุน E-Commerce";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const fontBoldPromise = readFile(
  join(process.cwd(), "src/assets/fonts/IBMPlexSansThai-Bold.ttf")
);
const fontRegularPromise = readFile(
  join(process.cwd(), "src/assets/fonts/IBMPlexSansThai-Regular.ttf")
);

export default async function TwitterImage() {
  const [fontBold, fontRegular] = await Promise.all([
    fontBoldPromise,
    fontRegularPromise,
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: "#050505",
          backgroundImage:
            "radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.28) 0%, rgba(16, 185, 129, 0.08) 44%, rgba(5, 5, 5, 0) 76%)",
          padding: "42px",
          fontFamily: "IBM Plex Sans Thai",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            borderRadius: "28px",
            border: "1.5px solid rgba(16, 185, 129, 0.34)",
            backgroundColor: "rgba(5, 5, 5, 0.88)",
            boxShadow: "0 0 60px rgba(16, 185, 129, 0.14)",
            padding: "56px 68px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              width: "660px",
              height: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                alignSelf: "flex-start",
                gap: "10px",
                borderRadius: "9999px",
                border: "1px solid rgba(16, 185, 129, 0.4)",
                backgroundColor: "rgba(16, 185, 129, 0.12)",
                padding: "8px 18px",
                fontSize: "18px",
                fontWeight: 700,
                color: "#34d399",
                letterSpacing: "0.08em",
              }}
            >
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "9999px",
                  backgroundColor: "#10b981",
                }}
              />
              <span>DIGITAL FOR E-COMMERCE</span>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "18px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "16px",
                }}
              >
                <span
                  style={{
                    fontSize: "86px",
                    fontWeight: 700,
                    color: "#ffffff",
                    letterSpacing: "-0.03em",
                    lineHeight: 1,
                  }}
                >
                  KhumLab
                </span>
              </div>

              <div
                style={{
                  width: "84px",
                  height: "4px",
                  borderRadius: "9999px",
                  backgroundColor: "#10b981",
                }}
              />

              <div
                style={{
                  display: "flex",
                  fontSize: "30px",
                  fontWeight: 400,
                  color: "#d4d4d8",
                  lineHeight: 1.45,
                }}
              >
                ระบบคำนวณต้นทุน ตั้งราคาขาย และวิเคราะห์จุดคุ้มทุน E-Commerce
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  borderRadius: "12px",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  backgroundColor: "rgba(16, 185, 129, 0.08)",
                  padding: "8px 18px",
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#34d399",
                }}
              >
                khumlab.vercel.app
              </div>
              <span
                style={{
                  fontSize: "19px",
                  fontWeight: 400,
                  color: "#71717a",
                }}
              >
                Cloud Sync · CSV Export · Smart Advisor
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "300px",
              height: "300px",
              borderRadius: "40px",
              backgroundImage:
                "radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.24) 0%, rgba(16, 185, 129, 0.04) 58%, rgba(5, 5, 5, 0) 76%)",
            }}
          >
            <svg
              width="260"
              height="260"
              viewBox="0 0 256 256"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M24 78V42L42 24H78"
                stroke="#10B981"
                strokeWidth="9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M178 24H214L232 42V78"
                stroke="#34D399"
                strokeWidth="9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M232 178V214L214 232H178"
                stroke="#10B981"
                strokeWidth="9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M78 232H42L24 214V178"
                stroke="#059669"
                strokeWidth="9"
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
                strokeWidth="2"
                strokeDasharray="10 8"
                strokeOpacity="0.35"
              />
              <rect x="44" y="56" width="24" height="144" rx="6" fill="#F8FAFC" />
              <path
                d="M72 124L114 59C116.2 55.6 120 53.5 124.1 53.5H139L92 132L72 124Z"
                fill="#E2E8F0"
              />
              <path
                d="M84 118L140 200H114.5C110.2 200 106.2 197.8 103.9 194.2L72 144L84 118Z"
                fill="#10B981"
              />
              <polygon points="74,116 86,128 74,140 62,128" fill="#FFFFFF" />
              <path
                d="M152 68L166 54H178V176H220V200H158C154.7 200 152 197.3 152 194V68Z"
                fill="#34D399"
              />
              <rect
                x="188"
                y="138"
                width="10"
                height="26"
                rx="3"
                fill="#34D399"
                fillOpacity="0.75"
              />
              <rect x="204" y="116" width="10" height="48" rx="3" fill="#A7F3D0" />
            </svg>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "IBM Plex Sans Thai",
          data: fontBold,
          style: "normal",
          weight: 700,
        },
        {
          name: "IBM Plex Sans Thai",
          data: fontRegular,
          style: "normal",
          weight: 400,
        },
      ],
    }
  );
}
