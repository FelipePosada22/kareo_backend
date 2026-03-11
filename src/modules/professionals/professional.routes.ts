import { Router } from "express";
import { ProfessionalController } from "./professional.controller";
import { authMiddleware } from "../../shared/middleware/auth.middleware";

const router = Router();

router.post("/", authMiddleware, ProfessionalController.create);
router.get("/", authMiddleware, ProfessionalController.findAll);
router.get("/:id", authMiddleware, ProfessionalController.findById);
router.put("/:id", authMiddleware, ProfessionalController.update);
router.delete("/:id", authMiddleware, ProfessionalController.delete);

export default router;