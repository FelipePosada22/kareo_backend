import { Router } from "express";
import { ClinicController } from "./clinic.controller";
import { authMiddleware } from "../../shared/middleware/auth.middleware";

const router = Router();

router.get("/", authMiddleware, ClinicController.get);
router.put("/", authMiddleware, ClinicController.update);

export default router;
