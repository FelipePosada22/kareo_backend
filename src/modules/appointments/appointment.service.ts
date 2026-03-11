import { prisma } from "../../config/prisma";

export class AppointmentService {

 static async create(data: any, tenantId: string) {

    const { professionalId, startTime, endTime } = data;

    const overlapping = await prisma.appointment.findFirst({
      where: {
        tenantId,
        professionalId,
        startTime: {
          lt: new Date(endTime)
        },
        endTime: {
          gt: new Date(startTime)
        }
      }
    });

    if (overlapping) {
      throw new Error("Professional already has an appointment in this time range");
    }

    return prisma.appointment.create({
      data: {
        ...data,
        tenantId
      },
      include: {
        patient: true,
        professional: true,
        appointmentType: true
      }
    });
  }

  static async findAll(tenantId: string) {
    return prisma.appointment.findMany({
      where: { tenantId },
      include: {
        patient: true,
        professional: true,
        appointmentType: true,
      },
      orderBy: {
        startTime: "asc",
      },
    });
  }

  static async findById(id: string, tenantId: string) {
    return prisma.appointment.findFirst({
      where: {
        id,
        tenantId,
      },
      include: {
        patient: true,
        professional: true,
        appointmentType: true,
      },
    });
  }

  static async update(id: string, data: any, tenantId: string) {
    return prisma.appointment.updateMany({
      where: {
        id,
        tenantId,
      },
      data,
    });
  }

  static async delete(id: string, tenantId: string) {
    return prisma.appointment.deleteMany({
      where: {
        id,
        tenantId,
      },
    });
  }

}