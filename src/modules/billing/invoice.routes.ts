import { Router } from "express";
import { InvoiceController } from "./invoice.controller";
import { authMiddleware } from "../../shared/middleware/auth.middleware";

const router = Router();

router.post("/", authMiddleware, InvoiceController.create);
router.get("/", authMiddleware, InvoiceController.findAll);
router.get("/:id", authMiddleware, InvoiceController.findById);
router.patch("/:id/status", authMiddleware, InvoiceController.updateStatus);
router.post("/:id/payments", authMiddleware, InvoiceController.addPayment);

export default router;
