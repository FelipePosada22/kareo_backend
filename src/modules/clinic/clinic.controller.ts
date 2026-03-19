import { Response } from "express";
import { ClinicService } from "./clinic.service";

export class ClinicController {
  static async get(req: any, res: Response) {
    try {
      const tenantId = req.user.tenantId;
      const clinic = await ClinicService.findByTenant(tenantId);
      res.json(clinic);
    } catch (error) {
      res.status(500).json({ message: "Error fetching clinic info" });
    }
  }

  static async update(req: any, res: Response) {
    try {
      const tenantId = req.user.tenantId;
      const clinic = await ClinicService.update(tenantId, req.body);
      res.json(clinic);
    } catch (error) {
      res.status(500).json({ message: "Error updating clinic info" });
    }
  }
}
