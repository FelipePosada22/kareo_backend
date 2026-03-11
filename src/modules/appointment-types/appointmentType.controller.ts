import { Response } from "express";
import { AppointmentTypeService } from "./appointmentType.service";

export class AppointmentTypeController {

  static async create(req: any, res: Response) {
    const tenantId = req.user.tenantId;

    const appointmentType = await AppointmentTypeService.create(
      req.body,
      tenantId
    );

    res.status(201).json(appointmentType);
  }

  static async findAll(req: any, res: Response) {
    const tenantId = req.user.tenantId;

    const appointmentTypes = await AppointmentTypeService.findAll(
      tenantId
    );

    res.json(appointmentTypes);
  }

  static async findById(req: any, res: Response) {
    const tenantId = req.user.tenantId;

    const appointmentType = await AppointmentTypeService.findById(
      req.params.id,
      tenantId
    );

    res.json(appointmentType);
  }

  static async update(req: any, res: Response) {
    const tenantId = req.user.tenantId;

    const appointmentType = await AppointmentTypeService.update(
      req.params.id,
      req.body,
      tenantId
    );

    res.json(appointmentType);
  }

  static async delete(req: any, res: Response) {
    const tenantId = req.user.tenantId;

    await AppointmentTypeService.delete(
      req.params.id,
      tenantId
    );

    res.json({ message: "Appointment type deleted" });
  }

}