import { Response } from "express";
import { NotificationService } from "./notification.service";

export class NotificationController {
  static async findAll(req: any, res: Response) {
    try {
      const notifications = await NotificationService.findAll(req.user.id, req.user.tenantId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Error fetching notifications" });
    }
  }

  static async unreadCount(req: any, res: Response) {
    try {
      const result = await NotificationService.unreadCount(req.user.id, req.user.tenantId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Error fetching unread count" });
    }
  }

  static async markAsRead(req: any, res: Response) {
    try {
      const notification = await NotificationService.markAsRead(req.params.id, req.user.id);
      res.json(notification);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async markAllAsRead(req: any, res: Response) {
    try {
      await NotificationService.markAllAsRead(req.user.id, req.user.tenantId);
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Error updating notifications" });
    }
  }
}
