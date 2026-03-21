import { Router } from "express";
import { NotificationController } from "./notification.controller";
import { authMiddleware } from "../../shared/middleware/auth.middleware";

const router = Router();

router.get("/", authMiddleware, NotificationController.findAll);
router.get("/unread-count", authMiddleware, NotificationController.unreadCount);
router.patch("/read-all", authMiddleware, NotificationController.markAllAsRead);
router.patch("/:id/read", authMiddleware, NotificationController.markAsRead);

export default router;
