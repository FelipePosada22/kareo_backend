import { Router } from "express";
import { ScheduleController } from "./schedule.controller";
import { authMiddleware } from "../../shared/middleware/auth.middleware";

const router = Router();

router.post("/", authMiddleware, ScheduleController.create);

router.get(
  "/professional/:professionalId",
  authMiddleware,
  ScheduleController.findByProfessional
);

router.put("/:id", authMiddleware, ScheduleController.update);

router.delete("/:id", authMiddleware, ScheduleController.delete);

export default router;