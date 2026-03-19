import { Response } from "express";
import { TreatmentPlanService } from "./treatmentPlan.service";

export class TreatmentPlanController {
  static async create(req: any, res: Response) {
    try {
      const tenantId = req.user.tenantId;
      const plan = await TreatmentPlanService.create(req.body, tenantId);
      res.status(201).json(plan);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async findAll(req: any, res: Response) {
    try {
      const tenantId = req.user.tenantId;
      const plans = await TreatmentPlanService.findAll(tenantId);
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Error fetching treatment plans" });
    }
  }

  static async findById(req: any, res: Response) {
    try {
      const tenantId = req.user.tenantId;
      const plan = await TreatmentPlanService.findById(req.params.id, tenantId);
      if (!plan) return res.status(404).json({ message: "Treatment plan not found" });
      res.json(plan);
    } catch (error) {
      res.status(500).json({ message: "Error fetching treatment plan" });
    }
  }

  static async updateItemStatus(req: any, res: Response) {
    try {
      const tenantId = req.user.tenantId;
      const { status } = req.body;
      const item = await TreatmentPlanService.updateItemStatus(req.params.itemId, status, tenantId);
      res.json(item);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async updateItem(req: any, res: Response) {
    try {
      const tenantId = req.user.tenantId;
      const item = await TreatmentPlanService.updateItem(req.params.itemId, req.body, tenantId);
      res.json(item);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async deleteItem(req: any, res: Response) {
    try {
      const tenantId = req.user.tenantId;
      await TreatmentPlanService.deleteItem(req.params.itemId, tenantId);
      res.json({ message: "Item deleted" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async remove(req: any, res: Response) {
    try {
      const tenantId = req.user.tenantId;
      await TreatmentPlanService.remove(req.params.id, tenantId);
      res.json({ message: "Treatment plan deleted" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async findByPatient(req: any, res: Response) {
    try {
      const tenantId = req.user.tenantId;
      const plans = await TreatmentPlanService.findByPatient(req.params.patientId, tenantId);
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Error fetching treatment plans" });
    }
  }
}
