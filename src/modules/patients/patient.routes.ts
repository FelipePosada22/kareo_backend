import { Router } from "express";
import { PatientController } from "./patient.controller";
import { authMiddleware } from "../../shared/middleware/auth.middleware";

const router = Router();

router.post("/", authMiddleware, PatientController.create);
router.get("/", authMiddleware, PatientController.findAll);
router.get("/:id", authMiddleware, PatientController.findById);
router.put("/:id", authMiddleware, PatientController.update);

export default router;