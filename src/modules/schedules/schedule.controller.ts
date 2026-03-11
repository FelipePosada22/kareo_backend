import { Response } from "express";
import { ScheduleService } from "./schedule.service";

export class ScheduleController {

  static async create(req: any, res: Response) {

    const schedule = await ScheduleService.create(req.body);

    res.status(201).json(schedule);

  }

  static async findByProfessional(req: any, res: Response) {

    const schedules = await ScheduleService.findByProfessional(
      req.params.professionalId
    );

    res.json(schedules);

  }

  static async update(req: any, res: Response) {

    const schedule = await ScheduleService.update(
      req.params.id,
      req.body
    );

    res.json(schedule);

  }

  static async delete(req: any, res: Response) {

    await ScheduleService.delete(req.params.id);

    res.json({ message: "Schedule deleted" });

  }

}