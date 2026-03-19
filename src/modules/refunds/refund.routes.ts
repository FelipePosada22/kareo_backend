import { Router } from "express";
import { RefundController } from "./refund.controller";
import { authMiddleware } from "../../shared/middleware/auth.middleware";

const router = Router();

router.post("/", authMiddleware, RefundController.create);
router.get("/invoice/:invoiceId", authMiddleware, RefundController.findByInvoice);

export default router;
