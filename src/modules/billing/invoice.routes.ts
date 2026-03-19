import { Router } from "express";
import { InvoiceController } from "./invoice.controller";
import { authMiddleware } from "../../shared/middleware/auth.middleware";

const router = Router();

router.post("/", authMiddleware, InvoiceController.create);
router.get("/", authMiddleware, InvoiceController.findAll);
router.post("/from-treatment-plan/:treatmentPlanId", authMiddleware, InvoiceController.createFromTreatmentPlan);
router.get("/:id", authMiddleware, InvoiceController.findById);
router.get("/:id/summary", authMiddleware, InvoiceController.getSummary);
router.patch("/:id/status", authMiddleware, InvoiceController.updateStatus);
router.patch("/:id", authMiddleware, InvoiceController.updateDraft);
router.post("/:id/items", authMiddleware, InvoiceController.addItem);
router.patch("/:id/items/:itemId", authMiddleware, InvoiceController.updateItem);
router.delete("/:id/items/:itemId", authMiddleware, InvoiceController.removeItem);
router.post("/:id/payments", authMiddleware, InvoiceController.addPayment);

export default router;
