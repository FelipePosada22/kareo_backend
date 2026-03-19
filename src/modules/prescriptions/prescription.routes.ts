import { Router } from "express";
import { PrescriptionController } from "./prescription.controller";
import { authMiddleware } from "../../shared/middleware/auth.middleware";

const router = Router();

router.post("/", authMiddleware, PrescriptionController.create);
router.get("/", authMiddleware, PrescriptionController.findAll);
router.get("/patient/:patientId", authMiddleware, PrescriptionController.findByPatient);
router.get("/:id", authMiddleware, PrescriptionController.findById);
router.patch("/:id/sign-doctor", authMiddleware, PrescriptionController.signDoctor);
router.patch("/:id/sign-patient", authMiddleware, PrescriptionController.signPatient);
router.patch("/:id/finalize", authMiddleware, PrescriptionController.finalize);

export default router;
