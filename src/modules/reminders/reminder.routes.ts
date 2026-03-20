import { Router } from "express";
import { ReminderController } from "./reminder.controller";
import { authMiddleware } from "../../shared/middleware/auth.middleware";

const router = Router();

// POST /reminders/appointments/:appointmentId/send → envío manual
router.post(
  "/appointments/:appointmentId/send",
  authMiddleware,
  ReminderController.sendManual
);

// GET /reminders/appointments/:appointmentId → historial de recordatorios
router.get(
  "/appointments/:appointmentId",
  authMiddleware,
  ReminderController.findByAppointment
);

export default router;
