import { Request, Response } from "express";
import { AppointmentService } from "./appointment.service";

export class AppointmentController {

static async create(req: any, res: Response) {
  try {

    const tenantId = req.user.tenantId;

    const appointment = await AppointmentService.create(
      req.body,
      tenantId
    );

    res.status(201).json(appointment);

  } catch (error: any) {

    res.status(400).json({
      message: error.message
    });

  }
}

  static async findAll(req: any, res: Response) {
    try {
      const tenantId = req.user.tenantId;

      const appointments = await AppointmentService.findAll(
        tenantId
      );

      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Error fetching appointments" });
    }
  }

  static async findById(req: any, res: Response) {
    try {
      const tenantId = req.user.tenantId;

      const appointment = await AppointmentService.findById(
        req.params.id,
        tenantId
      );

      res.json(appointment);
    } catch (error) {
      res.status(500).json({ message: "Error fetching appointment" });
    }
  }

  static async update(req: any, res: Response) {
    try {
      const tenantId = req.user.tenantId;

      const appointment = await AppointmentService.update(
        req.params.id,
        req.body,
        tenantId
      );

      res.json(appointment);
    } catch (error) {
      res.status(500).json({ message: "Error updating appointment" });
    }
  }

  static async delete(req: any, res: Response) {
    try {
      const tenantId = req.user.tenantId;

      await AppointmentService.delete(
        req.params.id,
        tenantId
      );

      res.json({ message: "Appointment deleted" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting appointment" });
    }
  }

}