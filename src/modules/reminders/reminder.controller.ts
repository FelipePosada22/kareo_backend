import { Response } from "express";
import { ReminderService } from "./reminder.service";

export class ReminderController {
  static async sendManual(req: any, res: Response) {
    try {
      const tenantId = req.user.tenantId;
      const reminder = await ReminderService.sendManual(
        req.params.appointmentId,
        tenantId
      );
      res.status(201).json(reminder);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async findByAppointment(req: any, res: Response) {
    try {
      const tenantId = req.user.tenantId;
      const reminders = await ReminderService.findByAppointment(
        req.params.appointmentId,
        tenantId
      );
      res.json(reminders);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
