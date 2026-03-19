import { Request, Response } from "express";
import { PatientService } from "./patient.service";

export class PatientController {
  static async create(req: any, res: Response) {
    try {
      const tenantId = req.user.tenantId;

      const patient = await PatientService.create(req.body, tenantId);

      res.status(201).json(patient);
    } catch (error) {
      res.status(500).json({ message: "Error creating patient" });
    }
  }

  static async findAll(req: any, res: Response) {
    try {
      const tenantId = req.user.tenantId;

      const patients = await PatientService.findAll(tenantId);

      res.json(patients);
    } catch (error) {
      res.status(500).json({ message: "Error fetching patients" });
    }
  }

  static async findById(req: any, res: Response) {
    try {
      const tenantId = req.user.tenantId;

      const patient = await PatientService.findById(
        req.params.id,
        tenantId
      );

      res.json(patient);
    } catch (error) {
      res.status(500).json({ message: "Error fetching patient" });
    }
  }

  static async update(req: any, res: Response) {
    try {
      const tenantId = req.user.tenantId;

      const patient = await PatientService.update(
        req.params.id,
        req.body,
        tenantId
      );

      res.json(patient);
    } catch (error) {
      res.status(500).json({ message: "Error updating patient" });
    }
  }

  static async findAppointments(req: any, res: Response) {
    try {
      const tenantId = req.user.tenantId;
      const appointments = await PatientService.findAppointments(req.params.id, tenantId);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Error fetching patient appointments" });
    }
  }

  static async findInvoices(req: any, res: Response) {
    try {
      const tenantId = req.user.tenantId;
      const invoices = await PatientService.findInvoices(req.params.id, tenantId);
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ message: "Error fetching patient invoices" });
    }
  }
}