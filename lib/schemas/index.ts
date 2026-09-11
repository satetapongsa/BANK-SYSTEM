// lib/schemas/index.ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("กรุณากรอกอีเมลที่ถูกต้อง").toLowerCase().trim(),
  password: z.string().min(6, "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร"),
});

export const registerSchema = z.object({
  email: z.string().email("กรุณากรอกอีเมลที่ถูกต้อง").toLowerCase().trim(),
  password: z.string().min(8, "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร"),
  first_name: z.string().min(2, "กรุณากรอกชื่อจริง").trim(),
  last_name: z.string().min(2, "กรุณากรอกนามสกุล").trim(),
  phone: z.string().min(9, "กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง").trim(),
});

export const depositSchema = z.object({
  account_id: z.number().int().positive("รหัสบัญชีไม่ถูกต้อง"),
  amount: z
    .number({ invalid_type_error: "กรุณาระบุจำนวนเงินเป็นตัวเลข" })
    .positive("จำนวนเงินต้องมากกว่า 0.00 บาท")
    .max(10_000_000, "จำนวนเงินต่อรายการต้องไม่เกิน 10,000,000.00 บาท"),
  description: z.string().max(255).optional().default("ฝากเงินเข้าบัญชี"),
});

export const withdrawSchema = z.object({
  account_id: z.number().int().positive("รหัสบัญชีไม่ถูกต้อง"),
  amount: z
    .number({ invalid_type_error: "กรุณาระบุจำนวนเงินเป็นตัวเลข" })
    .positive("จำนวนเงินต้องมากกว่า 0.00 บาท")
    .max(10_000_000, "จำนวนเงินต่อรายการต้องไม่เกิน 10,000,000.00 บาท"),
  description: z.string().max(255).optional().default("ถอนเงินสด"),
});

export const transferSchema = z.object({
  from_account_id: z.number().int().positive("รหัสบัญชีต้นทางไม่ถูกต้อง"),
  to_account_number: z
    .string()
    .min(10, "เลขที่บัญชีปลายทางต้องมีอย่างน้อย 10 หลัก")
    .max(20, "เลขที่บัญชีปลายทางไม่ถูกต้อง")
    .trim(),
  amount: z
    .number({ invalid_type_error: "กรุณาระบุจำนวนเงินเป็นตัวเลข" })
    .positive("จำนวนเงินต้องมากกว่า 0.00 บาท")
    .max(10_000_000, "จำนวนเงินต่อรายการต้องไม่เกิน 10,000,000.00 บาท"),
  description: z.string().max(255).optional().default("โอนเงิน"),
  idempotency_key: z.string().min(8).max(128).optional(),
});

export const adminAdjustmentSchema = z.object({
  account_id: z.number().int().positive("รหัสบัญชีไม่ถูกต้อง"),
  type: z.enum(["CREDIT", "DEBIT"], {
    errorMap: () => ({ message: "ประเภทการปรับปรุงต้องเป็น CREDIT หรือ DEBIT" }),
  }),
  amount: z
    .number({ invalid_type_error: "กรุณาระบุจำนวนเงินเป็นตัวเลข" })
    .positive("จำนวนเงินต้องมากกว่า 0.00 บาท")
    .max(50_000_000, "ยอดปรับปรุงต้องไม่เกิน 50,000,000.00 บาท"),
  reason: z.string().min(5, "ต้องระบุเหตุผลในการปรับปรุงยอดเงินอย่างน้อย 5 ตัวอักษร"),
});

export const updateUserStatusSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED"]),
  reason: z.string().min(3, "ต้องระบุเหตุผลในการเปลี่ยนสถานะสมาชิก"),
});

export const updateAccountStatusSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED", "CLOSED"]),
  reason: z.string().min(3, "ต้องระบุเหตุผลในการเปลี่ยนสถานะบัญชี"),
});
