// server/services/user.service.ts
import bcrypt from "bcryptjs";
import { getFallbackState, withFallbackTx } from "../db/fallback-engine";
import { DbUser, UserStatus, UserRole } from "../db/types";
import { logAudit } from "./audit.service";
import { createBankAccount } from "./account.service";

export function getUserById(id: number): DbUser | undefined {
  const state = getFallbackState();
  return state.users.find((u) => u.id === id);
}

export function getUserByEmail(email: string): DbUser | undefined {
  const state = getFallbackState();
  return state.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
}

export function getAllUsers(): Omit<DbUser, "password_hash">[] {
  const state = getFallbackState();
  return state.users.map(({ password_hash, ...rest }) => rest);
}

export async function createUser(params: {
  email: string;
  password: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  phone?: string;
  initialDeposit?: number;
  actorId?: number;
}): Promise<Omit<DbUser, "password_hash">> {
  const state = getFallbackState();
  const existing = state.users.find((u) => u.email.toLowerCase() === params.email.toLowerCase().trim());
  if (existing) {
    throw new Error("EMAIL_ALREADY_EXISTS: อีเมลนี้ลงทะเบียนในระบบแล้ว");
  }

  const password_hash = await bcrypt.hash(params.password, 10);
  const now = new Date().toISOString();
  const newUser: DbUser = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    email: params.email.toLowerCase().trim(),
    password_hash,
    role: params.role,
    first_name: params.first_name.trim(),
    last_name: params.last_name.trim(),
    phone: params.phone || null,
    status: "ACTIVE",
    created_at: now,
    updated_at: now,
    last_login_at: null,
  };

  await withFallbackTx(async ({ state }) => {
    state.users.push(newUser);
  });

  // Automatically provision a bank account for new members
  if (newUser.role === "MEMBER") {
    await createBankAccount({
      userId: newUser.id,
      accountType: "SAVINGS",
      initialDeposit: params.initialDeposit || 0,
      actorId: params.actorId || newUser.id,
    });
  }

  await logAudit({
    actorUserId: params.actorId || newUser.id,
    action: "USER_REGISTERED",
    entityType: "USER",
    entityId: newUser.email,
    afterData: { email: newUser.email, role: newUser.role, name: `${newUser.first_name} ${newUser.last_name}` },
    reason: "New user account created",
  });

  const { password_hash: _, ...safeUser } = newUser;
  return safeUser;
}

export async function updateUserStatus(
  userId: number,
  newStatus: UserStatus,
  reason: string,
  actorId: number
): Promise<DbUser> {
  return withFallbackTx(async ({ state }) => {
    const user = state.users.find((u) => u.id === userId);
    if (!user) throw new Error("USER_NOT_FOUND: ไม่พบผู้ใช้งาน");
    if (user.role === "ADMIN") {
      throw new Error("CANNOT_SUSPEND_ADMIN: ไม่สามารถระงับบัญชีผู้ดูแลระบบ (Admin) ได้");
    }

    const beforeStatus = user.status;
    user.status = newStatus;
    user.updated_at = new Date().toISOString();

    await logAudit({
      actorUserId: actorId,
      action: `USER_STATUS_${newStatus}`,
      entityType: "USER",
      entityId: user.email,
      beforeData: { status: beforeStatus },
      afterData: { status: newStatus },
      reason,
    });

    return user;
  });
}
