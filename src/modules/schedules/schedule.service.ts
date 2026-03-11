import { prisma } from "../../config/prisma";

export class ScheduleService {

  static async create(data: any) {
    return prisma.schedule.create({
      data
    });
  }

  static async findByProfessional(professionalId: string) {
    return prisma.schedule.findMany({
      where: { professionalId },
      orderBy: { dayOfWeek: "asc" }
    });
  }

  static async update(id: string, data: any) {
    return prisma.schedule.update({
      where: { id },
      data
    });
  }

  static async delete(id: string) {
    return prisma.schedule.delete({
      where: { id }
    });
  }

}