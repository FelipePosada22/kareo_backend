import { Router } from "express";
import { AppointmentController } from "./appointment.controller";
import { authMiddleware } from "../../shared/middleware/auth.middleware";

const router = Router();

router.post("/", authMiddleware, AppointmentController.create);
router.get("/", authMiddleware, AppointmentController.findAll);
router.get(
  "/calendar",
  authMiddleware,
  AppointmentController.calendar
);
router.get("/:id", authMiddleware, AppointmentController.findById);
router.put("/:id", authMiddleware, AppointmentController.update);
router.delete("/:id", authMiddleware, AppointmentController.delete);

export default router;