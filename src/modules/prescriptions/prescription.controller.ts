import { Response } from "express";
import { PrescriptionService } from "./prescription.service";

export class PrescriptionController {
  static async create(req: any, res: Response) {
    try {
      const tenantId = req.user.tenantId;
      const prescription = await PrescriptionService.create(req.body, tenantId);
      res.status(201).json(prescription);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async findAll(req: any, res: Response) {
    try {
      const tenantId = req.user.tenantId;
      const prescriptions = await PrescriptionService.findAll(tenantId);
      res.json(prescriptions);
    } catch (error) {
      res.status(500).json({ message: "Error fetching prescriptions" });
    }
  }

  static async findById(req: any, res: Response) {
    try {
      const tenantId = req.user.tenantId;
      const prescription = await PrescriptionService.findById(req.params.id, tenantId);
      if (!prescription) return res.status(404).json({ message: "Prescription not found" });
      res.json(prescription);
    } catch (error) {
      res.status(500).json({ message: "Error fetching prescription" });
    }
  }

  static async signDoctor(req: any, res: Response) {
    try {
      const tenantId = req.user.tenantId;
      const { signature } = req.body;
      const prescription = await PrescriptionService.signDoctor(req.params.id, signature, tenantId);
      res.json(prescription);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async signPatient(req: any, res: Response) {
    try {
      const tenantId = req.user.tenantId;
      const { signature, fingerprint } = req.body;
      const prescription = await PrescriptionService.signPatient(req.params.id, signature, fingerprint, tenantId);
      res.json(prescription);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async finalize(req: any, res: Response) {
    try {
      const tenantId = req.user.tenantId;
      const prescription = await PrescriptionService.finalize(req.params.id, tenantId);
      res.json(prescription);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async findByPatient(req: any, res: Response) {
    try {
      const tenantId = req.user.tenantId;
      const prescriptions = await PrescriptionService.findByPatient(req.params.patientId, tenantId);
      res.json(prescriptions);
    } catch (error) {
      res.status(500).json({ message: "Error fetching prescriptions" });
    }
  }
}
