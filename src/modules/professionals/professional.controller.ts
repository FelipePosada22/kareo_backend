import { Response } from "express";
import { ProfessionalService } from "./professional.service";

export class ProfessionalController {

  static async create(req: any, res: Response) {
    const tenantId = req.user.tenantId;

    const professional = await ProfessionalService.create(
      req.body,
      tenantId
    );

    res.status(201).json(professional);
  }

  static async findAll(req: any, res: Response) {
    const tenantId = req.user.tenantId;

    const professionals = await ProfessionalService.findAll(
      tenantId
    );

    res.json(professionals);
  }

  static async findById(req: any, res: Response) {
    const tenantId = req.user.tenantId;

    const professional = await ProfessionalService.findById(
      req.params.id,
      tenantId
    );

    res.json(professional);
  }

  static async update(req: any, res: Response) {
    const tenantId = req.user.tenantId;

    const professional = await ProfessionalService.update(
      req.params.id,
      req.body,
      tenantId
    );

    res.json(professional);
  }

  static async delete(req: any, res: Response) {
    const tenantId = req.user.tenantId;

    await ProfessionalService.delete(
      req.params.id,
      tenantId
    );

    res.json({ message: "Professional deleted" });
  }

}