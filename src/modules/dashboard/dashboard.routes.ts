import { Router } from "express";
import { DashboardController } from "./dashboard.controller";
import { authMiddleware } from "../../shared/middleware/auth.middleware";

const router = Router();

router.get("/", authMiddleware, DashboardController.getSummary);

export default router;
