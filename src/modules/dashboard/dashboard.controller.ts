import { Response } from "express";
import { DashboardService } from "./dashboard.service";

export class DashboardController {
  static async getSummary(req: any, res: Response) {
    try {
      const tenantId = req.user.tenantId;

      const now = new Date();

      const startDate = req.query.startDate
        ? new Date(req.query.startDate as string)
        : new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

      const endDate = req.query.endDate
        ? new Date(req.query.endDate as string)
        : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      const summary = await DashboardService.getSummary(tenantId, startDate, endDate);

      res.json(summary);
    } catch (error) {
      res.status(500).json({ message: "Error fetching dashboard data" });
    }
  }
}
