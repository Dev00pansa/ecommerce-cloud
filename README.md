# KhumLab `v1.0.0`

**Live App:** https://khumlab.vercel.app

เว็บแอปพลิเคชันสำหรับผู้ขายออนไลน์และเจ้าของแบรนด์ E-Commerce ช่วยคำนวณต้นทุนจริง ตั้งราคาขาย หาจุดคุ้มทุน และวิเคราะห์ความเสี่ยงก่อนจัดโปรโมชันหรือยิงโฆษณา

## ความสามารถหลัก

- **คำนวณต้นทุนและค่าธรรมเนียมแพลตฟอร์ม (GP):** รองรับค่าเริ่มต้นของ Shopee (13%), TikTok Shop (12%), Lazada (12%), ขายตรง (0%) และปรับเปอร์เซ็นต์เองได้ตามจริง พร้อมหักค่าแพ็ก ค่าโฆษณา และต้นทุนคงที่ครบถ้วน
- **กราฟวิเคราะห์และระบบวินิจฉัยกำไรเชิงลึก:** ประเมินคะแนนสุขภาพกำไร (`0–100` / เกรด `S–D`), กราฟวงแหวนสัดส่วนต้นทุน, กราฟจำลองส่วนลด `0%–50%`, กราฟคาดการณ์กำไรตามยอดขาย, คำนวณความเสี่ยงพัสดุตีกลับ, Max Safe CPA / Break-Even ROAS และราคาขายแนะนำ 3 ระดับ
- **คลาวด์เก็บข้อมูลส่วนตัว (สูงสุด 20 รายการ/บัญชี):** บันทึก แก้ไข ลบแบบเดี่ยวหรือหลายรายการพร้อมกันได้แบบ Realtime พร้อมบีบอัดรูปสินค้าอัตโนมัติ (ไม่เกิน 120 KB) และระบบป้องกันชื่อซ้ำ
- **ส่งออกตาราง CSV แบบเลือกคอลัมน์ได้:** เลือกรายการสินค้าและหัวข้อข้อมูลที่ต้องการส่งออกลงไฟล์เดียว เปิดใช้งานใน Excel และ Google Sheets ได้ทันที
- **ความปลอดภัยบัญชีผู้ใช้:** ปกป้องเส้นทางฝั่ง Server ด้วย Supabase SSR, ล็อกอินด้วย Username แบบตรงตัวพิมพ์เล็ก-ใหญ่, คูลดาวน์ป้องกันสแปม และ Row-Level Security (RLS) แยกข้อมูลตามบัญชี 100%

## เทคโนโลยีที่ใช้ (Tech Stack)

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Backend & Cloud:** Supabase (Auth, PostgreSQL, Storage, Realtime, RLS)
- **Hosting:** Vercel (Function Region `sin1` Singapore)

## การติดตั้งเพื่อรันบนเครื่อง (Local Development)

1. โคลนโปรเจกต์และติดตั้ง Dependencies:

```bash
git clone https://github.com/Dev00pansa/ecommerce-cloud.git
cd ecommerce-cloud
npm install
```

2. สร้างไฟล์ `.env.local` ที่โฟลเดอร์หลักของโปรเจกต์และใส่ค่าจาก Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

3. รันเซิร์ฟเวอร์พัฒนา:

```bash
npm run dev
```

เปิดเบราว์เซอร์ไปที่ https://khumlab.vercel.app/ เพื่อเริ่มใช้งาน
