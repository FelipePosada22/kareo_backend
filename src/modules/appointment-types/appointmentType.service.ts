import { prisma } from "../../config/prisma";

export class AppointmentTypeService {

  static async create(data: any, tenantId: string) {
    return prisma.appointmentType.create({
      data: {
        ...data,
        tenantId
      }
    });
  }

  static async findAll(tenantId: string) {
    return prisma.appointmentType.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" }
    });
  }

  static async findById(id: string, tenantId: string) {
    return prisma.appointmentType.findFirst({
      where: {
        id,
        tenantId
      }
    });
  }

  static async update(id: string, data: any, tenantId: string) {
    return prisma.appointmentType.updateMany({
      where: {
        id,
        tenantId
      },
      data
    });
  }

  static async delete(id: string, tenantId: string) {
    return prisma.appointmentType.deleteMany({
      where: {
        id,
        tenantId
      }
    });
  }

}