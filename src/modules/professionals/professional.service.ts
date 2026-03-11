import { prisma } from "../../config/prisma";

export class ProfessionalService {

  static async create(data: any, tenantId: string) {
    return prisma.professional.create({
      data: {
        ...data,
        tenantId
      }
    });
  }

  static async findAll(tenantId: string) {
    return prisma.professional.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" }
    });
  }

  static async findById(id: string, tenantId: string) {
    return prisma.professional.findFirst({
      where: {
        id,
        tenantId
      }
    });
  }

  static async update(id: string, data: any, tenantId: string) {
    return prisma.professional.updateMany({
      where: {
        id,
        tenantId
      },
      data
    });
  }

  static async delete(id: string, tenantId: string) {
    return prisma.professional.deleteMany({
      where: {
        id,
        tenantId
      }
    });
  }

}