import { Router } from "express";
import { AppointmentTypeController } from "./appointmentType.controller";
import { authMiddleware } from "../../shared/middleware/auth.middleware";

const router = Router();

router.post("/", authMiddleware, AppointmentTypeController.create);
router.get("/", authMiddleware, AppointmentTypeController.findAll);
router.get("/:id", authMiddleware, AppointmentTypeController.findById);
router.put("/:id", authMiddleware, AppointmentTypeController.update);
router.delete("/:id", authMiddleware, AppointmentTypeController.delete);

export default router;