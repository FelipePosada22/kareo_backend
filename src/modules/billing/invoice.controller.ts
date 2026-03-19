import { Response } from "express";
import { InvoiceService } from "./invoice.service";

export class InvoiceController {
  static async create(req: any, res: Response) {
    try {
      const tenantId = req.user.tenantId;
      const invoice = await InvoiceService.create(req.body, tenantId);
      res.status(201).json(invoice);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async findAll(req: any, res: Response) {
    try {
      const tenantId = req.user.tenantId;
      const invoices = await InvoiceService.findAll(tenantId);
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ message: "Error fetching invoices" });
    }
  }

  static async findById(req: any, res: Response) {
    try {
      const tenantId = req.user.tenantId;
      const invoice = await InvoiceService.findById(req.params.id, tenantId);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ message: "Error fetching invoice" });
    }
  }

  static async updateStatus(req: any, res: Response) {
    try {
      const tenantId = req.user.tenantId;
      const { status } = req.body;
      const invoice = await InvoiceService.updateStatus(req.params.id, status, tenantId);
      res.json(invoice);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async addPayment(req: any, res: Response) {
    try {
      const tenantId = req.user.tenantId;
      const payment = await InvoiceService.addPayment(req.params.id, req.body, tenantId);
      res.status(201).json(payment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async createFromTreatmentPlan(req: any, res: Response) {
    try {
      const tenantId = req.user.tenantId;
      const invoice = await InvoiceService.createFromTreatmentPlan(
        req.params.treatmentPlanId,
        req.body,
        tenantId
      );
      res.status(201).json(invoice);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async getSummary(req: any, res: Response) {
    try {
      const tenantId = req.user.tenantId;
      const summary = await InvoiceService.getSummary(req.params.id, tenantId);
      res.json(summary);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async updateDraft(req: any, res: Response) {
    try {
      const tenantId = req.user.tenantId;
      const invoice = await InvoiceService.updateDraft(req.params.id, req.body, tenantId);
      res.json(invoice);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async addItem(req: any, res: Response) {
    try {
      const tenantId = req.user.tenantId;
      const item = await InvoiceService.addItem(req.params.id, req.body, tenantId);
      res.status(201).json(item);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async updateItem(req: any, res: Response) {
    try {
      const tenantId = req.user.tenantId;
      const item = await InvoiceService.updateItem(req.params.id, req.params.itemId, req.body, tenantId);
      res.json(item);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async removeItem(req: any, res: Response) {
    try {
      const tenantId = req.user.tenantId;
      await InvoiceService.removeItem(req.params.id, req.params.itemId, tenantId);
      res.json({ message: "Item removed" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
