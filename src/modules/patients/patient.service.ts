import { prisma } from "../../config/prisma";

export class PatientService {
  static async create(data: any, tenantId: string) {
    return prisma.patient.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  static async findAll(tenantId: string) {
    return prisma.patient.findMany({
      where: {
        tenantId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  static async findById(id: string, tenantId: string) {
    return prisma.patient.findFirst({
      where: {
        id,
        tenantId,
      },
    });
  }

  static async update(id: string, data: any, tenantId: string) {
    return prisma.patient.updateMany({
      where: {
        id,
        tenantId,
      },
      data,
    });
  }
}