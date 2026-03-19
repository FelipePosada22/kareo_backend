import { Response } from "express";
import { RefundService } from "./refund.service";

export class RefundController {
  static async create(req: any, res: Response) {
    try {
      const tenantId = req.user.tenantId;
      const refund = await RefundService.create(req.body, tenantId);
      res.status(201).json(refund);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async findByInvoice(req: any, res: Response) {
    try {
      const tenantId = req.user.tenantId;
      const refunds = await RefundService.findByInvoice(req.params.invoiceId, tenantId);
      res.json(refunds);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
