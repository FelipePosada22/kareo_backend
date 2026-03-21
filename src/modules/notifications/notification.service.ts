import { NotificationType } from "@prisma/client";
import { prisma } from "../../config/prisma";

interface CreateNotificationInput {
  tenantId: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  metadata?: Record<string, any>;
}

export class NotificationService {
  static async create(data: CreateNotificationInput) {
    return prisma.notification.create({ data });
  }

  static async findAll(userId: string, tenantId: string) {
    return prisma.notification.findMany({
      where: { userId, tenantId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  static async unreadCount(userId: string, tenantId: string) {
    const count = await prisma.notification.count({
      where: { userId, tenantId, isRead: false },
    });
    return { count };
  }

  static async markAsRead(id: string, userId: string) {
    const notification = await prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!notification) throw new Error("Notification not found");
    return prisma.notification.update({ where: { id }, data: { isRead: true } });
  }

  static async markAllAsRead(userId: string, tenantId: string) {
    await prisma.notification.updateMany({
      where: { userId, tenantId, isRead: false },
      data: { isRead: true },
    });
  }

  // Helpers para notificar a roles específicos dentro del tenant
  static async notifyRole(
    tenantId: string,
    roles: string[],
    type: NotificationType,
    title: string,
    body: string,
    metadata?: Record<string, any>
  ) {
    const users = await prisma.user.findMany({
      where: { tenantId, role: { in: roles as any[] } },
      select: { id: true },
    });

    await Promise.all(
      users.map((u: { id: string }) =>
        NotificationService.create({ tenantId, userId: u.id, type, title, body, metadata })
      )
    );
  }

  static async notifyUser(
    tenantId: string,
    userId: string,
    type: NotificationType,
    title: string,
    body: string,
    metadata?: Record<string, any>
  ) {
    await NotificationService.create({ tenantId, userId, type, title, body, metadata });
  }

  // Obtener el userId vinculado a un professional
  static async getUserIdByProfessional(professionalId: string): Promise<string | null> {
    const user = await prisma.user.findFirst({
      where: { professionalId },
      select: { id: true },
    });
    return user?.id ?? null;
  }
}
