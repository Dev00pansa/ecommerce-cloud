<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project Permanent Rules — E-Com MarginLab

กฎถาวรสำหรับโปรเจกต์ `ecommerce-cloud` (ต้องปฏิบัติตามทุกครั้งโดยอัตโนมัติ):

## กฎข้อที่ 1: Auto-Backup ขึ้น GitHub ทุกครั้งที่แก้ไข
ทุกครั้งที่ผู้ใช้สั่งให้เพิ่มฟีเจอร์ แก้บั๊ก หรือปรับหน้าตาเว็บ หลังจากแก้ไขโค้ดและรัน `npm run build` (และ `npm run lint`) ผ่านเรียบร้อยแล้ว ให้ดำเนินการตามลำดับนี้ทันทีโดยไม่ต้องรอให้ผู้ใช้สั่งซ้ำ:
1. ตรวจสอบ `git status` เพื่อให้แน่ใจว่าไม่มีไฟล์ `.env` หรือ `.env*` หลุดเข้าไปใน staging
2. รัน `git add .`
3. รัน `git commit -m "<สรุปสิ่งที่แก้>"`
4. รัน `git push origin main` ขึ้น GitHub ทันที

## กฎข้อที่ 2: ระบบย้อนกลับฉุกเฉิน (Emergency Rollback)
หากผู้ใช้แจ้งว่าโค้ดพัง มีบั๊ก หรือสั่งให้ "ย้อนกลับไปก่อนหน้า":
1. เปิดดูประวัติ Commit ล่าสุดด้วย `git log --oneline -n 10`
2. ตรวจสอบ hash ของจุดเซฟก่อนหน้า แล้วรัน `git reset --hard <commit-hash>`
3. รัน `git push --force origin main` เพื่อกู้คืนโค้ดและให้ Vercel อัปเดตกลับไปสู่จุดเซฟก่อนหน้าทันที
