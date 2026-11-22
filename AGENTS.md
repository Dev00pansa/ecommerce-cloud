<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project Permanent Rules — E-Com MarginLab

กฎถาวรสำหรับโปรเจกต์ `ecommerce-cloud` (ต้องปฏิบัติตามทุกครั้งโดยอัตโนมัติ):

## กฎข้อที่ 1: มาตรฐานสถาปัตยกรรมและโครงสร้างโค้ด (Clean Architecture)
1. **Backend-First Auth Guard:**
   - ทุก Protected Route (เช่น `/dashboard`) ต้องตรวจสอบ Session จากฝั่ง Server ผ่าน `src/middleware.ts` ร่วมกับ `@supabase/ssr` ก่อนโหลดหน้าเสมอ ห้ามปล่อยให้หน้า Protected แสดงผลแล้วค่อย Redirect ฝั่ง Client
2. **Clean Separation of Concerns (แยกหน้าที่ไฟล์ชัดเจน):**
   - `src/lib/calculator.ts`: สูตรคำนวณต้นทุน กำไรสุทธิ จุดคุ้มทุน และตัวจำลองโปรโมชันแบบ Pure Functions 100% แยกจาก UI พร้อมป้องกัน Edge Cases ทั้งหมด (ห้ามเกิด `NaN`, `Infinity`, หรือการหารด้วย 0)
   - `src/lib/auth.ts`: ฟังก์ชันตรวจสอบความถูกต้องของ Username, Email, Error Translation และระบบประเมินระดับความปลอดภัยรหัสผ่าน (`PasswordStrengthEvaluator`)
   - `src/lib/supabase/`: แยก Client (`client.ts`), Server (`server.ts`), และ Session Guard Middleware Helper (`middleware.ts`) ตามมาตรฐาน `@supabase/ssr`
   - `src/types/`: เก็บ TypeScript Interfaces และ Types ทั้งหมดของโปรเจกต์ (ห้ามใช้ `any`)
   - `src/components/`: แยกคอมโพเนนต์ย่อยตามหน้าที่ (`Navbar`, `ThemeProvider`, `AuthForm`, `PasswordStrengthMeter`, `CalculatorForm`, `KpiCards`, `PromoSimulator`, `PriceBreakdownChart`, `HistoryPanel`) ไม่เขียนยัดรวมในไฟล์เดียว
3. **Human-Readable Code:**
   - ตั้งชื่อตัวแปร/ฟังก์ชันสื่อความหมายชัดเจน และใส่คอมเมนต์สั้นๆ อธิบายการทำงานในจุดสำคัญทั้งฝั่ง Backend และ Frontend เพื่อให้เจ้าของโปรเจกต์เปิดอ่านศึกษาต่อได้ง่าย

## กฎข้อที่ 2: Auto-Backup ขึ้น GitHub ทุกครั้งที่แก้ไข
ทุกครั้งที่ผู้ใช้สั่งให้เพิ่มฟีเจอร์ แก้บั๊ก หรือปรับหน้าตาเว็บ หลังจากแก้ไขโค้ดและรัน `npm run lint` และ `npm run build` ผ่านเรียบร้อยแล้ว ให้ดำเนินการตามลำดับนี้ทันทีโดยไม่ต้องรอให้ผู้ใช้สั่งซ้ำ:
1. ตรวจสอบ `git status` เพื่อให้แน่ใจว่าไม่มีไฟล์ `.env` หรือ `.env*` หลุดเข้าไปใน staging
2. รัน `git add .`
3. รัน `git commit -m "<สรุปสิ่งที่แก้>"`
4. รัน `git push origin main` ขึ้น GitHub ทันที

## กฎข้อที่ 3: ระบบย้อนกลับฉุกเฉิน (Emergency Rollback)
หากผู้ใช้แจ้งว่าโค้ดพัง มีบั๊ก หรือสั่งให้ "ย้อนกลับไปก่อนหน้า":
1. เปิดดูประวัติ Commit ล่าสุดด้วย `git log --oneline -n 10`
2. ตรวจสอบ hash ของจุดเซฟก่อนหน้า แล้วรัน `git reset --hard <commit-hash>`
3. รัน `git push --force origin main` เพื่อกู้คืนโค้ดและให้ Vercel อัปเดตกลับไปสู่จุดเซฟก่อนหน้าทันที
