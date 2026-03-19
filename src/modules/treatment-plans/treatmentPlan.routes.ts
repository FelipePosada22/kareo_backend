import { Router } from "express";
import { TreatmentPlanController } from "./treatmentPlan.controller";
import { authMiddleware } from "../../shared/middleware/auth.middleware";

const router = Router();

router.post("/", authMiddleware, TreatmentPlanController.create);
router.get("/", authMiddleware, TreatmentPlanController.findAll);
router.get("/patient/:patientId", authMiddleware, TreatmentPlanController.findByPatient);
router.get("/:id", authMiddleware, TreatmentPlanController.findById);
router.patch("/items/:itemId/status", authMiddleware, TreatmentPlanController.updateItemStatus);
router.patch("/items/:itemId", authMiddleware, TreatmentPlanController.updateItem);
router.delete("/items/:itemId", authMiddleware, TreatmentPlanController.deleteItem);
router.delete("/:id", authMiddleware, TreatmentPlanController.remove);

export default router;
