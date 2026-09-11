// server/services/notification.service.ts
import { getFallbackState, withFallbackTx } from "../db/fallback-engine";
import { DbNotification, NotificationType } from "../db/types";

export async function createNotification(params: {
  userId: number;
  title: string;
  message: string;
  type?: NotificationType;
  link?: string;
}): Promise<DbNotification> {
  const notif: DbNotification = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    user_id: params.userId,
    title: params.title,
    message: params.message,
    type: params.type || "INFO",
    is_read: false,
    link: params.link || null,
    created_at: new Date().toISOString(),
  };

  await withFallbackTx(async ({ state }) => {
    state.notifications.unshift(notif);
  });

  return notif;
}

export function getUserNotifications(userId: number, limit = 20): DbNotification[] {
  const state = getFallbackState();
  return state.notifications
    .filter((n) => n.user_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);
}

export async function markAsRead(notificationId: number, userId: number): Promise<boolean> {
  return withFallbackTx(async ({ state }) => {
    const notif = state.notifications.find((n) => n.id === notificationId && n.user_id === userId);
    if (!notif) return false;
    notif.is_read = true;
    return true;
  });
}

export function getUnreadCount(userId: number): number {
  const state = getFallbackState();
  return state.notifications.filter((n) => n.user_id === userId && !n.is_read).length;
}
